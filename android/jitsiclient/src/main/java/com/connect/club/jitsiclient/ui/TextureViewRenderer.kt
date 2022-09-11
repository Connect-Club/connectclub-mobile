package com.connect.club.jitsiclient.ui

import android.content.Context
import android.content.res.Resources
import android.graphics.Point
import android.graphics.SurfaceTexture
import android.util.AttributeSet
import android.view.TextureView
import com.connect.club.jitsiclient.BuildConfig
import org.webrtc.*
import java.util.concurrent.CountDownLatch
import java.util.concurrent.atomic.AtomicBoolean

private const val FIRST_FRAMES_TRIGGER_COUNT = 3

/**
 * Original
 * https://github.com/pvasilev96/android-webrtc-demo/blob/1b5721ae6f2ed6f08a9d59bcc1c8b9ea02038ba2/webrtc-client/src/main/java/com/pvasilev/webrtc_client/TextureViewRenderer.kt
 */
open class TextureViewRenderer : TextureView, TextureView.SurfaceTextureListener, VideoSink {
    var currentStreamId: String? = null

    private val eglRenderer: EglRenderer
    private val resourceName: String
        get() = try {
            "${resources.getResourceEntryName(id)}: "
        } catch (e: Resources.NotFoundException) {
            ""
        }
    private val lock = Any()
    private val videoLayoutMeasure = RendererCommon.VideoLayoutMeasure()
    private var isFirstFrameRendered = false
    private var isRenderingPaused = false
    private var rotatedFrameWidth = 0
    private var rotatedFrameHeight = 0
    private var frameRotation = 0
    private var rendererEvents: RendererCommon.RendererEvents? = null
    private val initialized = AtomicBoolean(false)
    private var frameCounter = 0

    @Volatile
    private var onFirstFrameDisposableListener: (() -> Unit)? = null

    constructor(context: Context) : super(context) {
        eglRenderer = EglRenderer(resourceName)
        surfaceTextureListener = this
    }

    constructor(context: Context, attrs: AttributeSet?) : super(context, attrs) {
        eglRenderer = EglRenderer(resourceName)
        surfaceTextureListener = this
    }

    fun init(sharedContext: EglBase.Context, rendererEvents: RendererCommon.RendererEvents?) =
        init(sharedContext, rendererEvents, EglBase.CONFIG_PLAIN, GlRectDrawer())

    open fun init(
        sharedContext: EglBase.Context,
        rendererEvents: RendererCommon.RendererEvents?,
        configAttributes: IntArray,
        drawer: RendererCommon.GlDrawer,
    ) {
        if (initialized.compareAndSet(false, true)) {
            ThreadUtils.checkIsOnMainThread()
            this.rendererEvents = rendererEvents
            synchronized(lock) {
                isFirstFrameRendered = false
                rotatedFrameWidth = 0
                rotatedFrameHeight = 0
                frameRotation = 0
            }
            eglRenderer.init(sharedContext, configAttributes, drawer)
        }
    }

    open fun release() {
        if (initialized.compareAndSet(true, false)) {
            onFirstFrameDisposableListener = null
            eglRenderer.release()
        }
    }

    fun setFirstFrameDisposableListener(callback: () -> Unit) {
        frameCounter = 0
        onFirstFrameDisposableListener = callback
    }

    fun setMirror(mirror: Boolean) = eglRenderer.setMirror(mirror)

    override fun onMeasure(widthSpec: Int, heightSpec: Int) {
        ThreadUtils.checkIsOnMainThread()
        var size: Point? = null
        synchronized(lock) {
            size = videoLayoutMeasure.measure(widthSpec, heightSpec, rotatedFrameWidth, rotatedFrameHeight)
        }
        if (size != null) {
            setMeasuredDimension(size!!.x, size!!.y)
        }
    }

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        ThreadUtils.checkIsOnMainThread()
        eglRenderer.setLayoutAspectRatio((right - left) / (bottom - top).toFloat())
    }

    override fun onFrame(frame: VideoFrame) {
        updateFrameDimensionsAndReportEvents(frame)
        if (initialized.get() && frame.buffer.width != 0 && frame.buffer.height != 0 && measuredHeight != 0 && measuredWidth != 0) {
            eglRenderer.onFrame(frame)
        }
    }

    override fun onSurfaceTextureAvailable(surface: SurfaceTexture, width: Int, height: Int) {
        ThreadUtils.checkIsOnMainThread()
        try {
            if (initialized.get()) {
                eglRenderer.createEglSurface(surface)
            }
        } catch (e: Exception) {
            if (BuildConfig.DEBUG) e.printStackTrace()
        }
    }

    override fun onSurfaceTextureSizeChanged(surface: SurfaceTexture, width: Int, height: Int) = Unit

    override fun onSurfaceTextureUpdated(surface: SurfaceTexture) {
        onFirstFrameDisposableListener?.let {
            if (frameCounter < FIRST_FRAMES_TRIGGER_COUNT) {
                frameCounter++
            } else {
                onFirstFrameDisposableListener = null
                it.invoke()
            }
        }
    }

    override fun onSurfaceTextureDestroyed(surface: SurfaceTexture): Boolean {
        ThreadUtils.checkIsOnMainThread()
        val completionLatch = CountDownLatch(1)
        val code = hashCode()
        eglRenderer.releaseEglSurface {
            completionLatch.countDown()
        }
        ThreadUtils.awaitUninterruptibly(completionLatch)
        return true
    }

    private fun updateFrameDimensionsAndReportEvents(frame: VideoFrame) {
        synchronized(lock) {
            if (isRenderingPaused) {
                return
            }
            if (!isFirstFrameRendered) {
                isFirstFrameRendered = true
                if (rendererEvents != null) {
                    rendererEvents?.onFirstFrameRendered()
                }
            }
            if (rotatedFrameWidth != frame.rotatedWidth ||
                rotatedFrameHeight != frame.rotatedHeight ||
                frameRotation != frame.rotation
            ) {
                if (rendererEvents != null) {
                    rendererEvents?.onFrameResolutionChanged(frame.rotatedWidth, frame.rotatedHeight, frame.rotation)
                }
                rotatedFrameWidth = frame.rotatedWidth
                rotatedFrameHeight = frame.rotatedHeight
                frameRotation = frame.rotation
                post {
                    requestLayout()
                }
            }
        }
    }
}

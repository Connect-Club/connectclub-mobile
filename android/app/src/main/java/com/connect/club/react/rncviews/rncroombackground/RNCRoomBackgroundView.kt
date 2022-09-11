package com.connect.club.react.rncviews.rncroombackground

import android.content.Context
import android.content.res.Resources
import android.graphics.Canvas
import android.graphics.drawable.Drawable
import android.util.Size
import android.view.ViewGroup
import android.widget.ImageView
import androidx.annotation.RawRes
import com.bumptech.glide.Glide
import com.bumptech.glide.load.DataSource
import com.bumptech.glide.load.DecodeFormat
import com.bumptech.glide.load.engine.GlideException
import com.bumptech.glide.load.resource.drawable.DrawableTransitionOptions
import com.bumptech.glide.request.RequestListener
import com.bumptech.glide.request.target.Target
import com.connect.club.react.bridge.iosLike.debugP
import com.connect.club.react.rncviews.rncroombackground.MemoryImageView.Companion.getAdjustedBitmapSize
import com.connect.club.utils.replaceSize
import com.connect.club.utils.runOnMainThread
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.facebook.react.views.view.ReactViewGroup

class RNCRoomBackgroundView constructor(context: Context) : ReactViewGroup(context) {

    private val imageView: ImageView by lazy(LazyThreadSafetyMode.NONE) { ImageView(context) }
    private var memoryImageView: MemoryImageView? = null
    private var onImageSizeComputedListener: ((Int, Int) -> Unit)? = null
    private lateinit var presenter: RoomBackgroundPresenter

    private val loadRequestListener = object : RequestListener<Drawable?> {
        override fun onLoadFailed(
            e: GlideException?,
            model: Any?,
            target: Target<Drawable?>?,
            isFirstResource: Boolean
        ): Boolean {
            e?.printStackTrace()
            debugP("background load error", e)
            presenter.onImageLoadFailed()
            return false
        }

        override fun onResourceReady(
            resource: Drawable?,
            model: Any?,
            target: Target<Drawable?>?,
            dataSource: DataSource?,
            isFirstResource: Boolean
        ): Boolean {
            debugP("background loaded")
            (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
                .receiveEvent(id, "onBackgroundLoaded", Arguments.createMap())
            return false
        }
    }

    fun init(presenter: RoomBackgroundPresenter) {
        this.presenter = presenter
    }

    fun computeMaxBitmapSize(onComputed: (Int, Int) -> Unit) {
        onImageSizeComputedListener = onComputed
        memoryImageView = MemoryImageView(context)
        addView(memoryImageView)
        if (width > 0 && height > 0) {
            imageView.bringToFront()
            measureAndLayoutViews(width, height)
        }
    }

    fun render(src: String, size: Size, @RawRes resId: Int) {
        println("🔦 render size ${size.width}x${size.height}")
        debugP("Load background with preferred size: ", size.width, size.height)
        Glide.with(this).run {
            if (resId != 0) {
                load(resId)
            } else {
                load(replaceSize(src, size.width, size.height))
            }
        }.override(size.width, size.height)
            // https://proandroiddev.com/how-to-optimize-memory-consumption-when-using-glide-9ac984cfe70f
            // .format(DecodeFormat.PREFER_RGB_565)
            .listener(loadRequestListener)
            .into(imageView)
    }

    override fun dispatchDraw(canvas: Canvas) {
        super.dispatchDraw(canvas)
        if (onImageSizeComputedListener != null) {
            memoryImageView?.sizeListener = onImageSizeComputedListener
            val preferredSize = getAdjustedBitmapSize(MemoryImageView.MAX_SIZE_DEFAULT, context)
            val selectedSize = minOf(
                minOf(canvas.maximumBitmapWidth, canvas.maximumBitmapHeight),
                preferredSize
            )
            debugP("preferred max bitmap size", preferredSize)
            debugP("selected bitmap size", selectedSize)
            memoryImageView?.start(selectedSize)
            onImageSizeComputedListener = null
        }
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)
        measureAndLayoutViews(w, h)
    }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()

        addView(imageView)
    }

    override fun onDetachedFromWindow() {
        removeView(imageView)
        (memoryImageView?.parent as? ViewGroup)?.removeView(memoryImageView)
        memoryImageView = null
        super.onDetachedFromWindow()
    }

    private fun measureAndLayoutViews(w: Int, h: Int) {
        imageView.measure(
            MeasureSpec.makeMeasureSpec(w, MeasureSpec.EXACTLY),
            MeasureSpec.makeMeasureSpec(h, MeasureSpec.EXACTLY)
        )
        imageView.layout(0, 0, w, h)
        memoryImageView?.let {
            it.measure(
                MeasureSpec.makeMeasureSpec(w, MeasureSpec.EXACTLY),
                MeasureSpec.makeMeasureSpec(h, MeasureSpec.EXACTLY)
            )
            it.layout(0, 0, w, h)
        }
        imageView.bringToFront()
    }
}
package com.connect.club.react.bridge.iosLike.ui

import android.animation.Animator
import android.animation.AnimatorSet
import android.animation.ObjectAnimator
import android.content.Context
import android.content.res.ColorStateList
import android.graphics.*
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.ViewGroup.LayoutParams.WRAP_CONTENT
import android.widget.Button
import android.widget.FrameLayout
import android.widget.ImageView
import androidx.core.animation.doOnEnd
import androidx.core.animation.doOnStart
import androidx.core.view.doOnLayout
import androidx.core.view.isVisible
import com.connect.club.MainActivity
import com.connect.club.R
import com.connect.club.react.bridge.iosLike.debugP
import com.connect.club.react.rncviews.rncsurfacevideoview.RNCSurfaceVideoVideoView
import com.connect.club.utils.collapseTo
import com.connect.club.utils.expandFullScreen
import com.connect.club.utils.runOnMainThread
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.google.android.material.floatingactionbutton.FloatingActionButton
import com.otaliastudios.zoom.ZoomLayout
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch
import org.webrtc.EglBase
import kotlin.coroutines.resume
import kotlin.coroutines.suspendCoroutine

private val COLLAPSE_ICON_SIZE = PixelUtil.toPixelFromDIP(48F).toInt()
private const val COLLAPSE_BTN_AUTO_HIDE_TIMEOUT = 3000L
private const val SHARE_SCREEN_HUD_CONTENT_DESCRIPTION = "shareScreenHUD"
private const val MAX_FULLSCREEN_ZOOM = 3F

class ShareDesktopContainerView(context: Context) : FrameLayout(context) {

    //region screenshot
    private var screenShotBitmap: Bitmap? = null
    //endregion

    private val dimView = FrameLayout(context).apply {
        setBackgroundColor(Color.BLACK)
        alpha = 0F
        isClickable = true
        isFocusable = true
    }
    private val collapseButton = FloatingActionButton(context).apply {
        setImageResource(R.drawable.ic_fullscreen_close)
        backgroundTintList = ColorStateList.valueOf(Color.WHITE)
        scaleType = ImageView.ScaleType.CENTER
        alpha = 0F
    }
    private val autoHideRunnable = Runnable {
        hideControls()
    }
    private var expandAnimation: AnimatorSet? = null
    private var isMaximized = false
    private var screenHUD: View? = null

    var videoView: RNCSurfaceVideoVideoView? = null

    var allowToShare = false
        set(value) {
            field = value
            buttonShare.alpha = if (value) 1f else 0f
            buttonShare.isEnabled = value
        }

    var buttonShare = Button(context)

    @Volatile
    var isLocked = false

    private fun addChildViewInternal(child: View, index: Int? = null, params: ViewGroup.LayoutParams? = null): Boolean {
        if (child.contentDescription == SHARE_SCREEN_HUD_CONTENT_DESCRIPTION) {
            screenHUD = child
            return true
        }
        return false
    }

    override fun addView(child: View, index: Int) {
        if (!addChildViewInternal(child = child, index = index)) super.addView(child, index)
    }

    override fun addView(child: View, index: Int, params: ViewGroup.LayoutParams) {
        if (!addChildViewInternal(child = child, index = index, params = params)) super.addView(child, index, params)
    }

    override fun removeView(view: View) {
        if (view.contentDescription == SHARE_SCREEN_HUD_CONTENT_DESCRIPTION) {
            screenHUD?.let {
                (it.parent as ViewGroup?)?.removeView(it)
            }
            screenHUD = null
        }
        super.removeView(view)
    }

    fun switchScreenShotMode(enable: Boolean) {
        val textureView = videoView ?: return
        val w = textureView.width
        val h = textureView.height
        if (enable) {
            if (!isVisible || w == 0 || h == 0 || !textureView.isFirstFrameRendered) return
            val bitmap: Bitmap = textureView.getBitmap(Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888))
            textureView.isVisible = false
            screenShotBitmap = bitmap
            setWillNotDraw(false)
        } else {
            textureView.isVisible = true
            setWillNotDraw(true)
            screenShotBitmap = null
        }
    }

    override fun onDraw(canvas: Canvas) {
        screenShotBitmap?.also {
            val countCanvasSave: Int = canvas.save()
            canvas.drawBitmap(it, 0F, 0F, null)
            canvas.restoreToCount(countCanvasSave)
        } ?: super.onDraw(canvas)
    }

    private fun setupShareButton() {
        if (buttonShare.parent != null) return
        val buttonHeightPx = (measuredHeight * 0.203f).toInt()
        val textSizeSp = measuredHeight * 0.033f
        val hPaddingPx = (measuredWidth * 0.08f).toInt()
        addView(buttonShare, LayoutParams(WRAP_CONTENT, buttonHeightPx, Gravity.CENTER))
        buttonShare.text = "Tap to share screen"
        buttonShare.contentDescription = "shareScreenButton"
        buttonShare.setTextSize(TypedValue.COMPLEX_UNIT_SP, textSizeSp)
        buttonShare.isAllCaps = false
        buttonShare.setBackgroundResource(R.drawable.button_share_screen_bg)
        buttonShare.setTextColor(Color.WHITE)
        buttonShare.setPadding(hPaddingPx, 0, hPaddingPx, 0)
        buttonShare.setTypeface(Typeface.SANS_SERIF, Typeface.NORMAL)
        buttonShare.setOnClickListener {
            (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
                .receiveEvent(id, "onShareClick", Arguments.createMap())
        }
        buttonShare.measure(
            MeasureSpec.makeMeasureSpec(measuredWidth, MeasureSpec.AT_MOST),
            MeasureSpec.makeMeasureSpec(buttonHeightPx, MeasureSpec.AT_MOST)
        )
        buttonShare.layout(0, 0, buttonShare.measuredWidth, buttonShare.measuredHeight)
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec)
        setupShareButton()
    }

    fun enableVideo(userId: String) {
        debugP("📇 enableVideo", isLocked, videoView == null)
        if (isLocked) return
        if (videoView == null) {
            isLocked = true
            val videoView = RNCSurfaceVideoVideoView(context)
            this.videoView = videoView
            setupVideoView(videoView, userId)
        }
        videoView?.enableVideo(null)
    }

    fun disableVideo() {
        debugP("📇 disableVideo", isLocked, videoView == null)
        if (isLocked) return
        if (videoView == null) return
        isLocked = true
        GlobalScope.launch(Dispatchers.Main) {
            forceCollapse()
            debugP("📇 disableVideo after collapse", isLocked, videoView == null)
            setBackgroundColor(Color.TRANSPARENT)
            (videoView?.parent as? ViewGroup)?.removeView(videoView!!)
            videoView?.disableVideo(null)
            videoView = null
            isLocked = false
            isMaximized = false
            buttonShare.isVisible = allowToShare
        }
    }

    suspend fun forceCollapse() {
        debugP("📇 forceCollapse", isMaximized, this.videoView)
        if (!isMaximized) return
        val videoView = this.videoView ?: return
        animateCollapse(videoView)
        transplantToHome(videoView)
    }

    private fun setupVideoView(videoView: RNCSurfaceVideoVideoView, userId: String) {
        runOnMainThread {
            videoView.setTrackId(userId)
            addView(videoView, LayoutParams(width, height))
            videoView.init(EglBase.create().eglBaseContext, null)
            videoView.measure(
                MeasureSpec.makeMeasureSpec(width, MeasureSpec.EXACTLY),
                MeasureSpec.makeMeasureSpec(height, MeasureSpec.EXACTLY)
            )
            videoView.layout(0, 0, width, height)
            requestLayout()
            videoView.enableVideo(null)
            isLocked = false
            buttonShare.isVisible = false
            videoView.setOnClickListener {
                if (buttonShare.isVisible) return@setOnClickListener
                if (isMaximized) {
                    if (collapseButton.alpha == 1F) hideControls() else showControls()
                } else {
                    AppManager.newJitsi?.appModule?.onAnalyticsEvent("click_video_screen_fullscreen")
                    transplantToRoot(videoView)?.doOnLayout { animateExpand(videoView) }
                }
            }
        }
    }

    private fun setupControls(videoView: RNCSurfaceVideoVideoView) {
        collapseButton.alpha = 0F
        screenHUD?.alpha = 0F
        collapseButton.setOnClickListener {
            if (collapseButton.alpha != 1F) {
                dimView.performClick()
                return@setOnClickListener
            }
            GlobalScope.launch(Dispatchers.Main) {
                animateCollapse(videoView)
                transplantToHome(videoView)
            }
        }
    }

    private fun setupDimView() {
        dimView.setOnClickListener {
            if (!isMaximized) return@setOnClickListener
            if (collapseButton.alpha == 1F) hideControls() else showControls()
        }
    }

    private fun transplantToRoot(videoView: RNCSurfaceVideoVideoView): ZoomLayout? {
        val position = Rect()
        getGlobalVisibleRect(position)
        val window = MainActivity.instance?.window ?: return null
        val parent = videoView.parent as? ViewGroup ?: return null
        val rootView = window.decorView.findViewById(android.R.id.content) as? ViewGroup ?: return null
        val rootW = rootView.width
        val rootH = rootView.height
        rootView.addView(dimView, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT))
        setupDimView()
        videoView.isInTransplantation = true
        parent.removeView(videoView)
        videoView.translationX = position.left.toFloat()
        videoView.translationY = position.top.toFloat()

        // Video wrappers
        val videoContainer = FrameLayout(context)
        val zoomView = makeZoomView(context, rootW, rootH)
        rootView.addView(zoomView, LayoutParams(rootW, rootH))
        zoomView.addView(videoContainer, LayoutParams(rootW, rootH))
        videoContainer.addView(videoView, LayoutParams(width, height))

        videoView.isInTransplantation = false
        collapseButton.alpha = 0F
        rootView.addView(
            collapseButton,
            LayoutParams(COLLAPSE_ICON_SIZE, COLLAPSE_ICON_SIZE, Gravity.START or Gravity.BOTTOM).also {
                it.leftMargin = PixelUtil.toPixelFromDIP(16F).toInt()
                it.bottomMargin = PixelUtil.toPixelFromDIP(46F).toInt()
            }
        )
        screenHUD?.also { rootView.addView(it, LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)) }
        setupControls(videoView)
        isMaximized = true
        sendStateChange(true)
        return zoomView
    }

    private suspend fun transplantToHome(videoView: RNCSurfaceVideoVideoView) {
        suspendCoroutine<Unit> { continuation ->
            val parent = videoView.parent.parent.parent as? ViewGroup
            if (parent == null) {
                continuation.resume(Unit)
                return@suspendCoroutine
            }
            videoView.isInTransplantation = true
            handler?.removeCallbacks(autoHideRunnable)
            (collapseButton.parent as? ViewGroup)?.removeView(collapseButton)
            screenHUD?.let { (it.parent as ViewGroup?)?.removeView(it) }
            parent.removeView(dimView)
            val homeRect = Rect()
            getHitRect(homeRect)
            videoView.layoutParams.width = homeRect.width()
            videoView.layoutParams.height = homeRect.height()
            videoView.requestLayout()
            videoView.doOnLayout {
                val videoContainer = videoView.parent as ViewGroup
                val zoomView = videoContainer.parent as ViewGroup
                parent.removeView(zoomView)
                zoomView.removeView(videoContainer)
                videoContainer.removeView(videoView)
                videoView.translationX = 0F
                videoView.translationY = 0F
                addView(videoView, LayoutParams(homeRect.width(), homeRect.height()))
                videoView.isInTransplantation = false
                isMaximized = false
                sendStateChange(false)
                continuation.resume(Unit)
            }
        }
    }

    private fun animateExpand(videoView: View) {
        this.expandAnimation?.cancel()
        this.expandAnimation?.removeAllListeners()
        val expandAnimation = videoView.expandFullScreen(homeView = this, dimView = dimView) {
            showControls()
        }
        this.expandAnimation = expandAnimation
        expandAnimation.start()
    }

    private suspend fun animateCollapse(videoView: RNCSurfaceVideoVideoView): Animator =
        suspendCoroutine { continuation ->
            handler?.removeCallbacks(autoHideRunnable)
            (collapseButton.parent as? ViewGroup)?.removeView(collapseButton)
            screenHUD?.let { (it.parent as ViewGroup?)?.removeView(it) }
            this.expandAnimation?.cancel()
            this.expandAnimation?.removeAllListeners()
            val position = Rect()
            getGlobalVisibleRect(position)
            val expandAnimation = videoView.collapseTo(position, dimView, continuation::resume)
            this.expandAnimation = expandAnimation
            expandAnimation.start()
        }

    private fun showControls() {
        if (collapseButton.alpha == 1F) return
        val buttonAnimator = ObjectAnimator.ofFloat(collapseButton, View.ALPHA, collapseButton.alpha, 1F)
        val animators = mutableListOf<ObjectAnimator>(buttonAnimator)
        this.screenHUD?.let { screenHUD ->
            if (screenHUD.alpha == 1F) return@let
            animators.add(ObjectAnimator.ofFloat(screenHUD, View.ALPHA, screenHUD.alpha, 1F))
        }
        AnimatorSet().apply {
            playTogether(animators.toList())
            doOnStart {
                collapseButton.isVisible = true
                screenHUD?.isVisible = true
            }
        }.start()
        handler?.postDelayed(autoHideRunnable, COLLAPSE_BTN_AUTO_HIDE_TIMEOUT + buttonAnimator.duration)
    }

    private fun hideControls() {
        if (collapseButton.alpha == 0F) return
        handler?.removeCallbacks(autoHideRunnable)
        val animators =
            mutableListOf<ObjectAnimator>(ObjectAnimator.ofFloat(collapseButton, View.ALPHA, collapseButton.alpha, 0F))
        this.screenHUD?.let { screenHUD ->
            if (screenHUD.alpha == 0F) return@let
            animators.add(
                ObjectAnimator.ofFloat(screenHUD, View.ALPHA, screenHUD.alpha, 0F)
            )
        }
        AnimatorSet().apply {
            playTogether(animators.toList())
            doOnEnd {
                collapseButton.isVisible = false
                screenHUD?.isVisible = false
            }
        }.start()
    }

    private fun sendStateChange(expanded: Boolean) {
        if (!isAttachedToWindow) return
        val args = Arguments.createMap()
        args.putBoolean("expanded", expanded)
        (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(id, "onStateChange", args)
    }
}

private fun makeZoomView(context: Context, width: Int, height: Int): ZoomLayout =
    ZoomLayout(context).apply {
        engine.setContentSize(width.toFloat(), height.toFloat())
        engine.setContainerSize(width.toFloat(), height.toFloat())
        engine.setMinZoom(1F)
        engine.setMaxZoom(MAX_FULLSCREEN_ZOOM)
        engine.zoomTo(1F, animate = false)
        isClickable = true
        clipChildren = false
        clipToPadding = false
        setHasClickableChildren(true)
        setOverScrollHorizontal(false)
        setOverScrollVertical(false)
    }
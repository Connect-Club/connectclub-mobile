package com.connect.club.react.bridge.iosLike.ui

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Path
import android.view.View
import androidx.core.view.isVisible
import com.connect.club.react.bridge.iosLike.AppTrackStore
import com.connect.club.react.rncviews.rncsurfacevideoview.RNCSurfaceVideoVideoView
import com.facebook.react.views.view.ReactViewGroup
import org.json.JSONObject

class SpeakerVideoViewContainer(context: Context) : ReactViewGroup(context) {

    //region screenshot
    private var screenShotBitmap: Bitmap? = null
    private var clipPath: Path? = null
    private var borderWidth: Float = 0F
    //endregion

    private var activityIndicator = RippleView(context, 1000, 0, 0f, Color.WHITE).also {
        it.visibility = GONE
    }
    private var subscriberView: RNCSurfaceVideoVideoView? = null

    init {
        isClickable = false
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        activityIndicator.release()
    }

    override fun addView(child: View, index: Int) {
        super.addView(child, index)
        if (child is RNCSurfaceVideoVideoView) {
            subscriberView = child
            addView(activityIndicator)
        }
    }

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        super.onLayout(changed, left, top, right, bottom)
        activityIndicator.layout(0, 0, right, bottom)
    }

    fun onState(state: JSONObject, userId: String) {
        if (state.getBoolean("isExpired")) {
            subscriberView?.disableVideo(activityIndicator)
            return
        }
        val isCurrent = userId == AppTrackStore.instance.mainParticipant?.endpoint
        val inRadar = state.getBoolean("inRadar") || isCurrent
        val video = state.getBoolean("video")
        val isCurrentUser = AppManager.localUserId == userId
        if (isCurrentUser) {
            subscriberView?.isVisible = inRadar && video
        } else {
            subscriberView?.isVisible = inRadar && video
        }
        if (inRadar && video) {
            subscriberView?.enableVideo(activityIndicator)
        } else {
            subscriberView?.disableVideo(activityIndicator)
        }
    }

    fun hideVideo() {
        subscriberView?.visibility = View.GONE
    }

    fun unhideVideo() {
        subscriberView?.visibility = View.VISIBLE
        resetFirstFrame()
    }

    fun disableVideo() {
        subscriberView?.disableVideo(activityIndicator)
    }

    fun enableVideo() {
        subscriberView?.enableVideo(activityIndicator)
    }

    fun resetFirstFrame() {
        subscriberView?.resetFirstFrame(activityIndicator)
    }

    fun switchScreenShotMode(enable: Boolean) {
        val textureView = subscriberView ?: return
        val w = textureView.width
        val h = textureView.height
        if (enable) {
            if (!isVisible || w == 0 || h == 0 || !textureView.isFirstFrameRendered) return
            val bitmap: Bitmap = textureView.getBitmap(Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888))
            textureView.isVisible = false
            clipPath = Path()
            borderWidth = w / 40F
            val r = w / 2F - borderWidth
            clipPath!!.addCircle(r + borderWidth, r + borderWidth, r, Path.Direction.CCW)
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
            canvas.clipPath(clipPath!!)
            canvas.drawBitmap(it, 0F, 0F, null)
            canvas.restoreToCount(countCanvasSave)
        } ?: super.onDraw(canvas)
    }

    fun mirror(isMirror: Boolean) {
        subscriberView?.setMirror(isMirror)
    }
}

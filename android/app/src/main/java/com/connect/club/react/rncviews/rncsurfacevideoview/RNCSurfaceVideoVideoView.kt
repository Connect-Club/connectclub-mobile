package com.connect.club.react.rncviews.rncsurfacevideoview

import android.content.Context
import androidx.core.view.isVisible
import com.connect.club.jitsiclient.ui.TextureViewRenderer
import com.connect.club.react.bridge.iosLike.AppTrackStore
import com.connect.club.react.bridge.iosLike.RTCVideoTrack
import com.connect.club.react.bridge.iosLike.debugP
import com.connect.club.react.bridge.iosLike.ui.AppManager
import com.connect.club.react.bridge.iosLike.ui.RippleView
import com.connect.club.utils.runOnMainThread
import org.webrtc.VideoTrack

class RNCSurfaceVideoVideoView(context: Context) : TextureViewRenderer(context) {

    private var currentTrack: VideoTrack? = null
    var isFirstFrameRendered = false
    var isInTransplantation = false

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        currentTrack?.addSink(this)
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        if (isInTransplantation) return
        unsubscribe()
        release()
        debugP("RNCSurfaceVideoVideoView onDetachedFromWindow", hashCode())
    }

    override fun release() {
        unsubscribe()
        super.release()
    }

    fun resetFirstFrame(activityIndicator: RippleView?) {
        if (!isFirstFrameRendered) return
        synchronized(this) {
            isFirstFrameRendered = false
            if (AppManager.isDestroying || currentStreamId == null) return
            this.alpha = 0f
            setupViewForFirstFrame(activityIndicator)
        }
    }

    fun disableVideo(activityIndicator: RippleView?) {
        if (currentTrack == null) return
        isFirstFrameRendered = false
        unsubscribe()
        runOnMainThread {
            activityIndicator?.stopAnimation()
            activityIndicator?.isVisible = false
        }
    }

    fun enableVideo(activityIndicator: RippleView?) {
        synchronized(this) {
            if (AppManager.isDestroying) return
            if (currentStreamId == null) return
            val participant = AppTrackStore.instance.participants[currentStreamId] ?: return
            val newTrackId = participant.videoTrack?.track?.id()
            if (this.currentTrack?.id() == newTrackId) return
            if (participant.videoTrack?.track?.enabled() != true) return
            isFirstFrameRendered = false
            debugP("||| enablevideo", currentStreamId, newTrackId)
            runOnMainThread {
                val videoTrack = participant.videoTrack ?: return@runOnMainThread
                setupViewForFirstFrame(activityIndicator)
                loadTrack(videoTrack.track)
            }
        }
    }

    private fun setupViewForFirstFrame(
        activityIndicator: RippleView?
    ) {
        val isRemoteStream = AppTrackStore.instance.mainParticipant?.endpoint != currentStreamId
        // enable only for remote users
        if (isRemoteStream) {
            activityIndicator?.isVisible = true
            activityIndicator?.clearAnimation()
            activityIndicator?.startAnimation()
        }
        setFirstFrameDisposableListener {
            debugP("||| frame received", currentStreamId)
            alpha = 1f
            isFirstFrameRendered = true
            if (!isRemoteStream) return@setFirstFrameDisposableListener
            activityIndicator?.stopAnimation()
            activityIndicator?.isVisible = false
        }
    }

    private fun unsubscribe() {
        currentTrack?.removeSink(this)
        currentTrack = null
        this.alpha = 0f
        isFirstFrameRendered = false
    }

    fun setTrackId(streamId: String) {
        currentStreamId = streamId
    }

    private fun loadTrack(track: RTCVideoTrack) {
        debugP("RNCSurfaceVideoVideoView.loadTrack", currentStreamId)
        if (!track.enabled()) {
            isVisible = false
            return
        }

        isVisible = true
        currentTrack?.removeSink(this)
        currentTrack = null
        this.alpha = 0f
        try {
            currentTrack = track
            track.addSink(this@RNCSurfaceVideoVideoView)
            debugP("||| RNCSurfaceVideoVideoView.loadTrack.trackAdded", currentStreamId, "visibility", visibility == VISIBLE, "alpha", alpha)
        } catch (e: Exception) {
            debugP("VideoView", e.localizedMessage, "🎞 ‼️Add sink on track [trackId: %s] alpha: %s [h: %s]", currentStreamId, alpha, hashCode())
        }
    }
}

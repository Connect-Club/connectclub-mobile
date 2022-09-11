package com.connect.club.react.bridge.iosLike.ui

import android.content.Context
import android.graphics.Color
import android.view.View
import android.view.ViewGroup
import androidx.core.view.doOnNextLayout
import androidx.core.view.isVisible
import com.connect.club.react.bridge.iosLike.AppModule
import com.connect.club.react.bridge.iosLike.NewJitsiAndroidSpecific
import com.connect.club.react.bridge.iosLike.debugP
import com.connect.club.utils.measureAndLayout
import com.facebook.react.views.view.ReactViewGroup
import common.Common
import org.json.JSONObject
import java.util.*

class ToggleVideoAudioButtonsSet {
    private var toggleVideoAudioButtons: MutableSet<ToggleVideoAudioButtons?> = Collections.newSetFromMap(WeakHashMap())

    var isVisible: Boolean
        get() = toggleVideoAudioButtons.all { it?.isVisible ?: true }
        set(value) {
            toggleVideoAudioButtons.forEach { it?.isVisible = value }
        }

    fun onState(state: JSONObject) {
        toggleVideoAudioButtons.forEach { it?.onState(state) }
    }

    fun toggleVideoAudio(isVideoEnabled: Boolean, isAudioEnabled: Boolean) {
        toggleVideoAudioButtons.forEach { it?.toggleVideoAudio(isVideoEnabled, isAudioEnabled) }
    }

    fun disableVideo() {
        toggleVideoAudioButtons.forEach { it?.disableVideo() }
    }
    fun disableAudio() {
        toggleVideoAudioButtons.forEach { it?.disableAudio() }
    }
    fun enableVideo() {
        toggleVideoAudioButtons.forEach { it?.enableVideo() }
    }
    fun enableAudio() {
        toggleVideoAudioButtons.forEach { it?.enableAudio() }
    }

    fun switchUiState(isVideoEnabled: Boolean, isAudioEnabled: Boolean) {
        toggleVideoAudioButtons.forEach { it?.switchUiState(isVideoEnabled, isAudioEnabled) }
    }

    fun addControl(control: ToggleVideoAudioButtons) {
        toggleVideoAudioButtons.add(control)
    }
}

class ToggleVideoAudioButtons(context: Context?) : ReactViewGroup(context) {

    var micOnIcon: String? = null
    var micOffIcon: String? = null
    var cameraOnIcon: String? = null
    var cameraOffIcon: String? = null
    var progressColor: Int? = null
    private var disabledAlpha = 0.4F

    private var isVideoEnabled = false
    private var isAudioEnabled = false

    private val cameraButtonEnabled: Boolean
        get() = cameraContainer?.isEnabled == true
    private val audioButtonEnabled: Boolean
        get() = audioContainer?.isEnabled == true


    private var cameraContainer: ViewGroup? = null
    private var audioContainer: ViewGroup? = null
    private var cameraButton: RasterIconView? = null
    private var audioButton: RasterIconView? = null
    private var cameraProgressView: View? = null
    private var audioProgressView: View? = null

    init {
        AppManager.toggleVideoAudioButtonsSet.addControl(this)
    }

    fun onState(state: JSONObject) {
        if (!isVisible && state.getString("mode") == "room") isVisible = true
        val isVideo = state.getBoolean("video")
        val isAudio = state.getBoolean("audio")

        if (isVideo == this.isVideoEnabled && !this.cameraButtonEnabled) {
            cameraContainer?.isEnabled = true
            cameraButton?.showImage(if (isVideo) cameraOnIcon else cameraOffIcon)
            cameraButton?.isVisible = true
            cameraProgressView?.isVisible = false
        }

        if (isAudio == this.isAudioEnabled && !this.audioButtonEnabled) {
            audioContainer?.isEnabled = true
            audioButton?.showImage(if (isAudio) micOnIcon else micOffIcon)
            audioButton?.isVisible = true
            audioProgressView?.isVisible = false
        }
        toggleButtonsOpacity()
    }


    override fun addView(child: View?, index: Int) {
        super.addView(child, index)

        if (child?.contentDescription == "cameraButton") {
            cameraContainer = child as ViewGroup
            cameraButton = child.getChildAt(0) as RasterIconView
            cameraButton?.contentDescription = "enableVideoButton"
            cameraProgressView = ActionProgressView(context, progressColor)
            cameraContainer!!.addView(
                cameraProgressView,
                LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
            )
            cameraButton!!.doOnNextLayout {
                cameraProgressView!!.measureAndLayout(it.measuredWidth, it.measuredHeight)
            }
        }

        if (child?.contentDescription == "microphoneButton") {
            audioContainer = child as ViewGroup
            audioProgressView = ActionProgressView(context, progressColor)
            audioButton = child.getChildAt(0) as RasterIconView
            audioButton?.contentDescription = "enableAudioButton"
            audioContainer!!.addView(
                audioProgressView,
                LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
            )
            audioButton!!.doOnNextLayout {
                audioProgressView!!.measureAndLayout(it.measuredWidth, it.measuredHeight)
            }
        }
        toggleButtonsOpacity()
    }

    private fun toggleButtonsOpacity() {
        cameraButton?.alpha = if (AppManager.isJitsiConnected) 1f else disabledAlpha
        audioButton?.alpha = if (AppManager.isJitsiConnected) 1f else disabledAlpha
    }

    fun toggleVideo() {
        if (cameraContainer?.isEnabled != true) return
        if (!AppManager.isJitsiConnected) return
        toggleVideoAudio(!this.isVideoEnabled, this.isAudioEnabled)
    }

    fun toggleAudio() {
        if (audioContainer?.isEnabled != true) return
        if (!AppManager.isJitsiConnected) return
        toggleVideoAudio(this.isVideoEnabled, !this.isAudioEnabled)
    }

    fun disableVideo() = toggleVideoAudio(false, this.isAudioEnabled)
    fun disableAudio() {
        debugP("TogglesVideoAudioButtons.disableAudio")
        toggleVideoAudio(this.isVideoEnabled, false)
    }

    fun enableVideo() = toggleVideoAudio(true, this.isAudioEnabled)
    fun enableAudio() = toggleVideoAudio(this.isVideoEnabled, true)

    fun toggleVideoAudio(isVideoEnabled: Boolean, isAudioEnabled: Boolean) {
        if (AppManager.isOffline) return
        // receive new state
        // Switch a state for all buttons like this
        AppManager.toggleVideoAudioButtonsSet.switchUiState(isVideoEnabled, isAudioEnabled)
        AppManager.newJitsi?.setVideo(isVideoEnabled)
        AppManager.newJitsi?.setMicrophone(isAudioEnabled)
        AppManager.room?.updateVideoAudioPhoneState(isVideoEnabled, isAudioEnabled, NewJitsiAndroidSpecific.isInCall)
    }

    internal fun switchUiState(isVideoEnabled: Boolean, isAudioEnabled: Boolean) {
        // receive new video state
        if (isVideoEnabled != this.isVideoEnabled) {
            // make it false for next the same flag in onState
            cameraContainer?.isEnabled = false
            cameraButton?.showImage(if (isVideoEnabled) cameraOnIcon else cameraOffIcon)
            cameraButton?.contentDescription = if (isVideoEnabled) "disableVideoButton" else "enableVideoButton"
            this.isVideoEnabled = isVideoEnabled
            cameraButton?.isVisible = false
            cameraProgressView?.isVisible = true
        }
        // receive new audio state
        if (isAudioEnabled != this.isAudioEnabled) {
            // make it false for next the same flag in onState
            audioContainer?.isEnabled = false
            audioButton?.showImage(if (isAudioEnabled) micOnIcon else micOffIcon)
            audioButton?.contentDescription = if (isAudioEnabled) "disableAudioButton" else "enableAudioButton"
            this.isAudioEnabled = isAudioEnabled
            audioButton?.isVisible = false
            audioProgressView?.isVisible = true
        }
    }
}

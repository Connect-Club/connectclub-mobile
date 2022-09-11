package com.connect.club.react.bridge.iosLike

import android.content.Context
import com.connect.club.react.bridge.iosLike.ui.AppManager
import com.connect.club.utils.runOnMainThread
import com.sergeymild.event_dispatcher.SubscribeOnMainThread
import common.Common

open class NewJitsiAndroidSpecific {
    @Volatile
    protected var isInitialized: Boolean = false

    var peerFactory = PeerConnectionFactory()
    var beforeMuteAudioWasEnabled = false
    var beforeMuteVideoWasEnabled = false
    var isInBackground = false
    var useHighQualityInput: Boolean
        get() = peerFactory.useHighQualityInput
        set(value) {
            peerFactory.useHighQualityInput = value
        }

    var context by weak<Context?>()

    companion object {
        var isInCall = false
    }

    @SubscribeOnMainThread("incomingCall")
    fun incomingCall() {
        isInCall = true
        if (!isInitialized) return
        setMuteRemoteParticipants(true)
        muteVideoAudio()
    }

    @SubscribeOnMainThread("endCall")
    fun endCall() {
        isInCall = false
        if (!isInitialized) return
        setMuteRemoteParticipants(false)
        muteVideoAudio()
    }

    fun phoneState(state: String) {
        isInBackground = state == "background"

        runOnMainThread {
            if (isInBackground) {
                AppManager.speakers.values.forEach { it.onHidden() }
            } else {
                AppManager.speakers.values.forEach { it.onShown() }
            }
        }

        // in background and on call do nothing
        if (isInBackground && !isInCall) return muteVideo()
        // is not in background and on call do nothing
        if (!isInBackground && !isInCall) return unMuteVideo()
    }

    private fun muteVideo() {
        val participant = AppTrackStore.instance.mainParticipant
        val videoEnabled = participant?.videoTrack?.isEnabled == true
        val audioEnabled = participant?.audioTrack?.isEnabled == true
        setVideo(false)
        beforeMuteVideoWasEnabled = videoEnabled
        AppManager.room?.updateVideoAudioPhoneState(false, audioEnabled, isInCall)
    }

    private fun unMuteVideo() {
        val participant = AppTrackStore.instance.mainParticipant
        if (beforeMuteVideoWasEnabled) setVideo(true)
        val audioEnabled = participant?.audioTrack?.isEnabled == true
        AppManager.room?.updateVideoAudioPhoneState(beforeMuteVideoWasEnabled, audioEnabled, isInCall)
    }

    fun unMuteAudio() {
        val participant = AppTrackStore.instance.mainParticipant
        beforeMuteAudioWasEnabled = true
        setMicrophone(true)
        val videoEnabled = participant?.videoTrack?.isEnabled == true
        AppManager.room?.updateVideoAudioPhoneState(videoEnabled, beforeMuteAudioWasEnabled, isInCall)
    }

    private fun muteVideoAudio() {
        // do nothing as it is already muted
        val participant = AppTrackStore.instance.mainParticipant
        val videoEnabled = participant?.videoTrack?.isEnabled == true
        val audioEnabled = participant?.audioTrack?.isEnabled == true
        setMicrophone(false)
        setVideo(false)
        beforeMuteVideoWasEnabled = videoEnabled
        beforeMuteAudioWasEnabled = audioEnabled
        AppManager.toggleVideoAudioButtonsSet.toggleVideoAudio(isVideoEnabled = false, isAudioEnabled = false)
    }

    private fun unMuteVideoAudio() {
        // do nothing as it is still in background
        if (!isInBackground) {
            if (beforeMuteVideoWasEnabled) setVideo(true)
            if (beforeMuteAudioWasEnabled) setMicrophone(true)
            AppManager.room?.updateVideoAudioPhoneState(beforeMuteVideoWasEnabled, beforeMuteAudioWasEnabled, isInCall)
            return
        }
        AppManager.room?.updateVideoAudioPhoneState(false, false, isInCall)
    }

    fun initialize() {
        peerFactory.setContext(context!!)
        isInitialized = true
    }

    fun setVideo(isEnabled: Bool) {
        debugP("NewJitsi setVideo", isEnabled)
        val video = AppTrackStore.instance.mainParticipant?.videoTrack?.track ?: return
        video.setEnabled(isEnabled)
        if (isEnabled) {
            AppTrackStore.instance.mainParticipant?.capturer?.startCapture()
        } else {
            AppTrackStore.instance.mainParticipant?.capturer?.stopCapture()
        }
        beforeMuteVideoWasEnabled = isEnabled
    }

    fun setMicrophone(isEnabled: Bool) {
        val track = AppTrackStore.instance.mainParticipant?.audioTrack?.track
        debugP("NewJitsi setMicrophone", isEnabled, track)
        val audio = track ?: return
        audio.setEnabled(isEnabled)
        beforeMuteAudioWasEnabled = isEnabled
    }

    private fun setMuteRemoteParticipants(isMute: Bool) {
        val mainEndpoint = AppTrackStore.instance.mainParticipant?.endpoint
        AppTrackStore.instance.getPeerConnectionsTracks().entries.forEach {
            if (it.key != mainEndpoint) it.value.setEnabled(!isMute)
        }
    }
}

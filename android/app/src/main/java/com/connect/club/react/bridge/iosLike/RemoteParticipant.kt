package com.connect.club.react.bridge.iosLike

import org.webrtc.RtpSender

class RemoteParticipant(val endpoint: String) {

    var videoTrack: VideoTrack? = null
    var rtpSender: RtpSender? = null
    var audioTrack: AudioTrack? = null
    var capturer: LocalVideoCapturer? = null

    fun destroy() {
        capturer?.destroy()
        capturer = null
    }

    override fun toString(): String {
        return "endpoint='$endpoint', videoTrack=${videoTrack?.track?.id()}"
    }
}
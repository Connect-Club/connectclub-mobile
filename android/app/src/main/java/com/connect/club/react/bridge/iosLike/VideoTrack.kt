package com.connect.club.react.bridge.iosLike

class VideoTrack(val track: RTCVideoTrack) {

    public var isEnabled: Bool
        get() = track.enabled()
        set(value) { track.setEnabled(value) }
}
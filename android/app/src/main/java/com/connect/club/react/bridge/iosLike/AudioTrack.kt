package com.connect.club.react.bridge.iosLike

class AudioTrack(val track: RTCAudioTrack) {

    public var isEnabled: Bool
        get() = track.enabled()
        set(value) { track.setEnabled(value) }
}
package com.connect.club.react.bridge.iosLike

interface PeerConnectionDelegate {
    fun didChange(pc: RTCPeerConnection)
    fun dataChannelCreated(pc: RTCPeerConnection, dataChannel: RTCDataChannel)
}
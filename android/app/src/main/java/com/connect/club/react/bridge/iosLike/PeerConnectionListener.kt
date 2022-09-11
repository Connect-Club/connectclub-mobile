package com.connect.club.react.bridge.iosLike

import org.webrtc.*
import java.lang.ref.WeakReference

class PeerConnectionListener: PeerConnection.Observer {
    private val id: String

    var delegate: WeakReference<PeerConnectionDelegate>? = null
    var pc by weak<RTCPeerConnection?>()

    constructor(id: String, delegate: PeerConnectionDelegate) {
        this.id = id
        this.delegate = WeakReference(delegate)
    }

    override fun onDataChannel(p0: DataChannel?) {
        val pc = pc ?: return
        val dataChannel = p0 ?: return
        delegate?.get()?.dataChannelCreated(pc, dataChannel)
    }

    override fun onConnectionChange(newState: PeerConnection.PeerConnectionState?) {
        val pc = pc ?: return
        delegate?.get()?.didChange(pc)
    }

    override fun onSignalingChange(p0: PeerConnection.SignalingState?) {}
    override fun onIceConnectionChange(p0: PeerConnection.IceConnectionState?) {}
    override fun onIceConnectionReceivingChange(p0: Boolean) {}
    override fun onIceGatheringChange(p0: PeerConnection.IceGatheringState?) {}
    override fun onIceCandidate(p0: IceCandidate?) {}
    override fun onIceCandidatesRemoved(p0: Array<out IceCandidate>?) {}
    override fun onAddStream(stream: MediaStream?) {}
    override fun onRemoveStream(stream: MediaStream?) {}
    override fun onRenegotiationNeeded() {}
    override fun onAddTrack(p0: RtpReceiver?, p1: Array<out MediaStream>?) {}
}
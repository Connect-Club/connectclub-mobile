package com.connect.club.react.bridge.iosLike

import com.connect.club.jitsiclient.webrtc.peerconnection.SimpleSdpObserver
import org.webrtc.*
import org.webrtc.AudioTrack
import org.webrtc.VideoTrack

typealias RTCPeerConnection = PeerConnection
typealias RTCDataChannel = DataChannel
typealias RTCVideoTrack = VideoTrack
typealias RTCAudioTrack = AudioTrack
typealias RTCSessionDescription = SessionDescription
typealias RTCDataBuffer = DataChannel.Buffer
typealias RTCMediaStreamTrack = MediaStreamTrack
typealias RTCCameraVideoCapturer = CameraVideoCapturer
typealias RTCVideoRenderer = VideoFileRenderer
typealias Bool = Boolean

class PeerConnectionHolder {

    val pc: RTCPeerConnection
    val pcListener: PeerConnectionListener
    val isMain: Bool

    var dataChannel: RTCDataChannel? = null

    var id: String
    var userId: String

    constructor(id: String, userId: String, isMain: Bool, pc: RTCPeerConnection, pcListener: PeerConnectionListener) {
        this.isMain = isMain
        this.userId = userId
        this.id = id
        this.pc = pc
        this.pcListener = pcListener
    }

    fun setRemote(sdp: String, complete: (String?) -> Unit) {
        debugP("PeerConnectionHolder setRemote")
        val descr = RTCSessionDescription(SessionDescription.Type.OFFER, sdp)
        pc.setRemoteDescription(object : SimpleSdpObserver() {
            override fun onSetSuccess() {
                complete(null)
            }

            override fun onSetFailure(error: String?) {
                complete(error)
            }
        }, descr)
    }

    fun generateAnswer(complete: (String?, String?) -> Unit) {
        debugP("PeerConnectionHolder generateAnswer")
        pc.createAnswer(object : SimpleSdpObserver() {
            override fun onCreateSuccess(sdp: SessionDescription?) {
                complete(null, sdp?.description)
            }

            override fun onSetFailure(error: String?) {
                complete(error, null)
            }
        }, MediaConstraints())
    }

    fun setLocal(description: String, complete: (String?) -> Unit) {
        debugP("PeerConnectionHolder setLocal")
        val descr = RTCSessionDescription(SessionDescription.Type.ANSWER, description)
        pc.setLocalDescription(object : SimpleSdpObserver() {
            override fun onSetSuccess() {
                complete(null)
            }

            override fun onSetFailure(error: String?) {
                complete(error)
            }
        }, descr)
    }
}
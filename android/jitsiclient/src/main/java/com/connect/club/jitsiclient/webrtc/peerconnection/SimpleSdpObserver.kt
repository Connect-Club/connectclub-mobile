package com.connect.club.jitsiclient.webrtc.peerconnection

import org.webrtc.SdpObserver
import org.webrtc.SessionDescription

abstract class SimpleSdpObserver : SdpObserver {
    override fun onSetFailure(error: String?) = Unit
    override fun onSetSuccess() = Unit
    override fun onCreateSuccess(sdp: SessionDescription?) = Unit
    override fun onCreateFailure(error: String?) = Unit
}

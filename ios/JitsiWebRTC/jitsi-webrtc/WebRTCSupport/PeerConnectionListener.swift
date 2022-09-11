//
//  PeerConnectionListener.swift
//  jitsi-webrtc
//
//  Created by Тарас Минин on 05/08/2020.
//  Copyright © 2020 CNNCT Limited. All rights reserved.
//

import WebRTC

public protocol PeerConnectionDelegate: AnyObject {
    func didChange(pc: RTCPeerConnection)
    func dataChannelCreated(pc: RTCPeerConnection, dataChannel: RTCDataChannel)
    func didAddStream(pc: RTCPeerConnection, stream: RTCMediaStream)
}

final class PeerConnectionListener: NSObject, RTCPeerConnectionDelegate {
    private let id: String

    weak var delegate: PeerConnectionDelegate?

    init(id: String, peerConnection: RTCPeerConnection, delegate: PeerConnectionDelegate) {
        self.id = id
        super.init()

        peerConnection.delegate = self
        self.delegate = delegate
    }

    func peerConnection(_ peerConnection: RTCPeerConnection, didAdd stream: RTCMediaStream) {
        delegate?.didAddStream(pc: peerConnection, stream: stream)
    }

    func peerConnection(_ peerConnection: RTCPeerConnection, didOpen dataChannel: RTCDataChannel) {
        delegate?.dataChannelCreated(pc: peerConnection, dataChannel: dataChannel)
    }

    func peerConnection(_ peerConnection: RTCPeerConnection, didChange newState: RTCPeerConnectionState) {
        delegate?.didChange(pc: peerConnection)
    }
    
    func peerConnection(_ peerConnection: RTCPeerConnection, didGenerate candidate: RTCIceCandidate) {}
    func peerConnectionShouldNegotiate(_ peerConnection: RTCPeerConnection) {}
    func peerConnection(_ peerConnection: RTCPeerConnection, didRemove stream: RTCMediaStream) {}
    func peerConnection(_ peerConnection: RTCPeerConnection, didRemove candidates: [RTCIceCandidate]) {}
    func peerConnection(_ peerConnection: RTCPeerConnection, didChange newState: RTCIceGatheringState) {}
    func peerConnection(_ peerConnection: RTCPeerConnection, didChange stateChanged: RTCSignalingState) {}
    func peerConnection(_ peerConnection: RTCPeerConnection, didChange newState: RTCIceConnectionState) {}
}

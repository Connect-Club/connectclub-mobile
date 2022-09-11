//
//  PeerConnectionHolder.swift
//  DemoApp
//
//  Created by Тарас Минин on 09/09/2020.
//  Copyright © 2020 CNNCT Limited. All rights reserved.
//

import WebRTC

public final class PeerConnectionHolder: NSObject {

    public let pc: RTCPeerConnection
    let pcListener: PeerConnectionListener
    let isMain: Bool

    public var dataChannel: RTCDataChannel?

    weak var errorDelegate: PeerConnectionDelegate?

    public let id: String
    public let userId: String
    private let answerConstraints = RTCMediaConstraints(
        mandatoryConstraints: nil,
        optionalConstraints: nil
    )

    public init(
        id: String,
        userId: String,
        isMain: Bool,
        pc: RTCPeerConnection,
        delegate: PeerConnectionDelegate
    ) {
        self.userId = userId
        self.isMain = isMain
        self.id = id
        self.pc = pc
        self.pcListener = PeerConnectionListener(
            id: id,
            peerConnection: pc,
            delegate: delegate
        )
        self.errorDelegate = delegate

        super.init()
    }

    public func setRemote(sdp: String, complete: @escaping (Error?) -> Void) {
        pc.setRemoteDescription(RTCSessionDescription(type: .offer, sdp: sdp)) { error in
            complete(error)
        }
    }

    public func generateAnswer(complete: @escaping (Error?, String?) -> Void) {
        pc.answer(for: answerConstraints) { answer, error in
            //self?.log(answer?.description)
            if let error = error {
                return complete(error, nil)
            }
            complete(nil, answer?.sdp)
        }
    }

    public func setLocal(description: String, complete: @escaping (Error?) -> Void) {
        let descr = RTCSessionDescription(type: .answer, sdp: description)
        pc.setLocalDescription(descr) { error in
            complete(error)
        }
    }
    
    deinit {
        debugP("deinit")
    }
}

extension PeerConnectionHolder {
    public func getTracks() -> [String: RTCMediaStreamTrack] {
        var result: [String: RTCMediaStreamTrack] = [:]
        pc.receivers.forEach { result[$0.track!.trackId] = $0.track }
        return result
    }
}

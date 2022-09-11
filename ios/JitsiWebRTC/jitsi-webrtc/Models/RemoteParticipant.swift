//
//  RemoteParticipant.swift
//  jitsi-webrtc
//
//  Created by Тарас Минин on 30/07/2020.
//  Copyright © 2020 CNNCT Limited. All rights reserved.
//

import Foundation
import WebRTC

public final class RemoteParticipant: NSObject {
    public let endpoint: String

    public var videoTrack: RTCVideoTrack?
    public var rtcRtpSender: RTCRtpSender?
    public var audioTrack: RTCAudioTrack?
    public var capturer: LocalVideoCapturer?

    public init(endpoint: String) {
        self.endpoint = endpoint
        super.init()
    }
}

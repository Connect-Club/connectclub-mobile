//
//  PeerConnectionSupply.swift
//  jitsi-webrtc
//
//  Created by Тарас Минин on 29/07/2020.
//  Copyright © 2020 CNNCT Limited. All rights reserved.
//

import WebRTC

private func peerConfiguration() -> RTCConfiguration {
    let peerConfig = RTCConfiguration()
    peerConfig.sdpSemantics = .unifiedPlan
    let iceServer = RTCIceServer(urlStrings: ["stun:stun.l.google.com:19302"])
    peerConfig.iceServers = [iceServer]

    return peerConfig
}

private let mediaConstraints = RTCMediaConstraints(
    mandatoryConstraints: [
        "maxWidth": "360",
        "maxHeight": "480",
        "maxFrameRate": "30"
    ],
    optionalConstraints: nil
)

public final class PeerConnectionBuilder {
    
    public let peerFactory: RTCPeerConnectionFactory
    private let peerConfig: RTCConfiguration
    private let constraints: RTCMediaConstraints
    
    public init(isSpeaker: Bool) {
        let videoDecoder = RTCDefaultVideoDecoderFactory()
        let videoEncoder = RTCDefaultVideoEncoderFactory()

        peerFactory = RTCPeerConnectionFactory(
            encoderFactory: videoEncoder,
            decoderFactory: videoDecoder,
            // Use bypass voice filters for Voice Processing Audio Unit
            bypass_voice_processing: AVAudioSessionConfigurator.initialBypass,
            // Enable or disable Automatic Gain Control
            needAGC: true,
            // If false - use default RemoteIO Audio Unit, if true - Voice Processing Audio Unit
            needAEC: true,
            inputEnabled: isSpeaker
        )
        peerConfig = peerConfiguration()
        constraints = mediaConstraints
    }
    
    public func localVideoTrackAndCapturer(
        with id: String,
        frameSide: Int,
        fps: Int32
    ) -> (RTCVideoTrack, RTCCameraVideoCapturer, RTCFileVideoCapturer?)? {
        let videoSource = peerFactory.videoSource()
        videoSource.adaptOutputFormat(
            toWidth: Int32(frameSide),
            height: Int32(frameSide),
            fps: fps
        )
        let videoCapturer = RTCCameraVideoCapturer(delegate: videoSource)
        
        /// MOB-1313 — Crash at reading file [RTCFileVideoCapturer readNextBuffer]
        //let fileCapturer = RTCFileVideoCapturer(delegate: videoSource)
        
        let videoTrack = peerFactory.videoTrack(
            with: videoSource,
            trackId: id
        )

        return (videoTrack, videoCapturer, nil)
    }
    
    public func peerConnection() -> RTCPeerConnection {
        let pc = peerFactory.peerConnection(
            with: peerConfig,
            constraints: constraints,
            delegate: nil
        )

        return pc!
    }
}

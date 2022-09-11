//
//  NewJitsi.swift
//  jitsi-webrtc
//
//  Created by Sergei Golishnikov on 01/04/2021.
//  Copyright © 2021 CNNCT Limited. All rights reserved.
//

import Foundation
import WebRTC
import JitsiWebRTC
import Common

public class NewJitsi: NewJitsiIosSpecific, CommonJvBusterDelegateProtocol, RTCDataChannelDelegate, PeerConnectionDelegate {
    public func init_(_ callbacks: CommonJvbusterCallbacksProtocol?) {}
    
    weak var appModule: AppModule?
    
    var speakerPcBuilder: PeerConnectionBuilder!
    var nonSpeakerPcBuilder: PeerConnectionBuilder!
    var observation: MediaStatsObservation?
    
    var videoWidth: Int = 0
    var videoHeight: Int = 0
    var fps: Int = 0
    
    private var wasHandledPeerConnectionFailed = false
    private var setRemoteErrorHandledRetries = 0

    static let audioBandwidth = 0
    static let videoBandwidth = 0

    private var screenSharingUserId: String?
    
    var afterSetLocalSubscription: (() -> Void)?

    var isQuite = false
    
    public override init() {
        super.init()
        self.speakerPcBuilder = PeerConnectionBuilder(isSpeaker: true)
        self.nonSpeakerPcBuilder = PeerConnectionBuilder(isSpeaker: false)
        AppManager.instance.newJitsi = self
    }
    
    public func setParams(
        _ videoWidth: Int,
        _ videoHeight: Int,
        _ fps: Int,
        _ videoEnabled: Bool,
        _ audioEnabled: Bool
    ) {
        AppManager.setDestroying(false)
        self.videoWidth = videoWidth
        self.videoHeight = videoHeight
        self.fps = fps
        self.beforeMuteVideoWasEnabled = videoEnabled
        self.beforeMuteAudioWasEnabled = audioEnabled
        initialize()
    }
    
    func cleanup() {
        debugLog(.debug, "cleanup")
        AppManager.isJitsiConnected = false
        
        observation?.stopUpdatingLocalAudioTrackLevel()
        observation = nil

        if let id = screenSharingUserId {
            AppManager.speakers[id]?.value?.hideScreenSharing()
        }
        AppManager.speakers.forEach { entry in
            entry.value.value?.disableVideo()
        }
        TracksStore.instance.clear()
        AppManager.instance.shareScreenVideoView?.disableVideo()
    }
    
    override func onDestroy() {
        super.onDestroy()
        debugLog(.debug)
        cleanup()
        setRemoteErrorHandledRetries = 0
        appModule = nil
    }
    
    // MARK: initializeRTCPeerConnection
    public func initializeRTCPeerConnection(
        _ userId: String?,
        id_: String?,
        isMain: Bool,
        isSpeaker: Bool,
        sdpOffer: String?,
        callbacks: CommonJvbusterPeerConnectionCallbacksProtocol?
    ) -> String {
        if AppManager.isDestroying { return "" }
        
        guard let userId = userId, !userId.isEmpty, let id = id_ else { fatalError() }
        
        if TracksStore.peerConnections[id] == nil {
            let pc = PeerConnectionHolder(
                id: id,
                userId: userId,
                isMain: isMain,
                pc: isMain && isSpeaker ? speakerPcBuilder.peerConnection() : nonSpeakerPcBuilder.peerConnection(),
                delegate: self
            )
            TracksStore.setPeerConnection(id, pc)
            debugLog(.info, "peerConnectionCreated", pc.id, pc.hash)
            TracksStore.instance.mainPeerConnection = pc
            
            if isMain && isSpeaker {
                let participant = RemoteParticipant(endpoint: userId)
                TracksStore.instance.mainParticipant = participant
                setLocalMediaTracks(
                    user: participant,
                    videoWidth: videoWidth,
                    videoHeight: videoHeight,
                    fps: fps,
                    videoEnabled: beforeMuteVideoWasEnabled,
                    audioEnabled: beforeMuteAudioWasEnabled
                )

                if participant.videoTrack == nil || participant.audioTrack == nil {
                    fatalError()
                }

                debugLog(.info, "main set local media")
                let videoTrack = participant.videoTrack!
                let audioTrack = participant.audioTrack!
                videoTrack.isEnabled = self.beforeMuteVideoWasEnabled == true
                audioTrack.isEnabled = self.beforeMuteAudioWasEnabled == true
                participant.rtcRtpSender = pc.pc.add(
                    videoTrack,
                    streamIds: [participant.endpoint]
                )
                pc.pc.add(audioTrack, streamIds: [participant.endpoint])
                TracksStore.setParticipant(userId, participant)
                
                observation = MediaStatsObservation()
                observation?.startUpdatingLocalAudioTrackLevel(pc: pc.pc) { value in
                    AppManager.instance.room?.updateAudioLevel(value)
                }
            }
        }
        
        guard let sdpOffer = sdpOffer else {
            fatalError("sdpOfferNil")
        }
        if sdpOffer.isEmpty {
            fatalError("sdpOfferEmpty")
        }
        
        var createdSdp: String? = nil
        if AppManager.isDestroying { return "" }
        let pc = TracksStore.peerConnections[id]!
        let semaphore = DispatchSemaphore(value: 0)

        if AppManager.isDestroying { return "" }
        pc.setRemote(sdp: sdpOffer) { error in
            // todo local stream
            if let error = error { debugLog(.warning, "remoteGenerated=\(error)") }
            if AppManager.isDestroying || error != nil {
                createdSdp = ""
                semaphore.signal()
                self.onError("reconnect")
                return
            }
            pc.generateAnswer { err, sdp in
                if let error = error { debugLog(.warning, "answerGenerated \(error)") }
                if AppManager.isDestroying || error != nil {
                    createdSdp = ""
                    semaphore.signal()
                    self.onError("reconnect")
                    return
                }
                // local sdp
                createdSdp = sdp
                semaphore.signal()
            }
        }
        _ = semaphore.wait(timeout: .now() + 3)
        return createdSdp ?? ""
    }
    
    public func destroyPeerConnections() {
        cleanup()
    }
    
    public func setLocalRTCPeerConnectionDescription(_ id_: String?, description: String?) {
        guard let id = id_, let description = description else { fatalError() }
        if AppManager.isDestroying { return }
        guard let pc = TracksStore.peerConnections[id] else {
            return debugLog(.error, "peerConnection not found \(id)")
        }
        
        let semaphore = DispatchSemaphore(value: 0)
        pc.setLocal(description: description, complete: { error in
            if let error = error { debugLog(.warning, "localGenerated=\(error)") }
            semaphore.signal()
        })
        _ = semaphore.wait(timeout: .now() + 3)
        debugLog(.info, "complete \(id)")
    }
    
    public func sendMessage(toDataChannel id_: String?, message: String?) {
        if AppManager.isDestroying { return }
        guard let id = id_, let message = message else { fatalError() }
        debugLog(.info, "to channel=\(id)")
        let data = message.data(using: .utf8)!
        if id == "*" {
            for pcHolder in TracksStore.peerConnections.values {
                sendMessage(pc: pcHolder, data: data)
            }
        } else {
            guard let pc = TracksStore.peerConnections[id] else { return }
            sendMessage(pc: pc, data: data)
        }
    }
    
    private func sendMessage(pc: PeerConnectionHolder, data: Data) {
        let dataChannel = pc.dataChannel
        if dataChannel == nil || dataChannel!.readyState != .open { return }
        let buffer = RTCDataBuffer(data: data, isBinary: false)
        dataChannel!.sendData(buffer)
    }
    
    public func processMetaAdd(
        _ json: String?
    ) {
        if !AppManager.isJitsiConnected {
            return debugLog(.warning, "webrtcNotConnected")
        }
        if AppManager.isDestroying { return }
        let jsonDict = toJSON(json: json)

        if jsonDict.keys.isEmpty { return }
        debugLog(.debug, jsonDict.keys)
        for (key, value) in jsonDict {

            if AppManager.isDestroying { return }

            let videosAudios = value as! [String: String]
            let v = videosAudios["video"]
            let a = videosAudios["audio"]
            let videos = v?.isEmpty == true ? nil : v
            let audios = a?.isEmpty == true ? nil : a
            
            let remoteUserId = key
            var remoteUser: RemoteParticipant! = TracksStore.participants[remoteUserId]
            if remoteUser == nil {
                remoteUser = RemoteParticipant(endpoint: remoteUserId)
                //debugLog("processMetaAdd createUser", remoteUserId)
                if videos == nil && audios == nil {
                    TracksStore.setParticipant(remoteUserId, remoteUser)
                    continue
                }
            }
            
            let tracks = TracksStore.instance.getPeerConnectionsTracks()
            //debugLog("NewJitsi tracks", videos, audios, tracks.keys)

            if videos != remoteUser.videoTrack?.trackId {
                let videoTrack: RTCMediaStreamTrack? = videos != nil
                    ? tracks[videos!]
                    : nil

                remoteUser.videoTrack = videoTrack as? RTCVideoTrack

                if remoteUser.videoTrack == nil {
                    debugLog(.warning, "user \(remoteUserId) found no video by id=\(videos ?? "no id")")
                }

                TracksStore.setParticipant(remoteUserId, remoteUser)
                if key.starts(with: "screen-") {
                    AppManager.instance.shareScreenVideoView?.enableVideo(userId: key)
                }
            }
            
            if audios != remoteUser.audioTrack?.trackId {
                let audioTrack: RTCMediaStreamTrack? = audios != nil
                    ? tracks[audios!]
                    : nil
                
                remoteUser.audioTrack = audioTrack as? RTCAudioTrack

                if remoteUser.audioTrack == nil {
                    debugLog(.warning, "user \(remoteUserId) found no audio by id=\(audios ?? "no id")")
                }
            }
            
            TracksStore.setParticipant(remoteUserId, remoteUser)
            
            if key.starts(with: "screen-") {
                if TracksStore.instance.screenShareTrack == nil {
                    remoteUser.audioTrack?.source.volume = 0
                }
                TracksStore.instance.screenShareTrack = remoteUser
                let id = key.replacingOccurrences(of: "screen-", with: "")
                AppManager.speakers[id]?.value?.showScreenSharing()
                screenSharingUserId = id
            }
        }
    }
    
    public func processMetaRemove(_ json: String?) {
        if !AppManager.isJitsiConnected {
            return debugLog(.warning, "webrtcNotConnected")
        }
        if AppManager.isDestroying { return }
        let jsonDict = toJSON(json: json)
        
        // remove old participants
        let participants = TracksStore.participants
        var newParticipants: [String: RemoteParticipant] = [:]
        for entry in participants {
            // skip current user
            if entry.value.endpoint == TracksStore.instance.mainParticipant?.endpoint {
                newParticipants[entry.value.endpoint] = entry.value
                continue
            }
            
            let speakerView = AppManager.speakers[entry.key]?.value
            if let media = jsonDict[entry.value.endpoint] as? [String: String] {
                let videoTrackId = media["video"]
                let audioTrackId = media["audio"]
                let videoTrack = entry.value.videoTrack
                let audioTrack = entry.value.audioTrack
                let localVideoId = videoTrack?.trackId ?? ""
                let localAudioId = audioTrack?.trackId ?? ""
                let isDesktopShare = entry.key.starts(with: "screen-")
                let videoWasChanged = localVideoId != videoTrackId
                let audioWasChanged = localAudioId != audioTrackId
                if isDesktopShare && videoWasChanged {
                    TracksStore.instance.screenShareTrack = nil
                    AppManager.instance.shareScreenVideoView?.disableVideo()
                    let id = entry.key.replacingOccurrences(of: "screen-", with: "")
                    AppManager.speakers[id]?.value?.hideScreenSharing()
                    continue
                }
                if !videoWasChanged && !audioWasChanged {
                    newParticipants[entry.key] = entry.value
                } else {
                    speakerView?.disableVideo()
                    debugLog(.debug, "deleteVideo different \(entry.value.endpoint)")
                }
            } else {
                speakerView?.disableVideo()
                debugLog(.debug, "deleteVideo \(entry.value.endpoint)")
                if entry.key.starts(with: "screen-") {
                    TracksStore.instance.screenShareTrack = nil
                    AppManager.instance.shareScreenVideoView?.disableVideo()
                    let id = entry.key.replacingOccurrences(of: "screen-", with: "")
                    AppManager.speakers[id]?.value?.hideScreenSharing()
                }
            }
        }
        TracksStore.setParticipants(newParticipants)
    }
    
    public func dataChannelCreated(pc: RTCPeerConnection, dataChannel: RTCDataChannel) {
        for pcHolder in TracksStore.peerConnections.values where pcHolder.pc === pc {
            pcHolder.dataChannel = dataChannel
            pcHolder.dataChannel?.delegate = self
        }
    }
    
    public func didChange(pc: RTCPeerConnection) {
        let state = pc.connectionState
        if state == .closed || state == .failed {
            AppManager.isJitsiConnected = false
        } else if state == .connected {
            AppManager.isJitsiConnected = true
            audioSession?.bypassVoiceEnabled = AVAudioSessionConfigurator.initialBypass
            if let userId = TracksStore.mainParticipant?.endpoint {
                AppManager.speakers[userId]?.value?.enableVideo()
            }
        }
        for (key, value) in TracksStore.peerConnections {
            if value.pc === pc {
                AppManager.instance.room?.processPeerConnectionState(key, state: state.rawValue)
                break
            }
        }
        
        let mainPc = TracksStore.mainPeerConnection
        if mainPc?.pc === pc {
            if state == .connected {
                debugLog(.debug, "main pc=connected")
                wasHandledPeerConnectionFailed = false
            } else if state != .connecting {
                AppManager.speakers[mainPc!.userId]?.value?.disableVideo()
            }
        }
    }
    
    public func dataChannel(_ dataChannel: RTCDataChannel, didReceiveMessageWith buffer: RTCDataBuffer) {
        debugLog(.info)
        if AppManager.isDestroying { return }
        
        for (id, pc) in TracksStore.peerConnections {
            if pc.dataChannel?.channelId == dataChannel.channelId {
                let data = buffer.data
                let msg = String(data: data, encoding: .utf8)
                AppManager.instance.room?.processDataChannelMessage(id, message: msg)
                return
            }
        }
        debugLog(.warning, "channel not found \(dataChannel.channelId)")
    }

    public func dataChannelDidChangeState(_ dataChannel: RTCDataChannel) {}
    
    public func didAddStream(pc: RTCPeerConnection, stream: RTCMediaStream) {
        TracksStore.instance.tracksSync.sync {
            stream.audioTracks.forEach {TracksStore.instance.tracks[$0.trackId] = $0}
            stream.videoTracks.forEach {TracksStore.instance.tracks[$0.trackId] = $0}
        }
    }
    
    //MARK: OnError
    public func onError(_ error: String?) {
        guard let appModule = appModule else { return }
        AppManager.isJitsiConnected = false
        if isQuite { return }

        debugLog(.error, "error=\(error ?? "undefined") isOffline=\(AppManager.isOffline) wasHandledPeerConnectionFailed=\(wasHandledPeerConnectionFailed)")
        if error == "expired" || error == "WebSocketsReconnectAttemptsEnd" {
            return appModule.sendEvent(type: .onError, body: "expired")
        }
        
        if !AppManager.isOffline {
            return appModule.sendEvent(
                type: .onError,
                body: error ?? "unknownError"
            )
        }
    }
    
    func toggleUserCamera() {
        guard let participant = TracksStore.mainParticipant else { return }
        AppManager.currentSpeaker?.disableVideo()
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            let type: LocalCameraType = participant.capturer?.cameraType == .back ? .front : .back
            participant.capturer?.stopCapture()
            self.createVideoCapturer(
                user: participant,
                videoWidth: self.videoWidth,
                videoHeight: self.videoHeight,
                fps: self.fps,
                videoEnabled: true,
                localCameraType: type
            )
            participant.rtcRtpSender?.track = participant.videoTrack
            AppManager.currentSpeaker?.mirror(type == .front)
            AppManager.currentSpeaker?.enableVideo()
        }
    }

    private func setLocalMediaTracks(
        user: RemoteParticipant,
        videoWidth: Int,
        videoHeight: Int,
        fps: Int,
        videoEnabled: Bool,
        audioEnabled: Bool
    ) {
        debugLog(.info, "fps=\(fps) V=\(videoEnabled) A=\(audioEnabled)")
        createVideoCapturer(
            user: user,
            videoWidth: videoWidth,
            videoHeight: videoHeight,
            fps: fps,
            videoEnabled: videoEnabled,
            localCameraType: .front
        )
        
        user.audioTrack = speakerPcBuilder.peerFactory.audioTrack(withTrackId: user.endpoint)
        
        if user.videoTrack == nil || user.audioTrack == nil { return }

        user.audioTrack?.isEnabled = audioEnabled
    }
    
    private func createVideoCapturer(
        user: RemoteParticipant,
        videoWidth: Int,
        videoHeight: Int,
        fps: Int,
        videoEnabled: Bool,
        localCameraType: LocalCameraType
    ) {
        if let (video, cameraCapturer, fileCapturer) = speakerPcBuilder.localVideoTrackAndCapturer(
            with: user.endpoint,
            frameSide: min(videoWidth, videoHeight),
            fps: Int32(fps)
        ) {
            user.videoTrack = video
            user.capturer = LocalVideoCapturer(
                cameraCapturer: cameraCapturer,
                fileCapturer: fileCapturer,
                fps: fps,
                cameraType: localCameraType
            )
        }
        
        user.videoTrack?.isEnabled = videoEnabled
        if videoEnabled { user.capturer?.startCapture() }
    }
}

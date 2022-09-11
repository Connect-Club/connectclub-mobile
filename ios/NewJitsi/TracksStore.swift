//
//  TracksStore.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 02/04/2021.
//

import Foundation
import WebRTC
import JitsiWebRTC

class TracksStore {
    static let instance = TracksStore()
    
    private let participantsSync = DispatchQueue(label: "participantsSync")
    let tracksSync = DispatchQueue(label: "tracksSync")
    let peerConnectionsSync = DispatchQueue(label: "peerConnectionsSync")
    
    private var peerConnections: [String: PeerConnectionHolder] = [:]
    var mainPeerConnection: PeerConnectionHolder?
    var screenShareTrack: RemoteParticipant?
    private var participants: [String: RemoteParticipant] = [:]
    var mainParticipant: RemoteParticipant?
    var tracks: [String : RTCMediaStreamTrack] = [:]
    
    static var peerConnections: [String: PeerConnectionHolder] {
        instance.peerConnectionsSync.sync {
            return instance.peerConnections
        }
    }
    
    static func setPeerConnection(_ id: String, _ connection: PeerConnectionHolder) {
        instance.peerConnectionsSync.sync {
            instance.peerConnections[id] = connection
        }
    }
    
    static var mainPeerConnection: PeerConnectionHolder? {
        return instance.mainPeerConnection
    }
    
    static var mainParticipant: RemoteParticipant? {
        return instance.mainParticipant
    }
    
    static func setParticipant(_ id: String, _ participant: RemoteParticipant?) {
        instance.participantsSync.sync {
            if participant == nil { return }
            instance.participants[id] = participant
        }
    }
    
    static func setParticipants(_ participants: [String: RemoteParticipant]) {
        instance.participantsSync.sync { instance.participants = participants }
    }
    
    static var participants: [String: RemoteParticipant] {
        instance.participantsSync.sync { instance.participants }
    }
    
    static func videoTrack(for id: String) -> RemoteParticipant? {
        instance.participantsSync.sync {
            return instance.participants[id]
        }
    }
    
    func getPeerConnectionsTracks() -> [String : RTCMediaStreamTrack] {
//        debugLog("getPeerConnectionsTracks start")
//        var tracks: [String : RTCMediaStreamTrack] = [:]
//        for pc in peerConnections.values {
//            pc.getTracks().forEach { entry in tracks[entry.key] = entry.value }
//        }
//        debugLog("getPeerConnectionsTracks complete")
        tracksSync.sync {
            return tracks
        }
    }
    
    func participantIds() -> [String] {
        participantsSync.sync {
            return Array(participants.keys)
        }
    }
    
    func clear() {
        mainPeerConnection = nil
        peerConnections.values.forEach {
            $0.dataChannel?.close()
            $0.dataChannel = nil
            $0.pc.delegate = nil
            $0.pc.close()
        }
        peerConnections.removeAll()
        participantsSync.sync {
            participants.removeAll()
        }
        mainParticipant?.capturer?.stopCapture()
        mainParticipant = nil
        debugLog(.debug)
    }
    
    func onRadarVolume(state: Data?) {
        guard let state = state else { return }
        let json = JSON(state)
        
        if let track = TracksStore.instance.screenShareTrack {
            let volume = json.screenVolume.double ?? 0
            track.audioTrack?.source.volume = volume
        }

        if json.isSubscriber.bool == true {
            AppManager.instance.radarView?.flick()
        }

        if let array = json.radarVolume.array {
            for json in array {
                guard
                    let id = json.id.string,
                    let track = TracksStore.participants[id] else {
                    continue
                }
                guard let audio = track.audioTrack else { return }
                let newVolume = json.volume.double!
                if audio.isEnabled == true && audio.source.volume != newVolume {
                    debugLog(.debug, String(
                        format: "Change audio volume for %@ from %.3f to %.3f",
                        id, audio.source.volume, newVolume
                    ))
                    track.audioTrack?.source.volume = newVolume
                }
            }
        }
    }
}

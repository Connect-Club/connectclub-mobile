//
// Created by Sergei Golishnikov on 08/09/2020.
// Copyright (c) 2020 CNNCT Limited. All rights reserved.
//

import Foundation
import WebRTC

public final class MediaStatsObservation: NSObject {
    
    private static let AUDIO_SOURCE_STATS_PREFIX = "RTCAudioSource"
    private static let AUDIO_LEVEL_STATS_KEY = "audioLevel"
    private static let webrtcAudioMaxLevel: Double = 32767 // Int16 max
    private static let audioLevelInterval: TimeInterval = 1 // 1.0s
    
    private var audioLevelTimer: Timer?
    private var audioLevelHandler: ((Int) -> Void)?
    private var observablePc: RTCPeerConnection?
    
    private let audioLevelQueue = DispatchQueue(
        label: "com.webrtc.audio_level.observation",
        qos: .utility
    )
    private var runLoop: CFRunLoop?

    public func startUpdatingLocalAudioTrackLevel(
        pc: RTCPeerConnection,
        handler: @escaping (Int) -> Void
    ) {
        audioLevelQueue.async { [weak self] in
            guard let self = self else { return }
            self.audioLevelHandler = handler
            self.observablePc = pc
            self.setLocalAudioLevelTimer()
        }
    }

    public func stopUpdatingLocalAudioTrackLevel() {
        DispatchQueue.main.async { [unowned self] in
            CFRunLoopStop(self.runLoop)
            self.clean()
        }
    }
    
    private func setLocalAudioLevelTimer() {
        audioLevelTimer = .scheduledTimer(
            timeInterval: Self.audioLevelInterval,
            target: self,
            selector: #selector(getAndSendAudioLevel),
            userInfo: nil,
            repeats: true
        )
        runLoop = RunLoop.current.getCFRunLoop()
        RunLoop.current.add(audioLevelTimer!, forMode: .default)
        RunLoop.current.run(mode: .default, before: Date.distantFuture)
    }
    
    @objc
    private func getAndSendAudioLevel() {
        guard let pc = observablePc, let handler = audioLevelHandler else {
            stopUpdatingLocalAudioTrackLevel()
            return
        }
        getAudioLevel(pc: pc, completion: handler)
    }
    
    private func findAudioStats(_ statistics: [String: RTCStatistics]) -> RTCStatistics? {
        for entry in statistics {
            if entry.key.starts(with: Self.AUDIO_SOURCE_STATS_PREFIX) &&
                entry.value.values.keys.contains(Self.AUDIO_LEVEL_STATS_KEY) {
                return entry.value
            }
        }
        return nil
    }

    private func getAudioLevel(pc: RTCPeerConnection, completion: @escaping (Int) -> Void) {
        pc.statistics(completionHandler: { [weak self] report in
            guard let self = self else { return }
            guard let stats = self.findAudioStats(report.statistics) else { return }
            guard let audioLevel = stats.values[Self.AUDIO_LEVEL_STATS_KEY] as? Double else { return }
            let volume = Int(audioLevel * Self.webrtcAudioMaxLevel)
            completion(volume)
        })
    }
    
    private func clean() {
        audioLevelTimer?.invalidate()
        audioLevelTimer = nil
        observablePc = nil
        audioLevelHandler = nil
    }
}

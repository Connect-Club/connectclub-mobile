//
//  AVAudioSessionConfigurator.swift
//  jitsi-webrtc
//
//  Created by Тарас Минин on 31/07/2020.
//  Copyright © 2020 CNNCT Limited. All rights reserved.
//

import AVFoundation
import NotificationCenter
import WebRTC

public final class AVAudioSessionConfigurator: NSObject {

    public static var initialBypass = false

    public static var headphonesWasConnected: Bool?

    public var onAudioInterruption: (_ isInterrupted: Bool) -> Void = { _ in }

    public var bypassVoiceEnabled: Bool {
        didSet {
            //rtcSession.bypassVoice = bypassVoiceEnabled
        }
    }
    
    // Change this flag to see logs
    private let debugAVAudioSession = true

    private let rtcSession = RTCAudioSession.sharedInstance()

    private var isUsingHeadphones: Bool = false

    public override init() {
        bypassVoiceEnabled = Self.initialBypass
        super.init()
        WebRTC.RTCSetMinDebugLogLevel(.warning)

        observeChangeRoute()
        observeMediaReset()
        observeInterruption()

        if Self.headphonesWasConnected == nil {
            isUsingHeadphones = checkHeadphonesConnected(route: rtcSession.session.currentRoute)
            defineAndSetOutput()
            Self.headphonesWasConnected = isUsingHeadphones
        }

        #if DEBUG
        // Uncomment if you want to check WebRTC logs
//        rtcLoggerInfo = RTCCallbackLogger()
//        rtcLoggerInfo?.severity = .info
//        rtcLoggerInfo?.start({ message in
//            debugPrint("📺 info", message)
//        })
//
//        rtcLoggerError = RTCCallbackLogger()
//        rtcLoggerError?.severity = .error
//        rtcLoggerError?.start({ message in
//            debugPrint("📺 error", message)
//        })
        #endif
    }
    
    private var rtcLoggerInfo: RTCCallbackLogger?
    private var rtcLoggerError: RTCCallbackLogger?
    
    private var interrupted = false
    
    func checkIfInterruptionUnhandled() {
        guard interrupted else { return }
        defineAndSetOutput()
    }
    
    private func setChatCategory() {
        do {
            debugP("Restoring session to play and record from:", rtcSession.category)
            rtcSession.lockForConfiguration()
            
            try rtcSession.setCategory(
                AVAudioSession.Category.playAndRecord.rawValue,
                with: [
                    .allowBluetooth,
                    .allowAirPlay,
                    .allowBluetoothA2DP,
                    .defaultToSpeaker
                ]
            )
            try rtcSession.setMode(AVAudioSession.Mode.videoChat.rawValue)
            try rtcSession.setActive(true)
            try rtcSession.overrideOutputAudioPort(.speaker)
            
            rtcSession.unlockForConfiguration()
            
        } catch {
            if debugAVAudioSession { debugP(error.localizedDescription) }
        }
    }

    private func observeChangeRoute() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(routeChanged),
            name: AVAudioSession.routeChangeNotification,
            object: nil
        )
    }
    
    private func observeMediaReset() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(mediaReset),
            name: AVAudioSession.mediaServicesWereResetNotification,
            object: nil
        )
    }
    
    private func observeInterruption() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleInterruption),
            name: AVAudioSession.interruptionNotification,
            object: nil
        )
    }

    @objc
    private func routeChanged(notification: Notification) {

        guard let userInfo = notification.userInfo else { return }
        guard let reasonValue = userInfo[AVAudioSessionRouteChangeReasonKey] as? UInt else { return }
        guard let reason = AVAudioSession.RouteChangeReason(rawValue: reasonValue) else { return }
        
        if debugAVAudioSession {
            if reason.rawValue == 3 {
                debugP(rtcSession.category)
            }
        }
        switch reason {
        case .override:
            checkIfInterruptionUnhandled()
        case .oldDeviceUnavailable, .newDeviceAvailable:
            isUsingHeadphones = checkHeadphonesConnected(route: rtcSession.session.currentRoute)
            defineAndSetOutput()
            Self.headphonesWasConnected = isUsingHeadphones
        case .categoryChange:
            if Self.headphonesWasConnected == false {
                setOutputToSpeaker()
            }
        default:
            break
        }
        if !interrupted,
            rtcSession.category != AVAudioSession.Category.playAndRecord.rawValue {
            setChatCategory()
        }
    }
    
    @objc
    private func mediaReset(notification: Notification) {
        defineAndSetOutput()
    }
    
    @objc
    private func handleInterruption(_ notification: Notification) {
        guard let userInfo = notification.userInfo else { return }
        guard let typeValue = userInfo[AVAudioSessionInterruptionTypeKey] as? UInt else { return }
        guard let type = AVAudioSession.InterruptionType(rawValue: typeValue) else { return }

        switch type {
        case .began:
            interrupted = true
            onAudioInterruption(true)
        case .ended:
            interrupted = false
            onAudioInterruption(false)
        @unknown default:
            fatalError()
        }
    }

    private func checkHeadphonesConnected(route: AVAudioSessionRouteDescription) -> Bool {

        for output in route.outputs {
            if output.portType == .builtInReceiver { continue }
            if output.portType == .builtInSpeaker { continue }
            debugP("found headset output: \(output.portType.rawValue)")

            return true
        }
        debugP("no headset")

        return false
    }

    private func defineAndSetOutput() {
        rtcSession.lockForConfiguration()
        if isUsingHeadphones {
            setOutputToDevice()
        } else {
            setOutputToSpeaker()
        }
        rtcSession.unlockForConfiguration()
    }

    private func setOutputToDevice() {
        do {
            try rtcSession.overrideOutputAudioPort(.none)
            if debugAVAudioSession { debugP("") }
        } catch {
            if debugAVAudioSession { debugP(error) }
        }
    }

    func setOutputToSpeaker() {
        do {
            try rtcSession.overrideOutputAudioPort(.speaker)
            if debugAVAudioSession { debugP("") }
        } catch {
            if debugAVAudioSession { debugP(error) }
        }
    }
}

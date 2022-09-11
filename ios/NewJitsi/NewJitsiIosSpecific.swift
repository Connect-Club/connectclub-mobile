//
//  NewJitsiIosSpecific.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 19/04/2021.
//

import Foundation
import JitsiWebRTC
import Common
import CallKit

open class NewJitsiIosSpecific: NSObject {
    var audioSession: AVAudioSessionConfigurator?
    var callCenter: CXCallObserver?
    
    var beforeMuteAudioWasEnabled = false
    var beforeMuteVideoWasEnabled = false
    static var isInCall = false
    var isInBackground = false

    func initialize() {
        audioSession = AVAudioSessionConfigurator()
        callCenter = CXCallObserver()
        callCenter?.setDelegate(self, queue: DispatchQueue.main)
        Self.isInCall = !callCenter!.calls.isEmpty
        
//        audioSession?.onAudioInterruption = {
//            [weak self] isInterrupted in
//            isInterrupted
//                ? self?.incomingCall()
//                : self?.endCall()
//        }
    }
    
    func incomingCall() {
        debugLog(.debug)
        NewJitsiIosSpecific.isInCall = true
        muteVideoAudio()
//        if isInBackground {
//            CommonUpdateVideoAudioPhoneState(false, false, NewJitsiIosSpecific.isInCall)
//        } else {
//            muteVideoAudio()
//        }
    }
    
    func endCall() {
        debugLog(.debug)
        NewJitsiIosSpecific.isInCall = false
        muteVideoAudio()
    }
    
    func phoneState(state: String) {
        debugLog(.debug, state)
        isInBackground = state == "background"
        
        if isInBackground {
            AppManager.speakers.values.forEach({
                $0.value?.hideBeforeRender(true)
            })
        } else {
            AppManager.speakers.values.forEach({
                $0.value?.renderFirstFrame()
            })
        }
        // in background and on call do nothing
        if isInBackground && !NewJitsiIosSpecific.isInCall { return muteVideo() }
        // is not in background and on call do nothing
        if !isInBackground && !NewJitsiIosSpecific.isInCall { return unMuteVideoAudio() }
    }
    
    func muteVideo() {
        let participant = TracksStore.instance.mainParticipant
        let videoEnabled = participant?.videoTrack?.isEnabled == true
        let audioEnabled = participant?.audioTrack?.isEnabled == true
        setVideo(false)
        beforeMuteVideoWasEnabled = videoEnabled
        AppManager.instance.room?.updateVideoAudioPhoneState(
            false,
            audioEnabled: audioEnabled,
            isOnPhoneCall: NewJitsiIosSpecific.isInCall
        )
    }
    
    func unMuteVideo() {
        let participant = TracksStore.instance.mainParticipant
        if beforeMuteVideoWasEnabled { setVideo(true) }
        let audioEnabled = participant?.audioTrack?.isEnabled == true
        AppManager.instance.room?.updateVideoAudioPhoneState(
            beforeMuteVideoWasEnabled,
            audioEnabled: audioEnabled,
            isOnPhoneCall: NewJitsiIosSpecific.isInCall
        )
    }
    
    func unMuteAudio() {
        let participant = TracksStore.instance.mainParticipant
        beforeMuteAudioWasEnabled = true
        setMicrophone(true)
        let videoEnabled = participant?.videoTrack?.isEnabled == true
        AppManager.instance.room?.updateVideoAudioPhoneState(
            videoEnabled,
            audioEnabled: beforeMuteAudioWasEnabled,
            isOnPhoneCall: NewJitsiIosSpecific.isInCall
        )
    }
    
    func muteVideoAudio() {
        let participant = TracksStore.instance.mainParticipant
        let videoEnabled = participant?.videoTrack?.isEnabled == true
        let audioEnabled = participant?.audioTrack?.isEnabled == true
        setMicrophone(false)
        setVideo(false)
        beforeMuteVideoWasEnabled = videoEnabled
        beforeMuteAudioWasEnabled = audioEnabled
        AppManager.instance.toggleVideoAudioButtons.forEach{ $0.toggleVideoAudio(false, false) }
    }
    
    func unMuteVideoAudio() {
        if beforeMuteVideoWasEnabled { setVideo(true) }
        if beforeMuteAudioWasEnabled { setMicrophone(true) }
        AppManager.instance.room?.updateVideoAudioPhoneState(
            beforeMuteVideoWasEnabled,
            audioEnabled: beforeMuteAudioWasEnabled,
            isOnPhoneCall: NewJitsiIosSpecific.isInCall
        )
    }
    
    func setVideo(_ isEnabled: Bool) {
        let participant = TracksStore.instance.mainParticipant
        guard let video = participant?.videoTrack else { return }
        video.isEnabled = isEnabled
        debugLog(.debug, "V=\(isEnabled)")
        if isEnabled { participant?.capturer?.startCapture() }
        else { participant?.capturer?.stopCapture() }
        beforeMuteVideoWasEnabled = isEnabled
    }

    func setMicrophone(_ isEnabled: Bool) {
        let participant = TracksStore.instance.mainParticipant
        guard let audio = participant?.audioTrack else { return }
        audio.isEnabled = isEnabled
        debugLog(.debug, "A=\(isEnabled)")
        beforeMuteAudioWasEnabled = isEnabled
    }
    
    func onDestroy() {
        callCenter?.setDelegate(nil, queue: nil)
        callCenter = nil
        audioSession = nil
    }
}

extension NewJitsiIosSpecific: CXCallObserverDelegate {
    public func callObserver(_ callObserver: CXCallObserver, callChanged call: CXCall) {
        debugLog(.debug, "call.hasConnected \(call.hasConnected) call.hasEnded \(call.hasEnded) call.isOutgoing \(call.isOutgoing)")
        if call.hasEnded {
            return endCall()
        }
        if !call.hasConnected && !call.hasEnded && !call.isOutgoing && !call.isOnHold {
            incomingCall()
        }
        if call.isOutgoing {
            incomingCall()
        }
    }
}

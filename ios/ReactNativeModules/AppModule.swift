//
//  AppModule.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 27/03/2021.
//

import Foundation
import Common
import React
import JitsiWebRTC
import react_native_check_network
import WebRTC

enum Event: String, CaseIterable {
    case onWebSocketMessage
    case onError
    case onRoomReconnecting
    case onChangeRoomMode
    case analyticsEvent
}

@objc(AppModule)
class AppModule: RCTEventEmitter, CommonDatatrackDelegateProtocol {

    private let queue = DispatchQueue(label: "AppModuleQueue", qos: .utility)
    let networkManager = NetworkReachabilityManager()

    var onDjModeChange: (Bool) -> Void = {_ in}

    private var connectToJitsiResolve: RCTPromiseResolveBlock?

    private let client = NewJitsi()

    private var hasListeners = false

    override func startObserving() {
        hasListeners = true
    }

    override func stopObserving() {
        hasListeners = false
    }

    override init() {
        super.init()
        CommonInitialize()

        self.networkManager?.startListening()
        self.networkManager?.listener = { status in
            switch status {
            case .notReachable:
                debugLog(.warning, "network=notReachable")
                AppManager.isOffline = true
            case .reachable:
                debugLog(.debug, "network=reachable")
                AppManager.isOffline = false
            case .unknown:
                debugLog(.error, "network=unknown")
            }
        }

        onDjModeChange = { [weak self] bypass in
            if let session = self?.client.audioSession {
                session.bypassVoiceEnabled = bypass
            }
            AVAudioSessionConfigurator.initialBypass = bypass
        }
    }

    func sendEvent(type: Event, body: Any!) {
        if !hasListeners { return }
        DispatchQueue.main.async {
            if !self.hasListeners { return }
            debugLog(.info, type.rawValue)
            self.sendEvent(withName: type.rawValue, body: body)
        }
    }

    @objc
    override public static func requiresMainQueueSetup() -> Bool {
        return true
    }

    override public func supportedEvents() -> [String]! {
        return Event.allCases.map({ $0.rawValue })
    }
    
    override func invalidate() {
        super.invalidate()
        AppManager.instance.room = nil
    }

    @objc
    func jvBusterSetSubscriptionType(_ type: String) {
        queue.async(flags: .barrier) {
            AppManager.instance.room?.setJvbusterSubscriptionType(type)
        }
    }

    @objc
    func preserveLogFile(
        _ resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        CommonPreserveLogFile(Logger.logDirPath, Logger.PRESERVED_LOG_FILE_NAME)
        resolver(nil)
    }

    // MARK: websocketsConnect
//    export interface WsConnectionData {
//      readonly isDebug: boolean
//      readonly endpoint: string
//      readonly url: string
//      readonly roomId: string
//      readonly accessToken: string
//      readonly roomPass: string
//      readonly userId: string
//      roomWidthMul: number
//      roomHeightMul: number
//      adaptiveBubbleSize: number
//      devicePixelRatio: number
//      roomName: string
//    }
    @objc
    func connectToRoom(
        _ json: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        queue.async(flags: .barrier) {
            let dict = toJSON(json: json)
            self.client.isQuite = false
            AppManager.setDestroying(false)
            AppManager.instance.localUserId = dict["userId"] as! String
            AppManager.instance.roomName = dict["roomName"] as! String
            
            self.client.setParams(
                dict["videoWidth"] as! Int,
                dict["videoHeight"] as! Int,
                dict["fps"] as! Int,
                dict["videoEnabled"] as! Bool,
                dict["audioEnabled"] as! Bool
            )
            
            var error: NSError?
            
            AppManager.instance.room = CommonConnectToLiveRoom(
                self,
                dict["url"] as? String,
                dict["roomId"] as? String,
                GoAsyncStorage.shared.getString("accessToken"),
                dict["roomPass", default: ""] as? String,
                dict["roomWidthMul"] as! Double,
                dict["roomHeightMul"] as! Double,
                dict["adaptiveBubbleSize"] as! Double,
                dict["devicePixelRatio"] as! Double,
                self.client,
                dict["address"] as? String,
                dict["token"] as? String,
                1, /// SubscriberView width in inches with best quality
                Double(UIDevice.physicalScreenWidth), /// Screen width in inches,
                NewJitsi.videoBandwidth,
                NewJitsi.audioBandwidth,
                &error)
            
            if error != nil {
                debugLog(.debug, "CommonConnectToLiveRoom error=\(String(describing: error))")
            }
            
            let isSuccess = error == nil && !AppManager.isDestroying
            debugLog(.debug, "isConnected=\(isSuccess) json=\(json)")
            resolver(isSuccess)
        }
    }
    
    func onStateChanged(_ newState: Int) {
        debugLog(.debug, "AppModule.onStateChanged newState=\(newState)")
        sendEvent(type: .onRoomReconnecting, body: newState == /*LiveRoomStateConnecting*/0)
        if newState == /*LiveRoomStateConnecting*/0 {
            AppManager.speakers.forEach { entry in
                entry.value.value?.disableVideo()
            }
        } else if newState == /*LiveRoomStateConnected*/1 {
            AppManager.instance.shouldUpdateUserPositionOnState = true
        }
    }

    // MARK: websocketsDisconnect
    @objc
    func disconnectFromRoom(
        _ resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        if AppManager.isDestroying {
            resolver(true)
            return
        }
        self.client.isQuite = true
        AppManager.setDestroying(true)
        AppManager.instance.toggleVideoAudioButtons = []

        queue.async(flags: .barrier) {
            if AppManager.instance.room == nil {
                debugLog(.warning, "user wasn't connected to websockets just return true")
                return resolver(true)
            }
            self.client.onDestroy()
            AppManager.instance.room!.disconnect()
            AppManager.instance.room = nil
            debugLog(.debug)
            AVAudioSessionConfigurator.headphonesWasConnected = nil
            resolver(true)
        }
    }

    @objc
    func websocketsSendMessage(_ message: String) {
        if client.isQuite { return }
        AppManager.instance.room?.sendMessage(message)
    }

    @objc
    func sendAudioVideoState(_ isVideoEnabled: Bool, isAudioEnabled: Bool) {
        AppManager.instance.room?.updateVideoAudioPhoneState(isVideoEnabled, audioEnabled: isAudioEnabled, isOnPhoneCall: NewJitsiIosSpecific.isInCall)
    }

    @objc
    func phoneState(_ state: String) {
        client.phoneState(state: state)
    }

    @objc
    func setDjMode(_ enabled: Bool) {
        onDjModeChange(enabled)
    }

    @objc
    private func toggleVideo(_ enable: Bool) {
        DispatchQueue.main.async {
            let buttons = AppManager.instance.toggleVideoAudioButtons
            if enable { buttons.forEach{ $0.enableVideo() } }
            else { buttons.forEach{ $0.disableVideo() } }
            AppManager.instance.newJitsi?.setVideo(enable)
        }
    }

    @objc
    private func toggleAudio(_ enable: Bool) {
        DispatchQueue.main.async {
            let buttons = AppManager.instance.toggleVideoAudioButtons
            if enable { buttons.forEach{ $0.enableAudio() } }
            else { buttons.forEach{ $0.disableAudio() } }
        }
    }

    // MARK: isThereOtherAdmin
    @objc
    func isThereOtherAdmin(
        _ resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        queue.async {
            resolver(AppManager.instance.room?.isThereOtherAdmin())
        }
    }

    // MARK: admins
    @objc
    func admins(
        _ resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        queue.async {
            guard let data = AppManager.instance.room?.admins(), let json = String(data: data, encoding: .utf8) else {
                return resolver([])
            }
            return resolver(json)
        }
    }

    // MARK: hands
    @objc
    func hands(
        _ resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        queue.async {
            guard let data = AppManager.instance.room?.hands(), let json = String(data: data, encoding: .utf8) else {
                return resolver([])
            }
            return resolver(json)
        }
    }

    @objc
    func getUniqueDeviceId(
        _ resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        guard let id = UIDevice.current.identifierForVendor else {
            debugLog(.error, "identifierForVendor is nil")
            resolver(UUID().uuidString)
            return
        }
        debugLog(.info, "identifierForVendor: \(id.uuidString)")
        resolver(id.uuidString)
    }

    func onMessage(_ json: String?) {
        guard let json = json else { return }
        if AppManager.isDestroying { return }
        sendEvent(type: .onWebSocketMessage, body: json)
    }

    func onReaction(_ json: Data?) {
        if AppManager.isDestroying { return }
        AppManager.instance.onReaction(json)
    }

    func onChangeRoomMode(_ mode: String?, isFirstConnection: Bool) {
        sendEvent(type: .onChangeRoomMode, body: ["mode": mode!, "isFirstConnection": isFirstConnection])
    }

    func onPath(_ userId: String?, x: Double, y: Double, duration: Double) {
        guard let userId = userId else { return }
        AppManager.instance.moveUserOnUI(userId, x, y, duration)
    }

    /*{
      userId: {
        id: string,
        x: float,
        y: float,
        audioLevel: int,
        video: boolean,
        audio: boolean,
        avatar: string,
        isExpired: boolean,
        isAdmin: boolean,
        isOwner: boolean,
        isSpeaker: boolean,
        name: string,
        surname: string,
        reaction: string | ""
      }
    }*/
    func onNativeState(_ json: Data?) {
        if AppManager.isDestroying { return }
        AppManager.instance.onNativeState(json)
    }

    /*{
       roomName: string,
       speakersCount: number,
       users: [
         {
           id: string,
           name: string,
           surname: string,
           avatar: string
           isAdmin: boolean
           reaction: string | ""
           isLocal: boolean
         }
       ]
    }*/
    func onPopupUsers(_ json: String?) {
        if AppManager.isDestroying { return }
        guard let json = json else { return }
        ListenersStore.shared.processListenersJson(JSON(toJSON(json: json)))
    }

    func onRadarVolume(_ json: Data?) {
        if AppManager.isDestroying { return }
        TracksStore.instance.onRadarVolume(state: json)
    }

    @objc
    func switchCamera() {
        DispatchQueue.main.async { [weak self] in
            self?.client.toggleUserCamera()
        }
    }

    func onConnectionState(_ json: Data?) {
        AppManager.instance.onConnectionState(state: json)
    }

    func onAnalyticsEvent(name: String, body: [String: String] = [:]) {
        sendEvent(type: .analyticsEvent, body: ["name": name, "body": body])
    }
    
    /// {shown: [String], hidden: [String]}
    func onParticipantsVisibilityChanged(_ json: String?) {
        guard let json = json else { return }
        let msg = JSON(toJSON(json: json))
        guard let shown = msg.shown.array?.compactMap({ $0.string }) else { return }
        guard let hidden = msg.hidden.array?.compactMap({ $0.string }) else { return }
        debugLog(.debug, "shown=\(shown), hidden=\(hidden)")
        hidden.forEach{
            AppManager.speakers[$0]?.value?.hideBeforeRender()
        }
        shown.forEach{
            AppManager.speakers[$0]?.value?.renderFirstFrame()
        }
    }
}

extension AppModule: CommonMediaDelegateProtocol {
    func onPlay(_ url: String?, userId: String?) {
        debugPrint("❗️ play user \(userId) video file url \(url)")
    }
    
    func onPrepare(_ url: String?, userId: String?) {
        debugPrint("❗️ prepare user \(userId) video file url \(url)")
    }
}

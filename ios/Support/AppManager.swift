//
//  AppManager.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 10/04/2021.
//

import Foundation
import Common
import JitsiWebRTC

final class WeakSpeakerRef {
    weak var value: SpeakerView?
    init(value: SpeakerView) {
        self.value = value
    }
}

final class AppManager {
    static let instance = AppManager()
    
    static var isJitsiConnected = false
    
    static let isDestroyingSync = DispatchQueue(label: "isDestroying")
    static var isOffline = false
    
    private static var _isDestroying = false
    
    static var isDestroying: Bool {
        isDestroyingSync.sync {
            return _isDestroying
        }
    }
    
    static func setDestroying(_ isDestroying: Bool) {
        isDestroyingSync.sync {
            debugLog(.debug, isDestroying)
            _isDestroying = isDestroying
        }
    }
    
    var speakers = [String: WeakSpeakerRef]()
    weak var shareScreenVideoView: ShareDesktopContainerView?
    var toggleVideoAudioButtons: Set<ToggleVideoAudioButtons> = []
    
    weak var targetPathView: TargetPathView?
    weak var radarView: RadarView?
    var localUserId: String = ""
    var roomName: String = ""
    
    weak var newJitsi: NewJitsi?
    var room: CommonLiveRoom?
    
    var shouldUpdateUserPositionOnState = true
    
    static var speakers: [String: WeakSpeakerRef] {
        return instance.speakers
    }
    
    static var currentSpeaker: SpeakerView? {
        return speakers[instance.localUserId]?.value
    }
    
    static var localUserId: String { instance.localUserId }
    
    var onNewSpeaker: ((WeakSpeakerRef) -> Void)?
    
    func addSpeaker(_ id: String, _ view: SpeakerView) {
        let weakRef = WeakSpeakerRef(value: view)
        speakers[id] = weakRef
        
        onNewSpeaker?(weakRef)
    }
    
    func removeSpeaker(_ id: String) {
        speakers.removeValue(forKey: id)
        room?.removeReaction(id)
    }
    
    func sendMove(x: CGFloat, y: CGFloat) {
        debugLog(.info, x, y)
        targetPathView?.move(x, y)
        room?.sendUserPath(Double(x), toY: Double(y))
    }
    
    func moveUserTo(
        _ user: UIView,
        _ x: CGFloat,
        _ y: CGFloat,
        _ duration: Double,
        _ userId: String
    ) {
        // wait radar only for current user
        if radarView == nil && userId == localUserId { return }
        if userId == localUserId {
            targetPathView?.move(x, y)
        }
        
        let halfWidth = user.frame.width / 2
        let halfHeight = user.frame.width / 2
        let tx = user.frame.origin.x + halfWidth
        let ty = user.frame.origin.y + halfHeight
        if Int(tx) == Int(x) && Int(ty) == Int(y)  { return }
        
        if x == 0 || y == 0 {
            let speaker = (user as? SpeakerView)
            speaker?.move(x, y)
            speaker?.isHidden = true
            if userId == Self.instance.localUserId {
                Self.instance.radarView?.move(x, y)
                Self.instance.radarView?.isHidden = true
                Self.instance.targetPathView?.isHidden = true
            }
            return
        }

        debugLog(.debug, "id=\(userId) x=\(x) y=\(y) t=\(duration)")
        UIView.animate(withDuration: user.frame.origin.x <= 0 ? 0 : duration) {
            (user as? SpeakerView)?.move(x, y)
            if userId == Self.instance.localUserId {
                Self.instance.radarView?.move(x, y)
            }
        }
    }
    
    func moveUser(
        _ userId: String,
        _ x: Double,
        _ y: Double
    ) {
        if AppManager.isDestroying { return }
        guard let view = Self.instance.speakers[userId]?.value else { return }
        let isFirstPosition = view.frame.origin.x <= 0 || view.frame.origin.y <= 0
        if shouldUpdateUserPositionOnState || isFirstPosition {
            debugLog(.debug, "initial move id=\(userId) x=\(x) y=\(y)")
            moveUserTo(view, CGFloat(x), CGFloat(y), 1, userId)
        }
    }
    
    func moveUserOnUI(
        _ userId: String,
        _ x: Double,
        _ y: Double,
        _ duration: Double
    ) {
        DispatchQueue.main.async {
            if AppManager.isDestroying { return }
            guard let view = Self.instance.speakers[userId]?.value else { return }
            Self.instance.moveUserTo(view, CGFloat(x), CGFloat(y), duration, userId)
        }
    }
    
    func onNativeCurrentUserState(
        _ userId: String?,
        x: Double,
        y: Double,
        scale: Double
    ) {
        guard let userId = userId else { return }
        guard let view = Self.instance.speakers[userId]?.value else { return }
        moveUserOnUI(userId, x, y, 1)
        DispatchQueue.main.async {
            view.animateScale(scale)
        }
    }
    
    func onNativeState(_ json: Data?) {
        let jsonDict = dataToJSON(data: json) as! [[String: Any]]
        DispatchQueue.main.async {
            for entry in jsonDict {
                let i = AppManager.instance
                let model = JSON(entry)
                let id = model.id.string!
                i.moveUser(
                    id,
                    model.x.double!,
                    model.y.double!
                )
                if AppManager.isDestroying { return }
                if let view = i.speakers[id]?.value {
                    if let scale = model.audioLevel.double { view.animateScale(scale) }
                    view.onState(state: model)
                }
                
                if id == Self.instance.localUserId {
                    Self.instance.toggleVideoAudioButtons.forEach{ $0.onState(model) }
                }
            }
            self.shouldUpdateUserPositionOnState = false
        }
    }
    
    func onReaction(_ json: Data?) {
        guard let json = json else { return }
        guard let reaction = try? JSON(data: json) else { return }
        DispatchQueue.main.async { [weak self] in
            let id = reaction.payload.fromId.string!
            let type = reaction.payload.reaction.string!
            
            if let view = self?.speakers[id] {
                view.value?.toggleReaction(id: id, type)
            } else {
                ListenersStore.shared.onNewReaction?(id, type)
            }
        }
    }
    
    func onConnectionState(state: Data?) {
        guard let state = state else { return }
        guard let json = try? JSON(data: state) else { return }
        if json.id.string != localUserId { return }
        
        DispatchQueue.main.async {
            self.toggleVideoAudioButtons.forEach{ $0.isVisible = false }
            if json.mode.string != "popup" { return }
            guard let speaker = Self.speakers[self.localUserId]?.value else {
                return
            }
            self.moveUserTo(speaker, 0, 0, 1, self.localUserId)
        }
    }
    
    func sendViewPort(_ rect: CGRect) {
        room?.setViewport(
            Double(rect.origin.x),
            y1: Double(rect.origin.y),
            x2: Double(rect.maxX),
            y2: Double(rect.maxY)
        )
    }
}

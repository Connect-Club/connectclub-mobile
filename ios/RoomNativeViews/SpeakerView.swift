//
//  SpeakerView.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 10/04/2021.
//

import Foundation
import UIKit
import JitsiWebRTC

extension UIView {
    public var isVisible: Bool {
        get { !isHidden }
        set {
            isHidden = !newValue
            alpha = isHidden ? 0 : 1
        }
    }
}

final class SpeakerView: BaseMovableView {

    var userId: String = ""
    var size: CGFloat = 0
    var isAdmin = false
    var isBadgedUser = false
    var isSpecialSpeaker = false
    var isLocal = false {
        didSet {
            if !isLocal { return }
            // Make local user statuses and reactions views appear on top of any other user's views
            if let chaser = statusChaser {
                chaser.layer.zPosition = 3
            }
            if let chaser = reactionsChaser {
                chaser.layer.zPosition = 3
            }
        }
    }
    var isSharingVisible = false
    
    var onCreateStatusChaserView: ((SpeakerChaserView) -> Void)?
    var onCreateReactionsChaserView: ((SpeakerChaserView) -> Void)?
    
    private weak var statusChaser: SpeakerChaserView?
    private weak var reactionsChaser: SpeakerChaserView?
    private weak var videoViewContainer: SpeakerVideoViewContainer?
    fileprivate weak var userReactionView: UserReactionsView?
    fileprivate weak var userBadgeView: UIView?
    fileprivate weak var userSpeakerView: UserSpeakerMicrophoneIconsView?
    fileprivate weak var userScreenShareView: UIView?
    fileprivate weak var userTogglesView: UserTogglesView?
    
    
    @objc
    var onClick: RCTBubblingEventBlock?
    
    override var isHidden: Bool {
        didSet {
            statusChaser?.isHidden = isHidden
            reactionsChaser?.isHidden = isHidden
        }
    }
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        clipsToBounds = false
        let tap = UITapGestureRecognizer(target: self, action: #selector(onViewClick))
        addGestureRecognizer(tap)
    }
    
    func onState(state: JSON) {
        videoViewContainer?.onState(state: state, userId: userId)
        userTogglesView?.onState(state)
        
        size = CGFloat(state.size.double ?? 0)
        isLocal = state.isLocal.bool == true
        isAdmin = state.isAdmin.bool == true
        isBadgedUser = !(state.badges.array ?? []).isEmpty
        isSpecialSpeaker = state.isSpecialGuest.bool == true

        let isExpired = state.isExpired.bool == true
        let isReaction = state.reaction.string != "none"

        userBadgeView?.isVisible = (isSpecialSpeaker || isBadgedUser || isAdmin) && !isReaction
        userSpeakerView?.onState(state)
        userReactionView?.onState(state)
        userScreenShareView?.isVisible = isSharingVisible && !isExpired && !isReaction
    }
    
    func toggleReaction(id: String, _ type: String) {
        let noReaction = type == "none"
        userReactionView?.toggleReaction(id: id, type)
        userBadgeView?.isVisible = (isSpecialSpeaker || isBadgedUser || isAdmin) && noReaction
        if noReaction {
            userTogglesView?.showIfNeed()
            userScreenShareView?.isVisible = isSharingVisible
        } else {
            userTogglesView?.isVisible = false
            userScreenShareView?.isVisible = false
        }
    }
    
    func showScreenSharing() {
        isSharingVisible = true
    }
    
    func hideScreenSharing() {
        isSharingVisible = false
    }
    
    @objc
    func onViewClick() {
        onClick?(["user": [
            "id": userId,
            "isAdmin": isAdmin,
            "mode": "room",
            "isLocal": isLocal
        ]])
    }
    
    @objc
    func setPath(_ path: NSArray) {
        let x = CGFloat((path[0] as! NSNumber).doubleValue)
        let y = CGFloat((path[1] as! NSNumber).doubleValue)
        let userId = (path[2] as! String)
        AppManager.instance.moveUserTo(self, x, y, 1, userId)
    }
    
    @objc
    func setUserId(_ userId: NSString) {
        self.userId = userId as String
        AppManager.instance.addSpeaker(userId as String, self)
    }
    
    func animateScale(_ scale: Double) {
        let scaleF = CGFloat(scale)
        if scaleF == self.transform.a { return }
        UIView.animate(withDuration: 0.25) {
            self.transform = .init(scaleX: scaleF, y: scaleF)
        }
    }
    
    func disableVideo() {
        videoViewContainer?.disableVideo()
    }
    
    func enableVideo() {
        videoViewContainer?.enableVideo()
    }
    
    func hideBeforeRender(_ forced: Bool = false) {
        DispatchQueue.main.async { [unowned self] in
            self.videoViewContainer?.hideBeforeRender(forced)
        }
    }
    
    func renderFirstFrame() {
        DispatchQueue.main.async { [unowned self] in
            self.videoViewContainer?.renderFirstFrame()
        }
    }
    
    func mirror(_ isMirror: Bool) {
        videoViewContainer?.mirror(isMirror)
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
    }
    
    override func addSubview(_ view: UIView) {
        super.addSubview(view)
        
        if statusChaser == nil || reactionsChaser == nil {
            createChaserViews()
        }
        
        if view is SpeakerVideoViewContainer {
            videoViewContainer = view as? SpeakerVideoViewContainer
            return
        }
        
        if view is UserReactionsView {
            userReactionView = view as? UserReactionsView
            view.isVisible = false
            reactionsChaser!.addSubview(view)
            return
        }
        if view.accessibilityLabel == "UserBadgeView" {
            userBadgeView = view
            statusChaser!.addSubview(view)
            return
        }

        if view.accessibilityLabel == "UserScreenShareView" {
            userScreenShareView = view
            view.isVisible = false
            statusChaser!.addSubview(view)
            return
        }
        if view is UserTogglesView {
            userTogglesView = view as? UserTogglesView
            statusChaser!.addSubview(view)
            return
        }
        
        if view is UserSpeakerMicrophoneIconsView {
            userSpeakerView = view as? UserSpeakerMicrophoneIconsView
            view.isVisible = false
            statusChaser!.addSubview(view)
            return
        }
    }
    
    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        super.touchesBegan(touches, with: event)
    }
    
    private func createChaserViews() {
        guard let statusHandler = onCreateStatusChaserView else { return }
        let statusChaser = SpeakerChaserView(chaseTarget: self)
        self.statusChaser = statusChaser
        statusHandler(statusChaser)
        
        guard let reactionsHandler = onCreateReactionsChaserView else { return }
        let reactionsChaser = SpeakerChaserView(chaseTarget: self)
        self.reactionsChaser = reactionsChaser
        reactionsHandler(reactionsChaser)
    }
    
    deinit {
        statusChaser?.removeFromSuperview()
        reactionsChaser?.removeFromSuperview()
        AppManager.instance.removeSpeaker(userId)
    }
}

final class SpeakerChaserView: UIView {
    
    private var frameFollowObservation: NSKeyValueObservation!
    private var transformObservation: NSKeyValueObservation!
 
    init(chaseTarget: SpeakerView) {
        super.init(frame: chaseTarget.frame)
        
        frameFollowObservation = chaseTarget.observe(\.frame, changeHandler: { [weak self] view, _ in
            self?.frame = view.frame
        })

        transformObservation = chaseTarget.observe(\.transform, changeHandler: { [weak self] view, _ in
            self?.transform = view.transform
        })
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func removeFromSuperview() {
        super.removeFromSuperview()
        frameFollowObservation.invalidate()
        frameFollowObservation = nil

        transformObservation.invalidate()
        transformObservation = nil
    }
}

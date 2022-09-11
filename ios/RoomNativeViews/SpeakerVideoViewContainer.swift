//
//  SpeakerVideoViewContainer.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 02/05/2021.
//

import Foundation

import UIKit
import JitsiWebRTC
import NVActivityIndicatorView

@objc(SpeakerVideoViewContainer)
class SpeakerVideoViewContainer: UIView {
    private weak var subscriberView: SubscriberView?
    private let activityIndicator = NVActivityIndicatorView(
        frame: .zero,
        type: .ballScale,
        color: .white,
        padding: 0
    )
    
    override func addSubview(_ view: UIView) {
        super.addSubview(view)
        if view is SubscriberView {
            subscriberView = view as? SubscriberView
            if activityIndicator.superview == nil {
                addSubview(activityIndicator)
                activityIndicator.frame = view.frame
            }
            return
        }
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        activityIndicator.frame = .init(origin: .zero, size: frame.size)
    }
    
    func onState(state: JSON, userId: String) {
        if state.isExpired == true {
            subscriberView?.disableVideo(activityIndicator)
            return
        }

        let currentId = userId == TracksStore.mainParticipant?.endpoint
        let inRadar = state.inRadar.bool == true || currentId
        let video = state.video.bool == true
        let isCurrentUser = AppManager.localUserId == userId
        if isCurrentUser {
            subscriberView?.isVisible = inRadar && video
        } else {
            subscriberView?.isVisible = inRadar && video && subscriberView?.isFirstFrameRendered == true
        }
        if inRadar && video {
            subscriberView?.enableVideo(activityIndicator)
        } else { subscriberView?.disableVideo(activityIndicator) }
    }
    
    func disableVideo() {
        subscriberView?.disableVideo(activityIndicator)
    }
    
    func enableVideo() {
        subscriberView?.enableVideo(activityIndicator)
    }
    
    func hideBeforeRender(_ forced: Bool = false) {
        subscriberView?.hideBeforeRender(forced)
    }
    
    func renderFirstFrame() {
        subscriberView?.renderFirstFrame(activityIndicator)
    }
    
    func mirror(_ isMirror: Bool) {
        subscriberView?.setIsMirror(isMirror)
    }

}

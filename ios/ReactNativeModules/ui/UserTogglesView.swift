//
//  UserTogglesView.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 13/05/2021.
//

import Foundation
import UIKit
import JitsiWebRTC

func countIcons(_ video: Bool, _ audio: Bool) -> CGFloat {
    var count: CGFloat = 0
    if !video { count += 1 }
    if !audio { count += 1 }
    return count
}

@objc(UserTogglesView)
class UserTogglesView: UIView {
    private weak var audioIconView: UIView?
    private weak var videoIconView: UIView?

    private var iconsCount: Int = 0
    
    var audio = false
    var video = false
    
    func onState(_ state: JSON) {
        let isReaction = state.reaction.string != "none"
        video = state.video.bool == true
        audio = state.audio.bool == true
        
        isVisible = (!video || !audio) && !isReaction
        if isHidden { return }
        
        videoIconView?.isHidden = video
        audioIconView?.isHidden = audio

        let count: Int = (video ? 0 : 1) + (audio ? 0 : 1)

        if let audioView = audioIconView, iconsCount != count {
            iconsCount = count
            frame.size.height = CGFloat(count) * audioView.frame.width
        }
        if !audio && video { audioIconView?.frame.origin.y = 0 }
        if !audio && !video { videoIconView?.frame.origin.y = 0 }
        if !audio && !video {
            videoIconView?.frame.origin.y = 0
            audioIconView?.frame.origin.y = frame.size.height / 2
        }
    }
    
    func showIfNeed() {
        isVisible = (!video || !audio)
    }
    
    override func addSubview(_ view: UIView) {
        super.addSubview(view)
        if view.accessibilityLabel == "audioIconView" {
            audioIconView = view
            view.isHidden = true
        }
        
        if view.accessibilityLabel == "videoIconView" {
            videoIconView = view
            view.isHidden = true
        }
    }
}

//
//  UserSpeakerMicrophoneIconsView.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 13/05/2021.
//

import Foundation
import UIKit

@objc(UserSpeakerMicrophoneIconsView)
final class UserSpeakerMicrophoneIconsView: UIView {

    override init(frame: CGRect) {
        super.init(frame: frame)
        accessibilityIdentifier = "speakerMicrophoneIcon"
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    func onState(_ state: JSON) {
        let isExpired = state.isExpired.bool == true
        let isSpeaker = state.isSpeaker.bool == true
        let isAbsoluteSpeaker = state.isAbsoluteSpeaker.bool == true

        isVisible = isSpeaker && !isExpired

        let isLocal = state.isLocal.bool == true
        if isLocal {
            if isSpeaker && !isAbsoluteSpeaker {
                AppManager.instance.radarView?.hide()
            } else {
                AppManager.instance.radarView?.show()
            }
        }
    }

    override func addSubview(_ view: UIView) {
        super.addSubview(view)
        if view.accessibilityLabel == "icSpeakerOn" {
            view.isHidden = true
        }
    }
}

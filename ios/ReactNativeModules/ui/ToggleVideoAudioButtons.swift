//
//  ToggleVideoAudioButtons.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 13/05/2021.
//

import Foundation
import UIKit
import Common
import React
import AVFoundation

@objc(ToggleVideoAudioButtons)
final class ToggleVideoAudioButtons: UIView {
    weak var cameraContainer: UIView?
    weak var audioContainer: UIView?

    weak var cameraButton: RasterIcon?
    weak var audioButton: RasterIcon?

    private var micOnIcon: String?
    private var micOffIcon: String?
    private var cameraOnIcon: String?
    private var cameraOffIcon: String?
    
    var isVideoEnabled = false
    var isAudioEnabled = false

    private lazy var cameraActivity: UIActivityIndicatorView = {
        let activity = UIActivityIndicatorView(style: .medium)
        activity.startAnimating()
        return activity
    }()

    private lazy var audioActivity: UIActivityIndicatorView = {
        let activity = UIActivityIndicatorView(style: .medium)
        activity.startAnimating()
        return activity
    }()
    
    private var cameraButtonEnabled: Bool {
        cameraContainer?.isUserInteractionEnabled == true
    }

    private var audioButtonEnabled: Bool {
        audioContainer?.isUserInteractionEnabled == true
    }

    override init(frame: CGRect) {
        super.init(frame: frame)
        AppManager.instance.toggleVideoAudioButtons.insert(self)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    @objc
    func setMicOnIcon(_ icon: String) { micOnIcon = icon }
    @objc
    func setMicOffIcon(_ icon: String) { micOffIcon = icon }
    @objc
    func setCameraOnIcon(_ icon: String) { cameraOnIcon = icon }
    @objc
    func setCameraOffIcon(_ icon: String) { cameraOffIcon = icon }

    func onState(_ state: JSON) {
        tryGetRasterIcons()

        if !isVisible && state.mode.string == "room" { isVisible = true }
        let isVideo = state.video.bool == true
        let isAudio = state.audio.bool == true

        if isVideo == isVideoEnabled && !cameraButtonEnabled {
            cameraContainer?.isUserInteractionEnabled = true
            cameraButton?.alpha = 1
            cameraActivity.isVisible = false
            cameraButton?.setUri(isVideo ? cameraOnIcon : cameraOffIcon)
        } else if isVideo != isVideoEnabled {
            isVideoEnabled = isVideo
            cameraButton?.setUri(isVideo ? cameraOnIcon : cameraOffIcon)
        }

        if (isAudio == isAudioEnabled && !audioButtonEnabled) {
            audioContainer?.isUserInteractionEnabled = true
            audioButton?.alpha = 1
            audioActivity.isVisible = false
            audioButton?.setUri(isAudio ? micOnIcon : micOffIcon)
        } else if isAudio != isAudioEnabled {
            isAudioEnabled = isAudio
            audioButton?.setUri(isAudio ? micOnIcon : micOffIcon)
        }
    }

    private func tryGetRasterIcons() {
        var isRasterIconsSettled = false
        if cameraButton == nil, let sub = cameraContainer?.subviews.first(where: { $0.isKind(of: RasterIcon.self) }) {
            cameraButton = sub as? RasterIcon
            isRasterIconsSettled = true
            cameraContainer?.isUserInteractionEnabled = true
        }

        if audioButton == nil, let sub = audioContainer?.subviews.first(where: { $0.isKind(of: RasterIcon.self) }) {
            audioButton = sub as? RasterIcon
            isRasterIconsSettled = true
            audioContainer?.isUserInteractionEnabled = true
        }

        if !isRasterIconsSettled { return }
        toggleButtonsOpacity()
    }

    override func addSubview(_ view: UIView) {
        super.addSubview(view)

        if view.accessibilityLabel == "cameraButton" {
            cameraContainer = view
            view.addSubview(cameraActivity)
            cameraActivity.isVisible = false

            guard let sub = view.subviews.first as? RasterIcon else {
                cameraContainer?.isUserInteractionEnabled = false
                return
            }
            cameraButton = sub
            toggleButtonsOpacity()

        } else if view.accessibilityLabel == "microphoneButton" {
            audioContainer = view
            view.addSubview(audioActivity)
            audioActivity.isVisible = false

            guard let sub = view.subviews.first as? RasterIcon else {
                audioContainer?.isUserInteractionEnabled = false
                return
            }
            audioButton = sub
            toggleButtonsOpacity()
        }
    }

    private func toggleButtonsOpacity() {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            if !AppManager.isJitsiConnected {
                self.toggleVideoAudio(false, false)
            }
        }
    }

    @objc
    public func toggleVideo() {
        if (!cameraButtonEnabled) { return }
        if !AppManager.isJitsiConnected { return }
        if !cameraButtonEnabled { return }
        toggleVideoAudio(!isVideoEnabled, isAudioEnabled)
    }

    @objc
    public func toggleAudio() {
        if (!audioButtonEnabled) { return }
        if !AppManager.isJitsiConnected { return }
        if !audioButtonEnabled { return }
        toggleVideoAudio(isVideoEnabled, !isAudioEnabled)
    }
    
    func disableVideo() { toggleVideoAudio(false, isAudioEnabled) }
    func disableAudio() { toggleVideoAudio(isVideoEnabled, false) }
    func enableVideo() { toggleVideoAudio(true, isAudioEnabled) }
    func enableAudio() { toggleVideoAudio(isVideoEnabled, true) }

    func toggleVideoAudio(_ isVideoEnabled: Bool, _ isAudioEnabled: Bool) {
        if AppManager.isOffline { return }
        // receive new video state
        if isVideoEnabled != self.isVideoEnabled {
            cameraContainer?.isUserInteractionEnabled = false
            cameraButton?.alpha = 0
            cameraActivity.frame = cameraButton!.frame
            cameraActivity.isVisible = true
            cameraButton?.setUri(isVideoEnabled ? cameraOnIcon : cameraOffIcon)
            self.isVideoEnabled = isVideoEnabled
        }
        // receive new audio state
        if isAudioEnabled != self.isAudioEnabled {
            audioContainer?.isUserInteractionEnabled = false
            audioButton?.alpha = 0
            audioActivity.frame = audioButton!.frame
            audioActivity.isVisible = true
            audioButton?.setUri(isAudioEnabled ? micOnIcon : micOffIcon)
            self.isAudioEnabled = isAudioEnabled
        }

        AppManager.instance.newJitsi?.setVideo(isVideoEnabled)
        AppManager.instance.newJitsi?.setMicrophone(isAudioEnabled)
        AppManager.instance.room?.updateVideoAudioPhoneState(
            isVideoEnabled,
            audioEnabled: isAudioEnabled,
            isOnPhoneCall: NewJitsiIosSpecific.isInCall
        )
    }
}

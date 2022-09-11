//
//  ShareDesktopContainerView.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 04/05/2021.
//

import Foundation
import UIKit
import React

final class ShareDesktopContainerView: UIView {

    static var fullscreenHud: UIView?

    @objc
    var allowToShare: Bool = false {
        didSet {
            clickButton.isVisible = allowToShare
        }
    }

    @objc
    var onShareClick: RCTBubblingEventBlock?

    private var heightConstraint: NSLayoutConstraint!
    private var videoView: SubscriberView?
    private var isDisableLocked = false
    private var videoTapGr: UITapGestureRecognizer?
    private var fullscreenVC: FullscreenVideoController?
    private weak var mainSuperview: UIView?

    private let clickButton: UIButton = {
        let view = UIButton()
        view.setTitle("        Tap to share screen        ", for: .normal)
        view.accessibilityIdentifier = "shareScreenButton"
        view.backgroundColor = UIColor(
            red: 255 / 255.0,
            green: 255 / 255.0,
            blue: 255 / 255.0,
            alpha: 0.3
        )
        view.setTitleColor(.white, for: .normal)
        return view
    }()

    override init(frame: CGRect) {
        super.init(frame: frame)
        AppManager.instance.shareScreenVideoView = self
        addSubview(clickButton)
        clickButton.translatesAutoresizingMaskIntoConstraints = false
        clickButton.centerXAnchor.constraint(equalTo: centerXAnchor).isActive = true
        clickButton.centerYAnchor.constraint(equalTo: centerYAnchor).isActive = true
        heightConstraint = clickButton.heightAnchor.constraint(equalToConstant: 0)
        heightConstraint.isActive = true
        clickButton.addTarget(self, action: #selector(handleClick), for: .touchUpInside)
    }

    override func layoutSubviews() {
        super.layoutSubviews()

        let height = bounds.height / 5
        heightConstraint.constant = height
        clickButton.layer.cornerRadius = height / 2
        clickButton.titleLabel?.font = .boldSystemFont(ofSize: height / 2)
    }

    override func addSubview(_ view: UIView) {
        if view.accessibilityLabel == "shareScreenHUD" {
            Self.fullscreenHud = view
            return
        }
        super.addSubview(view)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    @objc
    func handleClick() {
        onShareClick?([:])
    }

    func enableVideo(userId: String) {
        guard let videoView = videoView else {
            DispatchQueue.main.async {
                self.setupVideoContainer(userId)
            }
            return
        }
        videoView.enableVideo(nil)
    }

    func disableVideo() {
        DispatchQueue.main.async {
            if self.isDisableLocked { return }
            if self.videoView == nil { return }
            self.isDisableLocked = true
            self.videoView?.disableVideo(nil)
            if self.fullscreenVC != nil {
                self.fullscreenVC?.sharingStopped()
                return
            }
            self.videoView?.removeFromSuperview()
            self.videoView = nil
            self.isDisableLocked = false
            self.clickButton.isVisible = self.allowToShare
        }
    }

    private func setupVideoContainer(_ id: String) {
        videoView = SubscriberView()
        videoView?.setTrackId(id)
        videoView?.frame = bounds
        addSubview(videoView!)

        videoTapGr = UITapGestureRecognizer(target: self, action: #selector(didTapVideoContainer))
        videoView?.addGestureRecognizer(videoTapGr!)

        clickButton.isVisible = false
        videoView?.enableVideo(nil)
    }

    @objc
    private func didTapVideoContainer() {
        guard let video = videoView else { return }
        guard fullscreenVC == nil else { fatalError() }

        if mainSuperview == nil {
            mainSuperview = findMainSuperview()
        }
        AppManager.instance.newJitsi?.appModule?.onAnalyticsEvent(name: "click_video_screen_fullscreen")
        let convertedFrame = convert(bounds, to: mainSuperview)
        video.videoView.videoContentMode = .scaleAspectFit

        mainSuperview?.addSubview(video)
        video.frame = convertedFrame

        fullscreenVC = FullscreenVideoController()
        fullscreenVC?.showVideo(video: video, frame: convertedFrame)

        fullscreenVC?.onLeaveFullscreenPrepare = { [unowned self] in
            self.mainSuperview?.addSubview(self.videoView!)
            self.videoView!.frame = convertedFrame
            self.videoView!.center = self.mainSuperview!.center
        }

        fullscreenVC?.onLeaveFullscreenComplete = { [unowned self] in
            UIView.animate(withDuration: 0.3, animations: { [unowned self] in
                self.videoView!.transform = .identity
                self.videoView!.frame = convertedFrame
            }) { [unowned self] _ in
                guard let video = self.videoView else { return }
                video.removeFromSuperview()
                self.fullscreenVC = nil

                if self.isDisableLocked {
                    self.videoView = nil
                    self.isDisableLocked = false
                    self.clickButton.isVisible = self.allowToShare
                } else {
                    self.addSubview(video)
                    video.frame = self.bounds
                    video.videoView.videoContentMode = .scaleAspectFill
                }
            }
        }
    }

    private func findMainSuperview() -> UIView {
        var sup = superview
        while sup != nil {
            if sup?.accessibilityLabel == "RoomLayoutView" {
                sup = sup?.superview
                break
            } else {
                sup = sup?.superview
            }
        }
        assert(sup != nil)

        return sup!
    }

    deinit {
        fullscreenVC?.dispose()
        fullscreenVC = nil
    }
}

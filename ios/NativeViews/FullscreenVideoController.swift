//
//  FullscreenVideoController.swift
//  connectreactive
//
//  Created by Тарас Минин on 08/07/2021.
//

import Foundation
import UIKit
import NotificationCenter

final class FullscreenVideoController: UIViewController {
    
    static private let buttonSize: CGFloat = 55
    static private let animationDuration: TimeInterval = 0.3
    static private let interfaceShowDuration: TimeInterval = 3

    override var supportedInterfaceOrientations: UIInterfaceOrientationMask {
        .landscape
    }

    override var preferredInterfaceOrientationForPresentation: UIInterfaceOrientation {
        .landscapeRight
    }
    
    var isInFullscreen = false
    var onLeaveFullscreenPrepare: () -> Void = {}
    var onLeaveFullscreenComplete: () -> Void = {}
    
    private weak var fullVideo: UIView?
    
    private var initialFrame: CGRect = .zero
    
    private var window: FullscreenVideoWindow!
    
    private var interfaceShown = false {
        didSet {
            mediaToggles?.isUserInteractionEnabled = interfaceShown
        }
    }
    
    private var interfaceTimer: Timer?

    private lazy var zoomView: UIScrollView = {
        let view = UIScrollView()
        view.minimumZoomScale = 1
        view.maximumZoomScale = 3
        view.backgroundColor = .clear
        view.isUserInteractionEnabled = false
        view.delegate = self

        return view
    }()

    private var zoomTapGr: UITapGestureRecognizer?
    
    private lazy var leaveFullscreenButton: UIButton = {
            
        let button = UIButton()
        button.setImage(UIImage(named: "fullscreen_icon"), for: .normal)
        button.backgroundColor = .white
        button.tintColor = UIColor.black.withAlphaComponent(0.87)
        button.layer.cornerRadius = Self.buttonSize / 2
        
        let shadowPath = UIBezierPath(
            roundedRect: CGRect(
                origin: .zero,
                size: CGSize(width: Self.buttonSize, height: Self.buttonSize)
            ),
            cornerRadius: Self.buttonSize / 2
        )
        button.layer.shadowPath = shadowPath.cgPath
        button.layer.shadowColor = UIColor.black.withAlphaComponent(0.25).cgColor
        button.layer.shadowOpacity = 1
        button.layer.shadowRadius = 4
        button.layer.shadowOffset = CGSize(width: 0, height: 4)
        
        return button
    }()

    private lazy var interfaceView = InterfaceView()

    private weak var mediaToggles: UIView?

    // MARK: - Controller Layout
    
    init() {
        super.init(nibName: nil, bundle: nil)
        UIDevice.current.beginGeneratingDeviceOrientationNotifications()

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(didChangeOrientation),
            name: UIDevice.orientationDidChangeNotification,
            object: nil
        )

        window = FullscreenVideoWindow()
        window.windowLevel = .alert
        window.backgroundColor = .clear
        window.rootViewController = self
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        view.addSubview(zoomView)
        view.addSubview(interfaceView)
        interfaceView.addSubview(leaveFullscreenButton)
        view.backgroundColor = .clear

        leaveFullscreenButton.addTarget(
            self,
            action: #selector(animateContainerHide),
            for: .touchUpInside
        )

        if fullVideo != nil {
            showFullscreenMode()
        }

        zoomTapGr = UITapGestureRecognizer(target: self, action: #selector(didTapZoomView))
        zoomView.addGestureRecognizer(zoomTapGr!)
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        interfaceView.frame = CGRect(
            x: 0,
            y: view.bounds.height - Self.buttonSize - 16 - window.safeAreaInsets.bottom,
            width: view.bounds.width,
            height: Self.buttonSize
        )
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        mediaToggles?.frame = view.bounds
        leaveFullscreenButton.frame = CGRect(
            x: interfaceView.frame.width - window.safeAreaInsets.right - Self.buttonSize - 16,
            y: 0,
            width: Self.buttonSize,
            height: Self.buttonSize
        )
    }

    // MARK: - Show / hide fullscreen mode
    private var currentOrientation = UIDevice.current.orientation

    @objc
    func didChangeOrientation() {
        let newOrientation = UIDevice.current.orientation
        if newOrientation == currentOrientation { return }
        switch newOrientation {
        case .landscapeRight, .landscapeLeft:
            currentOrientation = newOrientation
        default: break
        }
    }
    
    func showVideo(video: UIView, frame: CGRect) {
        initialFrame = frame
        video.isUserInteractionEnabled = false

        let yScale = view.bounds.height / initialFrame.height
        let rLandscape = currentOrientation == .landscapeRight

        UIView.animate(withDuration: Self.animationDuration, animations: { [unowned self] in
            video.center = CGPoint(x: self.view.center.y, y: self.view.center.x)
            video.transform = CGAffineTransform(
                rotationAngle: rLandscape ? -CGFloat.pi / 2 : CGFloat.pi / 2
            ).scaledBy(
                x: yScale,
                y: yScale
            )
        }, completion: { [weak self] _ in
            self?.fullVideo = video
            self?.showFullscreenMode()
        })
    }

    private func showFullscreenMode() {
        if isInFullscreen { return }
        if !isViewLoaded { return }

        zoomView.isUserInteractionEnabled = true
        isInFullscreen = true
        window.isHidden = false
        window.makeKeyAndVisible()

        view.backgroundColor = .black
        fullVideo?.transform = .identity
        zoomView.frame = view.bounds
        zoomView.addSubview(fullVideo!)
        fullVideo!.frame = zoomView.bounds

        attachToogleControls()
        showInterface()
    }

    func sharingStopped() {
        zoomView.setZoomScale(1, animated: true)
        fullVideo?.removeFromSuperview()
        fullVideo = nil
        showInterface(withHideTimer: false)
    }

    @objc
    func animateContainerHide() {
        hideInterface()

        guard let video = fullVideo else {
            onLeaveFullscreenComplete()
            dispose()
            return
        }

        let rLandscape = currentOrientation == .landscapeRight
        let rotation = rLandscape ? -CGFloat.pi / 2 : CGFloat.pi / 2
        let yScale = video.frame.height / initialFrame.height
        let offset = zoomView.contentOffset
        let adjusted = zoomView.adjustedContentInset

        onLeaveFullscreenPrepare()
        window.isHidden = true

        video.transform = CGAffineTransform(
            rotationAngle: rotation
        ).scaledBy(
            x: yScale,
            y: yScale
        )

        if offset != .zero {
            video.frame.origin = CGPoint(
                x: -video.frame.width + offset.y + view.frame.height,
                y: -offset.x + adjusted.left * 2
            )
        }
        video.isUserInteractionEnabled = true
        
        onLeaveFullscreenComplete()
        dispose()
    }

    @objc
    func didTapZoomView() {
        if fullVideo == nil { return animateContainerHide() }
        interfaceShown ? hideInterface() : showInterface()
    }

    func dispose() {
        window.isHidden = true
        fullVideo = nil
        mediaToggles?.removeFromSuperview()
        mediaToggles = nil
        interfaceTimer?.invalidate()
        interfaceTimer = nil
        window.rootViewController = nil
        window = nil

        UIDevice.current.endGeneratingDeviceOrientationNotifications()
    }

    // MARK: - Private methods
    
    private func attachToogleControls() {

        if let controls = ShareDesktopContainerView.fullscreenHud {
            view.addSubview(controls)
            mediaToggles = controls
            controls.frame = view.bounds
        }
        view.setNeedsLayout()
        view.layoutIfNeeded()
    }
    
    private func showInterface(withHideTimer: Bool = true) {
        interfaceShown = true

        if withHideTimer { startTimer() }
        
        UIView.animate(withDuration: Self.animationDuration / 2) {
            self.mediaToggles?.alpha = 1
            self.interfaceView.alpha = 1
        }
    }

    private func hideInterface() {
        interfaceTimer?.invalidate()
        interfaceShown = false
        UIView.animate(withDuration: Self.animationDuration / 2) {
            self.mediaToggles?.alpha = 0
            self.interfaceView.alpha = 0
        }
    }

    private func startTimer() {
        interfaceTimer?.invalidate()
        interfaceTimer = .scheduledTimer(
            withTimeInterval: Self.interfaceShowDuration + Self.animationDuration,
            repeats: false,
            block: { [weak self] _ in
                self?.hideInterface()
            }
        )
    }
}

extension FullscreenVideoController: UIScrollViewDelegate {
    func viewForZooming(in scrollView: UIScrollView) -> UIView? {
        return fullVideo
    }

    func scrollViewDidZoom(_ scrollView: UIScrollView) {
        fullVideo!.center = ZoomImageView.contentCenter(
            forBoundingSize: view.bounds.size,
            contentSize: scrollView.contentSize
        )
    }
}

final class FullscreenVideoWindow: UIWindow {
    override func point(inside point: CGPoint, with event: UIEvent?) -> Bool {
        return !isHidden
    }
}

private final class InterfaceView: UIView {
    override func hitTest(_ point: CGPoint, with event: UIEvent?) -> UIView? {
        let view = super.hitTest(point, with: event)
        return view == self ? nil : view
    }
}

//
//  ZoomImageView.swift
//  connectreactive
//
//  Created by Тарас Минин on 01/03/2021.
//

import UIKit
import React

final class ZoomableView: UIView {}

@objc
final class ZoomImageView: UIScrollView, UIScrollViewDelegate {
    
    // MARK: - Private Properties

    private var bgSize: CGSize?
    
    private var maxZoom: Float?
    
    private var oldSize: CGSize?
    
    private weak var userListView: UIView?
    
    private var tapGr: UITapGestureRecognizer?

    private let internalZoomableView: ZoomableView = {
        let view = ZoomableView()
        view.layer.allowsEdgeAntialiasing = true
        return view
    }()

    private var zoomableView: UIView? {
        didSet {
            oldValue?.removeFromSuperview()
            guard let view = zoomableView else { return }
            view.transform = .identity
            zoomScale = 1
            internalZoomableView.insertSubview(view, at: 0)
            oldSize = nil
        }
    }
    
    private lazy var statusLayerView: UIView = {
        let view = UIView()
        view.isUserInteractionEnabled = false
        view.layer.zPosition = 12
        return view
    }()
    
    private lazy var reactionsLayerView: UIView = {
        let view = UIView()
        view.isUserInteractionEnabled = false
        view.layer.zPosition = 13
        return view
    }()
    
    private lazy var viewportSender: ViewportSending = ViewportSender()
    
    private var currentViewPort: CGRect {
        convert(bounds, to: internalZoomableView)
    }

    // MARK: - Initializers

    override public init(frame: CGRect) {
        super.init(frame: frame)
        setup()
    }

    public required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        setup()
    }
    
    // MARK: - Override Methods
    
    override func layoutSubviews() {
        super.layoutSubviews()

        if zoomableView != nil, oldSize != bounds.size {
            updateImageView()
            oldSize = bounds.size
        }
    }
    
    override func addSubview(_ view: UIView) {
        if view.accessibilityLabel == "bgImage" {
            zoomableView = view
            updateImageView()

        } else if view.accessibilityLabel == "UsersList" {
            userListView = view
            internalZoomableView.addSubview(view)
            updateImageView()

            let tapGr = UITapGestureRecognizer(target: self, action: #selector(didTapRoom(_:)))
            tapGr.numberOfTapsRequired = 1
            view.addGestureRecognizer(tapGr)
            self.tapGr = tapGr

        } else {
            super.addSubview(view)
        }
    }

    override func removeFromSuperview() {
        super.removeFromSuperview()
        subviews.forEach { $0.removeFromSuperview() }
        zoomableView = nil
    }

    override var intrinsicContentSize: CGSize {
        internalZoomableView.intrinsicContentSize
    }
    
    // MARK: - Custom Methods
    
    private func setup() {
        contentInsetAdjustmentBehavior = .never

        backgroundColor = .clear
        delegate = self
        showsVerticalScrollIndicator = false
        showsHorizontalScrollIndicator = false
        addSubview(internalZoomableView)
        
        internalZoomableView.addSubview(statusLayerView)
        internalZoomableView.addSubview(reactionsLayerView)
        
        AppManager.instance.onNewSpeaker = { speaker in
            speaker.value?.onCreateStatusChaserView = { [weak self] chaser in
                guard let layer = self?.statusLayerView else { return }
                layer.addSubview(chaser)
                speaker.value?.onCreateStatusChaserView = nil
            }
            speaker.value?.onCreateReactionsChaserView = { [weak self] chaser in
                guard let layer = self?.reactionsLayerView else { return }
                layer.addSubview(chaser)
                speaker.value?.onCreateReactionsChaserView = nil
            }
        }
    }

    private func minimumScale(aspectRatio: CGSize, boundingSize: CGSize) -> CGFloat {
        let widthRatio = (boundingSize.width / aspectRatio.width)
        let heightRatio = (boundingSize.height / aspectRatio.height)

        if widthRatio < heightRatio { return widthRatio }
        return heightRatio
    }

    @objc
    private func didTapRoom(_ gr: UIGestureRecognizer) {
        let point = gr.location(in: zoomableView)
        AppManager.instance.sendMove(x: point.x, y: point.y)
    }

    private func updateImageView() {
        guard let zoomableView = zoomableView else { return }
        guard !bounds.isEmpty else { return }
        guard var size = bgSize else { return }

        debugLog(.info, size)
        size.height = round(size.height)
        size.width = round(size.width)

        zoomScale = 1
        contentSize = size

        self.transform = .identity
        zoomableView.transform = .identity
        zoomableView.frame.size = size
        zoomableView.frame.origin = .zero
        
        internalZoomableView.frame.size = size
        userListView?.frame.size = size
        statusLayerView.frame = zoomableView.frame
        reactionsLayerView.frame = zoomableView.frame

        minimumZoomScale = minimumScale(aspectRatio: size, boundingSize: bounds.size)
        zoomScale = minimumZoomScale
        maximumZoomScale = bounds.size.width / (size.width / CGFloat(maxZoom!))

        sendViewPort()
    }

    private func sendViewPort() {
        viewportSender.updateViewPort(currentViewPort)
    }

    // MARK: - UIScrollViewDelegate

    @objc public dynamic func scrollViewDidZoom(_: UIScrollView) {
        internalZoomableView.center = ZoomImageView.contentCenter(forBoundingSize: bounds.size, contentSize: contentSize)
    }

    @objc public dynamic func scrollViewWillBeginZooming(_: UIScrollView, with _: UIView?) {}

    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        sendViewPort()
    }
    
    func scrollViewDidEndZooming(_ scrollView: UIScrollView, with view: UIView?, atScale scale: CGFloat) {
        sendViewPort()
    }

    @objc public dynamic func viewForZooming(in _: UIScrollView) -> UIView? {
        internalZoomableView
    }

    @inline(__always)
    static func contentCenter(
        forBoundingSize boundingSize: CGSize,
        contentSize: CGSize
    ) -> CGPoint {
        let horizontalOffset = (boundingSize.width > contentSize.width) ? ((boundingSize.width - contentSize.width) * 0.5) : 0.0
        let verticalOffset = (boundingSize.height > contentSize.height) ? ((boundingSize.height - contentSize.height) * 0.5) : 0.0

        return CGPoint(x: contentSize.width * 0.5 + horizontalOffset, y: contentSize.height * 0.5 + verticalOffset)
    }
}

extension ZoomImageView {

    // MARK: - React Native Properties

    @objc
    func setOptions(_ options: NSDictionary) {
        guard let width = options["width"] as? Float else { fatalError() }
        guard let height = options["height"] as? Float else { fatalError() }
        
        /// In case we don't get maxZoom we should calculate it manually = width / avatar size
        let maxZoom = options["maxZoom"] as? Float ?? (width / 480.0)

        self.maxZoom = maxZoom
        let size = CGSize(
            width: CGFloat(width),
            height: CGFloat(height)
        )
        self.bgSize = size
        oldSize = nil
        updateImageView()
    }
}

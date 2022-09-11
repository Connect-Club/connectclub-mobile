//
//  VideoTrackRenderer.swift
//  jitsi-webrtc
//
//  Created by Тарас Минин on 04/08/2020.
//  Copyright © 2020 CNNCT Limited. All rights reserved.
//

import WebRTC

public class VideoTrackRendererView: UIView {
    
    public var rtcVideoRenderer: RTCVideoRenderer {
        rendererView
    }

    private lazy var rendererView: RTCRendererVideoWrapper = {
        let view = RTCRendererVideoWrapper()
        addSubview(view.realRenderer)
        return view
    }()

    public var videoContentMode: UIView.ContentMode {
        get { rendererView.videoContentMode }
        set { rendererView.videoContentMode = newValue }
    }

    public func mirrorImage(_ isMirror: Bool) {
        if isMirror {
            rendererView.realRenderer.transform = CGAffineTransform(scaleX: -1, y: 1)
        } else {
            rendererView.realRenderer.transform = .identity
        }
    }

    public init() {
        super.init(frame: .zero)
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override public func layoutSubviews() {
        super.layoutSubviews()
        rendererView.realRenderer.frame = bounds
    }
    
    public func render() { rendererView.render() }
    public func stopRender() { rendererView.stopRender() }

    public func setFirstFrameHandler(handler: @escaping () -> Void) {
        rendererView.onFirstFrameDisposableListener = handler
    }
}

private final class RTCRendererVideoWrapper: NSObject, RTCVideoRenderer {
    public var onFirstFrameDisposableListener: (() -> Void)?

    weak var delegate: VideoRendererDelegate?
    
    private var frameCounter: UInt8 = 0
    private let skipFrames: UInt8 = 1
    private var skipRender = false
    

    func setSize(_ size: CGSize) {
        realRenderer.setSize(size)
    }
    
    func render() { skipRender = false }
    func stopRender() { skipRender = true }

    func renderFrame(_ frame: RTCVideoFrame?) {
        if skipRender { return }
        if let handler = onFirstFrameDisposableListener {
            if frameCounter == skipFrames {
                handler()
                onFirstFrameDisposableListener = nil
                frameCounter = 0
            } else {
                frameCounter += 1
            }
        }

        realRenderer.renderFrame(frame)
    }

    #if targetEnvironment(simulator)
    lazy var realRenderer = RTCEAGLVideoView()
    #else
    lazy var realRenderer: RTCMTLVideoView = {
        let view = RTCMTLVideoView()
        view.videoContentMode = .scaleAspectFill

        return view
    }()
    #endif

    #if targetEnvironment(simulator)
    var videoContentMode: UIView.ContentMode = .center
    #else
    var videoContentMode: UIView.ContentMode {
        get { realRenderer.videoContentMode }
        set { realRenderer.videoContentMode = newValue }
    }
    #endif
}

protocol VideoRendererDelegate: AnyObject {
    func didCatchFirstFrame()
}

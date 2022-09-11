//
//  SubscriberView.swift
//  connectreactive
//
//  Created by Тарас Минин on 01/03/2021.
//

import JitsiWebRTC
import UIKit
import NVActivityIndicatorView

final class SubscriberView: BaseParticipantView {

    var participant: RemoteParticipant?

    private var lastTrackId: String?
    var isFirstFrameRendered = false

    @objc
    func setTrackId(_ trackId: String) {
        self.identifier = trackId
    }

    func disableVideo(_ activityIndicator: NVActivityIndicatorView?) {
        if lastTrackId == nil { return }
        self.isFirstFrameRendered = false
        DispatchQueue.main.async {
            activityIndicator?.stopAnimating()
            self.unsubscribe()
        }
    }
    
    func enableVideo(_ activityIndicator: NVActivityIndicatorView?) {
        if AppManager.isDestroying { return }
        let participant = TracksStore.videoTrack(for: identifier)
        let newTrackId = participant?.videoTrack?.trackId
        if self.lastTrackId == newTrackId { return }
        if participant?.videoTrack?.isEnabled != true { return }
        self.isFirstFrameRendered = false
        DispatchQueue.main.async {
            self.setParticipant(participant!)
            self.setupActivityIndicator(activityIndicator)
            self.lastTrackId = newTrackId
        }
    }
    
    private func setupActivityIndicator(_ activ: NVActivityIndicatorView?) {
        guard let activ = activ else { return }
        guard TracksStore.mainParticipant?.endpoint != self.identifier else { return }
        guard participant?.videoTrack?.isEnabled == true else { return }
        activ.isHidden = false
        activ.startAnimating()
        firstFrameRendered = {
            activ.stopAnimating()
            activ.isHidden = true
        }
    }
    
    func hideBeforeRender(_ forced: Bool = false) {
        isFirstFrameRendered = false
        isVisible = false
        if forced { videoView.stopRender() }
    }
    
    func renderFirstFrame(_ activityIndicator: NVActivityIndicatorView?) {
        setupActivityIndicator(activityIndicator)
        videoView.render()
        
        videoView.setFirstFrameHandler { [weak self] in
            DispatchQueue.main.async {
                self?.isFirstFrameRendered = true
                self?.isVisible = true
                self?.firstFrameRendered?()
                self?.firstFrameRendered = nil
            }
        }
    }
    
    @objc
    func setIsMirror(_ isMirror: Bool) {
        videoView.mirrorImage(isMirror)
    }

    var firstFrameRendered: (() -> Void)?

    // MARK: - Public Methods

    init() {
        super.init(frame: .zero)
        isVisible = false
    }

    private func setParticipant(_ participant: RemoteParticipant) {
        participant.videoTrack?.remove(videoView.rtcVideoRenderer)

        self.participant = participant
        identifier = participant.endpoint
        isVisible = false
        if participant.videoTrack == nil { return }

        participant.videoTrack!.add(videoView.rtcVideoRenderer)
        renderFirstFrame(nil)
    }

    private func unsubscribe() {
        participant?.videoTrack?.remove(videoView.rtcVideoRenderer)
        participant = nil
        isVisible = false
        isFirstFrameRendered = false
        lastTrackId = nil
    }
}

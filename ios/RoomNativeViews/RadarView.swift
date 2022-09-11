//
//  SpeakerView.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 10/04/2021.
//

import Foundation
import UIKit
import JitsiWebRTC

final class RadarView: BaseMovableView {

    private static let flickDuration: TimeInterval = 0.6
    
    private var isAnimating = false

    private var originalAlpha: CGFloat = 1
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        AppManager.instance.radarView = self
    }
    
    func flick() {
        if isAnimating { return }

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            if self.isAnimating { return }
            guard self.alpha > 0 else { return }

            self.isAnimating = true
            let originalAlpha = self.alpha
            let originalRaduis = self.layer.shadowRadius
            
            let flickAnimations: [AnimationBlock] = [
                (0.25, { $0.alpha = originalAlpha / 2.0 }),
                (0.25, {
                    $0.layer.shadowRadius = $0.layer.borderWidth
                    $0.alpha = 1
                }),
                (0.5, {
                    $0.alpha = originalAlpha
                    $0.layer.shadowRadius = originalRaduis
                })
            ]
            self.animateKeyframes(
                duration: Self.flickDuration,
                flickAnimations,
                { [weak self] in self?.isAnimating = false }
            )
        }
    }

    func hide() {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            guard self.alpha > 0 else { return }
            if self.isAnimating { return }

            self.isAnimating = true

            UIView.animate(withDuration: 0.2, delay: 0, options: .curveEaseIn) { [weak self] in
                guard let self = self else { return }
                self.transform = .init(scaleX: 0.3, y: 0.3)
                self.originalAlpha = self.alpha
                self.alpha = 0
            } completion: { [weak self] _ in
                self?.isAnimating = false
            }
        }
    }

    func show() {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            if self.alpha > 0 { return }
            if self.isAnimating { return }

            self.isAnimating = true

            UIView.animate(withDuration: 0.2, delay: 0, options: .curveEaseOut) { [weak self] in
                guard let self = self else { return }
                self.transform = .identity
                self.alpha = self.originalAlpha
            } completion: { [weak self] _ in
                self?.isAnimating = false
            }
        }
    }
}

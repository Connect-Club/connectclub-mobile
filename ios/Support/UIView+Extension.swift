//
//  UIView+Extension.swift
//  connectreactive
//
//  Created by Тарас Минин on 25.11.2021.
//

import UIKit

extension UIView {
    
    typealias AnimationBlock = (relativeDuration: TimeInterval, block: (UIView) -> Void)
    
    func animateKeyframes(duration: TimeInterval, _ animations: [AnimationBlock], _ completion: @escaping () -> Void) {
        
        guard !animations.isEmpty else {
            completion()
            return
        }
        
        UIView.animateKeyframes(withDuration: duration, delay: 0, options: []) {
            var startTime: TimeInterval = 0
            for an in animations {
                UIView.addKeyframe(
                    withRelativeStartTime: startTime,
                    relativeDuration: an.relativeDuration,
                    animations: { [weak self] in
                        guard let self = self else { return }
                        an.block(self)
                    })
                startTime += an.relativeDuration
            }
        } completion: { _ in completion() }
    }
}

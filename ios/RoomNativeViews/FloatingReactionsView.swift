//
//  FloatingReactionsView.swift
//  connectreactive
//
//  Created by Тарас Минин on 30.03.2022.
//

import Foundation
import UIKit
import Lottie

struct FloatingReaction {
    let reaction: UIImage
    let xOrigin: CGFloat
}

final class FloatingReactionsView: UIView {

    override public init(frame: CGRect) {
        super.init(frame: frame)
        setup()
    }

    public required init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        setup()
    }

    private func setup() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(animateReactionNotif(_:)),
            name: .newListenerReaction, object: nil
        )
    }

    @objc
    private func animateReactionNotif(_ notification: Notification) {
        guard let object = notification.object as? FloatingReaction else {
            return
        }
        let container = UIImageView(image: object.reaction)
        addSubview(container)
        container.frame = CGRect(
            x: object.xOrigin,
            y: bounds.maxY - 40,
            width: 30,
            height: 30
        )
        container.contentMode = .scaleAspectFit
        animateReaction(container)
    }

    private func animateReaction(_ view: UIView) {
        let floatHeight = (bounds.height + 40) * 0.7
        let animationDuration: TimeInterval = 5

        let yFloat = CABasicAnimation(keyPath: "transform.translation.y")
        yFloat.duration = animationDuration
        yFloat.timeOffset = TimeInterval.random(in: (0...1))
        yFloat.byValue = -floatHeight + CGFloat.random(in: (-20...20))
        view.layer.add(yFloat, forKey: "float")

        let alphaFade = CABasicAnimation(keyPath: "opacity")
        alphaFade.duration = animationDuration
        alphaFade.fromValue = CGFloat.random(in: (0.7...1))
        alphaFade.toValue = 0
        view.layer.add(alphaFade, forKey: "alphaFade")

        let xShake = CABasicAnimation(keyPath: "transform.translation.x")
        xShake.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
        xShake.timeOffset = TimeInterval.random(in: (0...1))
        xShake.repeatDuration = animationDuration + yFloat.timeOffset
        xShake.duration = 1.5
        xShake.autoreverses = true
        xShake.byValue = 20
        view.layer.add(xShake, forKey: "shake")

        DispatchQueue.main.asyncAfter(deadline: .now() + animationDuration + yFloat.timeOffset) {
            view.removeFromSuperview()
        }
    }
}

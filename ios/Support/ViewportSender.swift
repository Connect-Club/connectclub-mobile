//
//  ViewportSender.swift
//  connectreactive
//
//  Created by Тарас Минин on 15.12.2021.
//

import Foundation

protocol ViewportSending {
    func updateViewPort(_ rect: CGRect)
}

final class ViewportSender: ViewportSending {
    
    private static let sendMinimumInterval: TimeInterval = 0.5
    
    private var needResendViewPort: Bool = false
    
    private var sendViewPortLocked: Bool = false
    
    private var viewPortTimer: Timer?
    
    private var viewPort: CGRect = .zero
    
    func updateViewPort(_ rect: CGRect) {
        guard rect != .zero else { return }
        viewPort = rect
        sendViewPort()
    }
    
    @objc
    private func unlockAndSendViewPortIfNeeded() {
        viewPortTimer?.invalidate()
        viewPortTimer = nil
        
        DispatchQueue.main.async { [unowned self] in
            self.sendViewPortLocked = false
            if self.needResendViewPort {
                self.sendViewPort()
            }
        }
    }
    
    private func sendViewPort() {
        if sendViewPortLocked {
            needResendViewPort = true
            return
        }
        sendViewPortLocked = true
        needResendViewPort = false
        
        DispatchQueue.global().async { [unowned self] in
            self.setViewPortLockTimer()
        }
        AppManager.instance.sendViewPort(viewPort)
    }
    
    private func setViewPortLockTimer() {
        viewPortTimer = .scheduledTimer(
            timeInterval: Self.sendMinimumInterval,
            target: self,
            selector: #selector(unlockAndSendViewPortIfNeeded),
            userInfo: nil,
            repeats: false
        )
        RunLoop.current.add(viewPortTimer!, forMode: .default)
        RunLoop.current.run()
    }
}

//
//  RNMessageComposer.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 09/04/2021.
//

import Foundation
import MessageUI
import React

@objc(RNMessageComposer)
class RNMessageComposer: RCTEventEmitter, MFMessageComposeViewControllerDelegate {

    override class func requiresMainQueueSetup() -> Bool {
        return true
    }

    override func supportedEvents() -> [String]! {
        return ["send"]
    }

    @objc
    func send(_ recipient: String, body: String) {
        if !MFMessageComposeViewController.canSendText() { return }
        DispatchQueue.main.async {
            let controller = self.configuredMessageComposeViewController(body: body, recipient: recipient)
            _ = self.present(viewController: controller)
        }
    }

    // Configures and returns a MFMessageComposeViewController instance
    func configuredMessageComposeViewController(body: String, recipient: String) -> MFMessageComposeViewController {
        let messageComposeVC = MFMessageComposeViewController()
        messageComposeVC.messageComposeDelegate = self
        messageComposeVC.recipients = [recipient]
        messageComposeVC.body = body
        return messageComposeVC
    }

    // MFMessageComposeViewControllerDelegate callback - dismisses the view controller when the user is finished with it
    func messageComposeViewController(_ controller: MFMessageComposeViewController, didFinishWith result: MessageComposeResult) {
        controller.dismiss(animated: true, completion: nil)
    }

    func getTopViewController(window: UIWindow?) -> UIViewController? {
        if let window = window {
            var top = window.rootViewController
            while true {
                if let presented = top?.presentedViewController {
                    top = presented
                } else if let nav = top as? UINavigationController {
                    top = nav.visibleViewController
                } else if let tab = top as? UITabBarController {
                    top = tab.selectedViewController
                } else {
                    break
                }
            }
            return top
        }
        return nil
    }

    func present(viewController: UIViewController) -> Bool {
        let keyWindows = UIApplication.shared
            .connectedScenes
            .compactMap{ $0 as? UIWindowScene }
            .flatMap{ $0.windows }
            .filter{ $0.isKeyWindow}
        
        guard keyWindows.count == 1 else { fatalError() }
        
        if let topVc = getTopViewController(window: keyWindows.first) {
            topVc.present(viewController, animated: true, completion: nil)
            return true
        }
        return false
    }
}

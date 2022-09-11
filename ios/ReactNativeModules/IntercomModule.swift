//
//  IntercomModule.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 03/06/2021.
//

import Foundation
import React
import Intercom

@objc(IntercomModule)
class IntercomModule: RCTEventEmitter {
    
    override func supportedEvents() -> [String]! { [] }
    override class func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    @objc
    func registerUnidentifiedUser() {
        Intercom.registerUnidentifiedUser()
    }
    
    @objc
    func setLauncherVisibility(_ isVisible: Bool) {
        Intercom.setLauncherVisible(isVisible)
    }
    
    @objc
    func loginUser(_ userId: String) {
        Intercom.registerUser(withUserId: userId)
    }
    
    @objc
    func logoutUser() {
        Intercom.logout()
    }
    
    @objc
    func presentIntercom() {
        Intercom.presentMessenger()
    }
    
    @objc
    func presentIntercomCarousel() {
        Intercom.presentCarousel("19961407")
    }
}

//
//  CaptureScreenShot.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 08/07/2021.
//

import Foundation
import UIKit
import React

@objc(CaptureScreenShot)
class CaptureScreenShot: RCTEventEmitter {
    
    override class func requiresMainQueueSetup() -> Bool {
        false
    }
    
    override func supportedEvents() -> [String]! {
        []
    }
    
    @objc
    func takeScreenShot(
        _ resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        resolver("screenShot")
    }
}

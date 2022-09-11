//
//  UserReactionsView.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 25/05/2021.
//

import Foundation
import UIKit
import Common

@objc(UserReactionsView)
class UserReactionsView: UIView {
    private var currentReaction: String = "none"
    private var dispatchImtem: DispatchWorkItem?
    
    func onState(_ state: JSON) {
        toggleReaction(id: state.id.string!, state.reaction.string!)
    }

    func toggleReaction(id: String, _ newReaction: String) {
        let isReaction = newReaction != "none"
        if !isReaction {
            currentReaction = newReaction
            isVisible = false
            dispatchImtem?.cancel()
            dispatchImtem = nil
            return
        }

        if currentReaction == newReaction {return}
        isVisible = true
        currentReaction = newReaction
        dispatchImtem?.cancel()
        dispatchImtem = nil
        dispatchImtem = DispatchWorkItem(block: { [weak self] in
            self?.isVisible = false
            self?.currentReaction = "none"
            AppManager.instance.room?.removeReaction(id)
        })
        DispatchQueue.main.asyncAfter(deadline: .now() + 10, execute: dispatchImtem!)
    }
}

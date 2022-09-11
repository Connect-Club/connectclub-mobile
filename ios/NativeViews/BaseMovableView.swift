//
//  BaseMovableView.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 19/04/2021.
//

import Foundation
import UIKit

open class BaseMovableView: UIView {
    override init(frame: CGRect) {
        super.init(frame: frame)
        transform = .init(translationX: -5000, y: -5000)
    }

    @available(*, unavailable)
    required public init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    func move(_ x: CGFloat, _ y: CGFloat) {
        if transform.tx < 0 { transform = .identity }
        let x = x - frame.width / 2
        let y = y - frame.height / 2
        self.frame.origin = .init(x: x, y: y)
    }
}


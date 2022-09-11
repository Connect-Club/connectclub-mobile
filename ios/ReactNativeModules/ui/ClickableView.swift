//
//  ClickableView.swift
//  connectreactive
//
//  Created by Тарас Минин on 13.10.2021.
//

import Foundation
import UIKit

@objc(ClickableView)
class ClickableView: UIView {
    @objc
    var onClick: RCTBubblingEventBlock?
    
    override init(frame: CGRect) {
        super.init(frame: frame)
        let tap = UITapGestureRecognizer(target: self, action: #selector(onViewClick))
        addGestureRecognizer(tap)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
    }
    
    @objc
    func onViewClick() {
        onClick?([:])
    }
}

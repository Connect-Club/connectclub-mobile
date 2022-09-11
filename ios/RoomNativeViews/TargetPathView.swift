//
//  TargetPathView.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 10/04/2021.
//

import Foundation
import UIKit

final class TargetPathView: BaseMovableView {
    override init(frame: CGRect) {
        super.init(frame: frame)
        AppManager.instance.targetPathView = self
    }
}

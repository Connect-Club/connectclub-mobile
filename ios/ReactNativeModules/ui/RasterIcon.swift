//
//  RasterIcon.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 14/05/2021.
//

import Foundation
import UIKit

var cache: [String: UIImage] = [:]

@objc(RasterIcon)
class RasterIcon: UIView {
    var uri: String?
    var isCircle: Bool = false
    
    private lazy var icon = UIImageView()
    
    static var allReactions: [String: String] = [:]
    static var badgedGuestBadgeIcon: String?
    static var specialGuestBadgeIcon: String?
    static var specialModeratorBadgeIcon: String?
    static var newbieBadgeIcon: String?
    
    @objc
    func setCircle(_ isCircle: Bool) {
        self.isCircle = isCircle
    }

    @objc
    func setUri(_ uri: String?) {
        self.uri = uri
        guard let uri = uri else { return }
        addSubview(icon)
        icon.image = Self.createImage(from: uri)
        icon.contentMode = .center
    }
    
    private var scaleType: String = ""
    
    @objc
    func setScaleType(_ scale: String?) {
        guard let scale = scale else { return }
        scaleType = scale
    }
    
    private var hPadding: CGFloat = 0
    
    @objc
    func setPaddingHorizontal(_ padding: NSNumber?) {
        guard let padding = padding?.floatValue else { return }
        hPadding = CGFloat(padding)
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        clipsToBounds = isCircle
        layer.cornerRadius = isCircle ? frame.width / 2 : 0
        
        if scaleType == "fitCenter" {
            icon.frame = CGRect(
                x: hPadding,
                y: hPadding,
                width: bounds.width - hPadding * 2,
                height: bounds.height - hPadding * 2
            )
            icon.contentMode = .scaleAspectFit
        } else {
            icon.frame = bounds
        }
    }
    
    static func createImage(from uri: String?) -> UIImage? {
      guard let uri = uri else { return nil }
      let key = uri
      if let i = cache[key] { return i }
      if let url = URL(string: uri as String),
         let data = try? Data(contentsOf: url),
         let image = UIImage(data: data) {
        cache[key] = image
        return image
      }
      return nil
    }
}

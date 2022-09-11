//
//  BaseParticipantView.swift
//  connectreactive
//
//  Created by Тарас Минин on 01/03/2021.
//

import JitsiWebRTC
import UIKit

class BaseParticipantView: UIView {

    var identifier: String = ""
    let videoView = VideoTrackRendererView()

    override init(frame _: CGRect) {
        super.init(frame: .zero)

        videoView.contentMode = .scaleAspectFill
        addSubview(videoView)
    }

    @available(*, unavailable)
    required init?(coder _: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    // MARK: layoutSubviews
    override func layoutSubviews() {
        super.layoutSubviews()
        videoView.frame = bounds
    }
}


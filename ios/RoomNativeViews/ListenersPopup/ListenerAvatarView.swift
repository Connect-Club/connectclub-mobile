//
//  ListenerAvatarView.swift
//  connectreactive
//
//  Created by Тарас Минин on 26/04/2021.
//

import Kingfisher

@objc(AvatarView)
final class ListenerAvatarView: UIView {

    @objc
    var fontSize: NSNumber = 16 {
        didSet {
            initialsLabel.font = .boldSystemFont(ofSize: CGFloat(fontSize.doubleValue))
        }
    }

    private lazy var avatarImageView: UIImageView = {
        let view = UIImageView()
        view.contentMode = .scaleAspectFill

        return view
    }()

    private lazy var initialsLabel: UILabel = {
        let label = UILabel()
        label.textAlignment = .center
        label.textColor = UIColor.black.withAlphaComponent(0.54)
        label.backgroundColor = .white
        label.font = .boldSystemFont(ofSize: CGFloat(fontSize.doubleValue))

        return label
    }()
    
    init() {
        super.init(frame: .zero)
        clipsToBounds = true
        addSubview(initialsLabel)
        addSubview(avatarImageView)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    private var source: String?
    
    @objc
    func setAvatar(_ src: String?) {
        if src == source, avatarImageView.image != nil { return }
        source = src
        // do not touch must be 300px
        let uri = src?.replaceSizePlaceholders(width: 300, height: 300)
        guard let source = uri, let url = URL(string: source) else { return }
        avatarImageView.kf.setImage(with: url)
    }

    @objc
    func setInitials(_ initials: String) {
        initialsLabel.text = initials
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        avatarImageView.frame = bounds
        initialsLabel.frame = bounds
        layer.cornerRadius = bounds.height / 2
    }

    func clear() {
        initialsLabel.text = ""
        avatarImageView.kf.cancelDownloadTask()
        avatarImageView.image = nil
    }
}

extension String {
    func replaceSizePlaceholders(
        width: Int,
        height: Int
    ) -> String {
        self.replacingOccurrences(of: ":WIDTH", with: "\(width)")
            .replacingOccurrences(of: ":HEIGHT", with: "\(height)")
    }
}

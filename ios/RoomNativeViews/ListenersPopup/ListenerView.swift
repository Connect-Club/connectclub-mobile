//
//  ListenerView.swift
//  connectreactive
//
//  Created by Тарас Минин on 26/04/2021.
//
import UIKit
import Lottie

extension Notification.Name {
    static let newListenerReaction: Notification.Name = .init(rawValue: "newListenerReaction")
}

final class ListenerView: UIView {

    private lazy var avatarView = ListenerAvatarView()

    private lazy var reactionBadge: UIImageView = {
        let view = UIImageView()
        view.backgroundColor = .white
        view.contentMode = .scaleAspectFit
        view.clipsToBounds = true
        return view
    }()

    private var role: Listener.Role = .default

    init() {
        super.init(frame: .zero)
        clipsToBounds = false

        addSubview(avatarView)
        addSubview(reactionBadge)
    }

    func setModel(_ listener: Listener) {
        avatarView.setAvatar(listener.avatarSource)
        let initials = profileInitials(
            name: listener.name,
            surname: listener.surname
        )
        avatarView.setInitials(initials)
        if self.role != listener.role {
            self.role = listener.role
        }

        setReaction(reaction: listener.reaction)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func layoutSubviews() {
        avatarView.frame = bounds
        avatarView.layer.cornerRadius = bounds.height / 2
        avatarView.layer.borderWidth = 0.5
        avatarView.layer.borderColor = UIColor.black.withAlphaComponent(0.12).cgColor
        let badgeWidth: CGFloat = 28
        let badgeHeight: CGFloat = 28

        reactionBadge.frame = CGRect(
            x: bounds.width - badgeWidth + 8,
            y: 0,
            width: badgeWidth,
            height: badgeHeight
        )
        reactionBadge.layer.cornerRadius = badgeHeight / 2
    }

    func setReaction(reaction type: String) {
        if type == "none" {
            setBadge()
            return
        }
        reactionBadge.isHidden = false
        guard let image = RasterIcon.createImage(
            from: RasterIcon.allReactions[type]
        ) else {
            reactionBadge.image = nil
            return
        }
        if image == reactionBadge.image { return }
        reactionBadge.image = image

        let xOrigin = superview?.superview?.frame.minX ?? 100

        let object = FloatingReaction(
            reaction: image,
            xOrigin: CGFloat.random(in: (xOrigin...xOrigin + 30))
        )
        NotificationCenter.default.post(name: .newListenerReaction, object: object)
    }

    private func setBadge() {
        switch role {
        case .festivalAdmin:
            reactionBadge.image = RasterIcon.createImage(
                from: RasterIcon.specialModeratorBadgeIcon
            )
        case .newbie:
            reactionBadge.image = RasterIcon.createImage(
                from: RasterIcon.newbieBadgeIcon
            )
        case .badgedGuest:
            reactionBadge.image = RasterIcon.createImage(
                from: RasterIcon.badgedGuestBadgeIcon
            )
        case .specialGuest:
            reactionBadge.image = RasterIcon.createImage(
                from: RasterIcon.specialGuestBadgeIcon
            )
        case .admin:
            reactionBadge.image = UIImage(named: "ic_crown")
        case .default:
            reactionBadge.image = nil
        }
        
        reactionBadge.isHidden = reactionBadge.image == nil
    }

    func clear() {
        role = .default
        setReaction(reaction: "none")
        reactionBadge.image = nil
        avatarView.clear()
    }
}

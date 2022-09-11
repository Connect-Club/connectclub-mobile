//
//  ListenersBottomSheetView.swift
//  connectreactive
//
//  Created by Тарас Минин on 23/04/2021.
//

import React
import DifferenceKit
import CoreGraphics

extension Notification.Name {
    static let didRequestListenersSource = Notification.Name("didRequestListenersSource")
}

final class ListenersBottomSheetView: UIView {
    
    // MARK: - React Native Events
    @objc var onUserTap: RCTBubblingEventBlock?
    @objc var minSheetHeight: CGFloat = 72
    @objc var middleSheetHeight: CGFloat = 0.5 {
        didSet {
            setMode(mode: .halfscreen)
        }
    }
    
    @objc
    func setSpecialGuestBadgeIcon(_ icon: String) {
        RasterIcon.specialGuestBadgeIcon = icon
    }

    @objc
    func setBadgedGuestBadgeIcon(_ icon: String) {
        RasterIcon.badgedGuestBadgeIcon = icon
    }

    @objc
    func setSpecialModeratorBadgeIcon(_ icon: String) {
        RasterIcon.specialModeratorBadgeIcon = icon
    }
    
    @objc
    func setNewbieBadgeIcon(_ icon: String) {
        RasterIcon.newbieBadgeIcon = icon
    }
    
    @objc
    func setEmojiIcons(_ icons: [String: String]) {
        RasterIcon.allReactions = icons
    }

    private enum ViewMode: CaseIterable {
        case fullscreen
        case halfscreen
        case minimal
        case hidden
    }

    private func offsetValue(for mode: ViewMode) -> CGFloat {
        switch mode {
        case .fullscreen:
            return bounds.height * 0.1
        case .halfscreen:
            return bounds.height * (1.0 - middleSheetHeight)
        case .minimal:
            return bounds.height - minSheetHeight
        case .hidden:
            return bounds.height
        }
    }

    private func hideIconsTreshold() -> CGFloat {
        (offsetValue(for: .minimal) + offsetValue(for: .halfscreen)) / 2
    }
    
    private lazy var pullBarView: UIView = {
        let view = UIView()
        view.backgroundColor = UIColor.black.withAlphaComponent(0.32)
        view.layer.cornerRadius = 2
        
        return view
    }()

    private lazy var roomInfo = RoomInfoView()

    private var inviteBlockView: UIView?
    
    private lazy var listenersCollectionView: UICollectionView = {
        let flow = UICollectionViewFlowLayout()

        let itemSize: CGFloat = 72
        let offset: CGFloat = 16
        let numColumns = round((self.bounds.width - offset) / (itemSize + offset))

        let total = (itemSize + offset) * numColumns
        let addSpace = (self.bounds.width - offset - total) / (numColumns - 1)

        flow.itemSize = CGSize(width: itemSize, height: itemSize)
        flow.sectionInset = .init(top: 8, left: offset, bottom: 120, right: offset)

        let collectionView = UICollectionView(frame: .zero, collectionViewLayout: flow)
        collectionView.backgroundColor = UIColor(red: 0.941, green: 0.941, blue: 0.941, alpha: 1.0)
        collectionView.register(ListenerCollectionCell.self, forCellWithReuseIdentifier: "ListenerCell")

        collectionView.delegate = self
        collectionView.dataSource = self

        return collectionView
    }()
    
    override init(frame: CGRect) {
        let initialRect = CGRect(
            origin: .zero,
            size: CGSize(
                width: UIScreen.main.bounds.width,
                height: UIScreen.main.bounds.height
            )
        )
        listeners = []
        super.init(frame: initialRect)
        backgroundColor = UIColor(red: 0.941, green: 0.941, blue: 0.941, alpha: 1.0)
        layer.cornerRadius = 12
        addSubview(pullBarView)
        addSubview(roomInfo)
        addSubview(listenersCollectionView)
        setMode(mode: .hidden, animated: false)

        let panGr = UIPanGestureRecognizer(target: self, action: #selector(handlePan(gr:)))
        addGestureRecognizer(panGr)

        hookWithDataSource()
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func addSubview(_ view: UIView) {
        if view.accessibilityLabel == "RoomInviteBlockView" {
            inviteBlockView = view
            super.insertSubview(view, belowSubview: listenersCollectionView)
            return
        }
        super.addSubview(view)
    }

    private func hookWithDataSource() {
        ListenersStore.shared.onNewState = { name, speakers, listenersCount, listeners in
            DispatchQueue.main.async { [weak self] in
                self?.updateResource(name, speakers, listenersCount, listeners)
            }
        }
        
        ListenersStore.shared.onNewReaction = { [weak self] id, reaction in
            guard let self = self else { return }
            guard let index = self.listenersIdToIndexes[id] else { return }
            var newListeners = self.listeners
            newListeners[index].reaction = reaction
            self.updateListeners(newListeners)
        }
    }

    private var mode: ViewMode = .halfscreen
    private var currentOffset: CGFloat = 0

    private func setMode(mode: ViewMode, animated: Bool = true) {
        currentOffset = offsetValue(for: mode)
        UIView.animate(withDuration: animated ? 0.25 : 0, delay: 0, options: .curveEaseOut) {
            self.transform = .init(translationX: 0, y: self.currentOffset)
            self.mode = mode
            self.setInviteBlockOrigin(self.currentOffset)
        }
        sendHideIconsMessage(isMinimal: mode == .minimal)
        listenersCollectionView.isScrollEnabled = mode == .fullscreen
    }

    private var tempOffset: CGFloat = 0
    private var isMinimalHeight = false

    private func sendHideIconsMessage(isMinimal: Bool) {
        isMinimalHeight = isMinimal
        // Reactions should always be visible
        //ListenersStore.shared.shouldStopParseData = isMinimalHeight
    }

    private func setInviteBlockOrigin(_ offset: CGFloat) {
        guard let inviteBlockView = inviteBlockView else { return }
        guard inviteBlockView.alpha == 1 else {
            inviteBlockView.isUserInteractionEnabled = false
            return
        }
        inviteBlockView.isUserInteractionEnabled = true

        let minY: CGFloat = offsetValue(for: .fullscreen)
        let maxY: CGFloat = offsetValue(for: .halfscreen)
        let maxOffset: CGFloat = 80
        let additionalOffset: CGFloat = max(0, maxOffset * (1 - (offset - minY) / (maxY - minY)))

        let inviteHeight: CGFloat = inviteBlockView.frame.height
        inviteBlockView.frame.origin = CGPoint(
            x: 16,
            y: -inviteHeight - 16 - additionalOffset
        )
    }

    @objc
    private func handlePan(gr: UIPanGestureRecognizer) {
        switch gr.state {
        case .began, .changed:
            let point = gr.translation(in: self)

            tempOffset = max(min(currentOffset + point.y, offsetValue(for: .minimal)), offsetValue(for: .fullscreen))
            transform = .init(translationX: 0, y: tempOffset)
            setInviteBlockOrigin(tempOffset)

            if tempOffset > hideIconsTreshold(), !isMinimalHeight {
                sendHideIconsMessage(isMinimal: !isMinimalHeight)
            } else if tempOffset < hideIconsTreshold(), isMinimalHeight {
                sendHideIconsMessage(isMinimal: !isMinimalHeight)
            }
        case .cancelled, .ended:
            let velocity = gr.velocity(in: self)
            if abs(velocity.y) > 700 {
                if mode == .minimal, velocity.y < 0 { setMode(mode: .fullscreen) }
                else if mode == .halfscreen, velocity.y < 0 { setMode(mode: .fullscreen) }
                else if mode == .halfscreen, velocity.y > 0 { setMode(mode: .minimal) }
                else if mode == .fullscreen, velocity.y > 0 {
                    velocity.y > 2000
                        ? setMode(mode: .minimal)
                        : setMode(mode: .halfscreen)
                } else { setMode(mode: self.mode)}
                return
            }
            var closestMode: ViewMode = .minimal
            for mode in ViewMode.allCases {
                let diff = abs(offsetValue(for: mode) - tempOffset)
                if diff < abs(offsetValue(for: closestMode) - tempOffset) {
                    closestMode = mode
                }
            }
            setMode(mode: closestMode)
        default:
            break
        }

    }
    
    override func layoutSubviews() {
        pullBarView.frame = CGRect(
            x: (bounds.width - 51) / 2,
            y: 8,
            width: 51,
            height: 4
        )
        
        roomInfo.frame = CGRect(
            x: 16,
            y: pullBarView.frame.maxY + 4 + (20),
            width: bounds.width - 32,
            height: 20
        )

        listenersCollectionView.frame = CGRect(
            x: 0,
            y: roomInfo.frame.maxY + 16,
            width: bounds.width,
            height: bounds.height - (roomInfo.frame.maxY + 16) - 100
        )
        setInviteBlockOrigin(currentOffset)
    }

    private var listeners: [Listener] {
        didSet {
            listenersIdToIndexes = [:]
            for (index, item) in listeners.enumerated() {
                listenersIdToIndexes[item.id] = index
            }
        }
    }
    private var listenersIdToIndexes: [String: Int] = [:]
    private var isCollectionReloading = false

    private func updateResource(_ name: String, _ speakers: Int, _ listenersCount: Int, _ listeners: [Listener]) {

        roomInfo.update(name: name, listeners: listenersCount, speakers: speakers)
        updateListeners(listeners)
    }
    
    private func updateListeners(_ listeners: [Listener]) {
        if isCollectionReloading { return }
        isCollectionReloading = true
        
        let changes = StagedChangeset(source: self.listeners, target: listeners)

        if changes.isEmpty { isCollectionReloading = false }

        listenersCollectionView.reload(
            using: changes,
            interrupt: { $0.changeCount > 100 }
        ) { [weak self] newData in
            guard let self = self else { return }

            self.listeners = newData
            self.isCollectionReloading = false
        }
    }

    override func point(inside point: CGPoint, with event: UIEvent?) -> Bool {
        let superPoint = super.point(inside: point, with: event)
        if !superPoint,
           let inviteBlock = inviteBlockView,
           inviteBlock.point(
            inside: convert(point, to: inviteBlock),
            with: event
           ) {
            inviteBlock.isUserInteractionEnabled = inviteBlock.alpha == 1
            return inviteBlock.isUserInteractionEnabled
        }
        return superPoint
    }
}

extension ListenersBottomSheetView: UICollectionViewDataSource {
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        listeners.count
    }

    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        guard let cell = collectionView.dequeueReusableCell(
                withReuseIdentifier: "ListenerCell",
                for: indexPath
        ) as? ListenerCollectionCell else { fatalError() }

        let listener = listeners[indexPath.row]
        cell.setup(listener: listener)

        return cell
    }
}

extension ListenersBottomSheetView: UICollectionViewDelegate {
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        let listener = listeners[indexPath.row]
        onUserTap?(["user": [
            "id": listener.id,
            "isAdmin": listener.isAdmin,
            "mode": "popup",
            "isLocal": listener.isLocal
        ]])
    }
}

struct Listener: Differentiable {
    
    enum Role {
        case admin
        case festivalAdmin
        case badgedGuest
        case specialGuest
        case newbie
        case `default`
    }
    
    let id: String
    let name: String
    let surname: String
    let avatarSource: String
    var reaction: String
    let isLocal: Bool
    let isOwner: Bool
    let isSpecialGuest: Bool

    let isAdmin: Bool
    let badges: [String]?
    
    var role: Role {
        if isSpecialGuest { return .specialGuest }
        if isAdmin && (badges == nil || badges?.isEmpty == true) { return .admin }
        if let bg = badges, !bg.isEmpty  {
            if bg.count == 1, bg[0] == "new" { return isAdmin ? .admin : .newbie }
            if isAdmin { return .festivalAdmin }
            return .badgedGuest
        }
        return .default
    }

    var differenceIdentifier: String {
        id
    }

    func isContentEqual(to source: Listener) -> Bool {
        id == source.id
            && reaction == source.reaction
            && isAdmin == source.isAdmin
            && name == source.name
            && surname == source.surname
            && avatarSource == source.avatarSource
            && role == source.role
    }
}

//
//  RoomInfoView.swift
//  connectreactive
//
//  Created by Тарас Минин on 28/04/2021.
//

import UIKit

final class RoomInfoView: UIView {
    private let speakerImage = UIImageView(image: UIImage(named: "icChats"))
    private let listenerImage = UIImageView(image: UIImage(named: "icPeople"))

    private var roomName: UILabel?

    private var listenersCount: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 13)
        label.textColor = UIColor.black.withAlphaComponent(0.32)
        return label
    }()

    private var speakersCount: UILabel = {
        let label = UILabel()
        label.font = .systemFont(ofSize: 13)
        label.textColor = UIColor.black.withAlphaComponent(0.32)
        return label
    }()

    private var placeholderView: UIView = {
        let view = UIView()
        view.backgroundColor = UIColor(red: 0.941, green: 0.941, blue: 0.941, alpha: 1.0)
        return view
    }()

    init() {
        super.init(frame: .zero)

        addSubview(placeholderView)
        addSubview(listenerImage)
        addSubview(listenersCount)
        addSubview(speakerImage)
        addSubview(speakersCount)

        speakersCount.translatesAutoresizingMaskIntoConstraints = false
        speakersCount.rightAnchor.constraint(equalTo: self.rightAnchor).isActive = true
        speakersCount.topAnchor.constraint(equalTo: self.topAnchor).isActive = true
        speakersCount.bottomAnchor.constraint(equalTo: self.bottomAnchor).isActive = true

        speakerImage.translatesAutoresizingMaskIntoConstraints = false
        speakerImage.rightAnchor.constraint(equalTo: speakersCount.leftAnchor, constant: -2).isActive = true
        speakerImage.heightAnchor.constraint(equalToConstant: 16).isActive = true
        speakerImage.widthAnchor.constraint(equalToConstant: 16).isActive = true
        speakerImage.centerYAnchor.constraint(equalTo: speakersCount.centerYAnchor).isActive = true

        listenersCount.translatesAutoresizingMaskIntoConstraints = false
        listenersCount.rightAnchor.constraint(equalTo: speakerImage.leftAnchor, constant: -8).isActive = true
        listenersCount.topAnchor.constraint(equalTo: self.topAnchor).isActive = true
        listenersCount.bottomAnchor.constraint(equalTo: self.bottomAnchor).isActive = true

        listenerImage.translatesAutoresizingMaskIntoConstraints = false
        listenerImage.rightAnchor.constraint(equalTo: listenersCount.leftAnchor, constant: -2).isActive = true
        listenerImage.heightAnchor.constraint(equalToConstant: 16).isActive = true
        listenerImage.widthAnchor.constraint(equalToConstant: 16).isActive = true
        listenerImage.centerYAnchor.constraint(equalTo: speakersCount.centerYAnchor).isActive = true

        placeholderView.translatesAutoresizingMaskIntoConstraints = false
        placeholderView.rightAnchor.constraint(equalTo: self.rightAnchor).isActive = true
        placeholderView.topAnchor.constraint(equalTo: self.topAnchor).isActive = true
        placeholderView.bottomAnchor.constraint(equalTo: self.bottomAnchor).isActive = true
        placeholderView.leftAnchor.constraint(equalTo: listenerImage.leftAnchor, constant: -8).isActive = true
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    func update(name: String, listeners: Int, speakers: Int) {
        if roomName == nil {
            roomName = MarqueeLabel(frame: .zero, duration: 0, fadeLength: 10)
            roomName!.font = .boldSystemFont(ofSize: 18)
            roomName!.textColor = UIColor.black.withAlphaComponent(0.87)
            addSubview(roomName!)

            roomName!.translatesAutoresizingMaskIntoConstraints = false
            roomName!.leftAnchor.constraint(equalTo: self.leftAnchor).isActive = true
            roomName!.rightAnchor.constraint(equalTo: self.rightAnchor).isActive = true
            roomName!.topAnchor.constraint(equalTo: self.topAnchor).isActive = true
            roomName!.bottomAnchor.constraint(equalTo: self.bottomAnchor).isActive = true
            
            setNeedsLayout()
            layoutSubviews()

            let fontAttributes = [NSAttributedString.Key.font: UIFont.boldSystemFont(ofSize: 18)]
            let size = (name as NSString).size(withAttributes: fontAttributes)
            var text = name
            if (roomName!.frame.width - placeholderView.frame.width) < size.width {
                roomName?.removeFromSuperview()
                text = "\(name)                     "
                roomName = MarqueeLabel(frame: .zero, duration: 0.4 * CGFloat(text.count), fadeLength: 10)
                roomName!.font = .boldSystemFont(ofSize: 18)
                roomName!.textColor = UIColor.black.withAlphaComponent(0.87)
                addSubview(roomName!)
                insertSubview(roomName!, belowSubview: placeholderView)

                roomName!.translatesAutoresizingMaskIntoConstraints = false
                roomName!.leftAnchor.constraint(equalTo: self.leftAnchor).isActive = true
                roomName!.rightAnchor.constraint(equalTo: self.rightAnchor).isActive = true
                roomName!.topAnchor.constraint(equalTo: self.topAnchor).isActive = true
                roomName!.bottomAnchor.constraint(equalTo: self.bottomAnchor).isActive = true
            }
            roomName!.text = text
        }

        if listeners > 999 {
            listenersCount.text = String(format: "%.1fK", Float(listeners) / 1000)
        } else {
            listenersCount.text = String(listeners)
        }
        speakersCount.text = String(speakers)
    }
}

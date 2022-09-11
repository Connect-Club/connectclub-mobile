//
//  ListenerCollectionCell.swift
//  connectreactive
//
//  Created by Тарас Минин on 26/04/2021.
//

final class ListenerCollectionCell: UICollectionViewCell {

    private lazy var listenerView: ListenerView = {
        let view = ListenerView()
        self.contentView.addSubview(view)
        
        return view
    }()

    private lazy var nameLabel: UILabel = {
        let label = UILabel()
        label.text = ""
        label.textColor = .black
        label.font = .systemFont(ofSize: 12)
        label.textAlignment = .center
        self.contentView.addSubview(label)
        return label
    }()

    func setup(listener: Listener) {
        listenerView.setModel(listener)
        nameLabel.text = listener.name

        setNeedsLayout()
    }

    override func layoutSubviews() {
        listenerView.frame = CGRect(
            x: 8,
            y: 0,
            width: bounds.width - 16,
            height: bounds.width - 16
        )
        nameLabel.frame = CGRect(
            x: 0,
            y: bounds.height - nameLabel.font.lineHeight,
            width: bounds.width,
            height: nameLabel.font.lineHeight
        )
    }

    override func prepareForReuse() {
        super.prepareForReuse()
        
        listenerView.clear()
        nameLabel.text = ""
    }
}

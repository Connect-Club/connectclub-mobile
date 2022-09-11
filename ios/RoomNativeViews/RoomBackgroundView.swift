//
//  RoomBackgroundView.swift
//  connectreactive
//
//  Created by Тарас Минин on 11/05/2021.
//

final class RoomBackgroundView: UIImageView {

    private var imageSize: CGSize = .zero
    private var backgroundLink: String?
    private var callbackSent = false

    private var imageProvider: RoomBackgroundImageProvider!
    
    @objc
    var onBackgroundLoaded: RCTBubblingEventBlock? {
        didSet {
            callBackgroundReady()
        }
    }

    @objc
    func setImageSource(_ link: String) {
        backgroundLink = link
        checkAndDownloadBackground()
    }

    @objc
    func setBgSize(_ size: String) {
        let sizesArray = size.split(separator: ",")
        guard sizesArray.count == 2 else { fatalError("bg size should have only 2 values: \(size)") }
        let widthString = String(sizesArray[0])
        let heightString = String(sizesArray[1])
        let nFormatter = NumberFormatter()
        nFormatter.allowsFloats = true
        nFormatter.alwaysShowsDecimalSeparator = true
        nFormatter.decimalSeparator = "."
        guard
            let width = nFormatter.number(from: widthString),
            let height = nFormatter.number(from: heightString) else {
            fatalError("bgSize incorrect: \(size)")
        }
        let size = CGSize(
            width: CGFloat(width.floatValue),
            height: CGFloat(height.floatValue)
        )
        self.imageSize = size
        checkAndDownloadBackground()
    }

    private func checkAndDownloadBackground() {
        guard imageSize != .zero else { return }
        guard let backgroundLink = backgroundLink else { return }
        contentMode = .scaleAspectFit
        debugPrint("🤼‍♂️ looking for background", backgroundLink)

        imageProvider = RoomBackgroundImageProviderImpl(sizeRoom: imageSize)

        if let cacheImage = imageProvider.fetchFromDisk(
            cacheName: backgroundLink.lastPath,
            link: backgroundLink
        ) {
            self.image = cacheImage
            callBackgroundReady()
            return
        }
        
        imageProvider.downloadAsync(
            cacheName: backgroundLink.lastPath,
            link: backgroundLink
        ) { [weak self] result in
            
            guard let self = self else { return }
            switch result {
            case .success(let image):
                self.image = image
                self.callBackgroundReady()
            default:
                break
            }
        }
    }
    
    private func callBackgroundReady() {
        guard !callbackSent else { return }
        guard image != nil else { return }
        guard let callback = onBackgroundLoaded else { return }
        
        callback([:])
        callbackSent = true
    }
}

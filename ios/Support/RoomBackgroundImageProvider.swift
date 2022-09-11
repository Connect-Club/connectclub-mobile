//
//  RoomBackgroundImageProvider.swift
//  connectreactive
//
//  Created by Тарас Минин on 07/05/2021.
//

import Kingfisher
import UIKit
import Foundation

extension Notification.Name {
    static let downloadImageProgress = Notification.Name(rawValue: "downloadImageProgress")
}

enum PreloadBackgroundState {
    case cancelled
    case failure(Error)
    case success(UIImage)
}

protocol RoomBackgroundImageProvider {
    func fetchFromDisk(cacheName: String, link: String) -> UIImage?
    func downloadAsync(cacheName: String, link: String, completion: @escaping (PreloadBackgroundState) -> Void)

    func cancelCurrentDownload()
    func clearRoomBackgroundsFolder()
}

final class RoomBackgroundImageProviderImpl: RoomBackgroundImageProvider {
    #if DEBUG
        private let roomBackgroundFolder = "roomBackgrounds"
    #else
        private let roomBackgroundFolder = ".roomBackgrounds"
    #endif
    private let sizeRoom: CGSize

    /// Aproximate max image size for iPhones older than iPhone X
    private let maxSizeRoomForOldDevices = CGSize(width: 2250, height: 4872)

    private let documentsFolder: String = {
        NSSearchPathForDirectoriesInDomains(.documentDirectory, .userDomainMask, true).first!
    }()

    private var cacheName: String?

    private var storeUrl: (String, URL) -> URL = { name, folderURL in
        return URL(fileURLWithPath: "\(folderURL.path)/\(name)")
    }

    private(set) lazy var folderURL = URL(fileURLWithPath: "\(self.documentsFolder)/\(self.roomBackgroundFolder)")
    private var downloadTask: Kingfisher.DownloadTask?
    private var roomLoadProgress: Float = 0.0

    init(sizeRoom: CGSize) {
        if sizeRoom == .zero { fatalError("Size room is zero") }

        // Check for small memory devices
        if UIScreen.main.nativeBounds.height < 1335, sizeRoom.height > maxSizeRoomForOldDevices.height {
            self.sizeRoom = maxSizeRoomForOldDevices
        } else {
            self.sizeRoom = sizeRoom
        }
    }

    func clearRoomBackgroundsFolder() {
        try? FileManager.default.removeItem(at: folderURL)
    }

    func cancelCurrentDownload() {
        downloadTask?.cancel()
        downloadTask = nil
    }

    func downloadAsync(
        cacheName: String,
        link: String,
        completion: @escaping (PreloadBackgroundState) -> Void
    ) {
        DispatchQueue.global(qos: .background).async { [weak self] in
            guard let state = self?.download(cacheName: cacheName, link: link) else {
                return completion(.cancelled)
            }
            DispatchQueue.main.async {
                completion(state)
            }
        }
    }

    func fetchFromDisk(cacheName: String, link: String) -> UIImage? {

        let cachedImage = checkInAssets(link: link)
        if let image = cachedImage, image.size != .zero {
            return image
        }
        let storageImage = fetchBackgroundFromDisk(link: link)
        if let image = storageImage, image.size != .zero {
            roomLoadProgress = 1.0
            return image
        }
        return nil
    }

    func download(cacheName: String, link: String) -> PreloadBackgroundState {

        cancelCurrentDownload()
        self.cacheName = cacheName

        let downloadLink = buildBackgroundRoomDownloadUrl(link: link)
        let response = downloadBackground(link: link, url: downloadLink)

        return response
    }

    private func buildBackgroundRoomDownloadUrl(link: String) -> URL {

        let link = link.replaceSizePlaceholders(
            width: Int(sizeRoom.width),
            height: Int(sizeRoom.height)
        )

        return URL(string: link)!
    }

    private func fetchBackgroundFromDisk(link: String) -> UIImage? {

        let fileManager = FileManager.default
        let fileUrl = storeUrl(cacheName ?? link.lastPath, folderURL)

        let semaphore = DispatchSemaphore(value: 0)

        var background: UIImage? = nil

        DispatchQueue.global(qos: .background).async {
            let isFileExists = FileManager.default.fileExists(atPath: fileUrl.path)

            if isFileExists,
               let data = fileManager.contents(atPath: fileUrl.path),
               let image = UIImage(data: data),
               image.size != .zero {
                background = image
            }
            semaphore.signal()
        }
        semaphore.wait()

        guard let image = background else { return nil }
        return image
    }

    private func saveBackground(image: UIImage, to destinationUrl: URL) -> Bool {
        let manager = FileManager.default

        if !manager.fileExists(atPath: folderURL.path) {
            try! manager.createDirectory(
                at: folderURL,
                withIntermediateDirectories: true,
                attributes: nil
            )
        }

        let isSaved = manager.createFile(
            atPath: destinationUrl.path,
            contents: image.jpegData(compressionQuality: 1.0),
            attributes: nil
        )

        return isSaved
    }

    private func checkInAssets(link: String) -> UIImage? {
        let name = cacheName ?? link.lastPath
        guard let cachedImage = CachedBackground.getBackground(name: name) else {
            return nil
        }

        return cachedImage.resize(targetSize: sizeRoom)
    }

    private func downloadBackground(link: String, url: URL) -> PreloadBackgroundState {
        let semaphore = DispatchSemaphore(value: 0)
        var downloadedImage: UIImage?
        var isCancelled = false

        ImageDownloader.default.downloadTimeout = 30

        KingfisherManager.shared.cache.clearDiskCache { [weak self] in
            self?.downloadTask = KingfisherManager.shared.retrieveImage(
                with: url,
                options: nil,
                progressBlock: { receivedSize, total in
                    DispatchQueue.main.async { [weak self] in
                        self?.roomLoadProgress = Float(receivedSize) / Float(total)
//                        post(
//                            notification: .downloadImageProgress,
//                            object: self?.roomLoadProgress
//                        )
                    }
                }, completionHandler: { result in
                    switch result {
                    case let .failure(err):
                        if (err as Kingfisher.KingfisherError).isTaskCancelled {
                            isCancelled = true
                        }
                    case let .success(image):
                        downloadedImage = image.image
                    }
                    semaphore.signal()
                }
            )
        }

        semaphore.wait()

        if isCancelled {
            return .cancelled
        } else if let finalImage = downloadedImage {
            let storeRoomUrl = storeUrl(cacheName ?? link.lastPath, folderURL)

            if !saveBackground(image: finalImage, to: storeRoomUrl) {
                let errorString = "Saving background fail to \(storeRoomUrl.absoluteString)"
                assertionFailure(errorString)
            }

            return .success(finalImage)
        } else {
            let err = NSError(domain: "cantCreateRoomBackground", code: -1, userInfo: nil)

            return .failure(err)
        }
    }
}

extension String {
    var lastPath: String {
        return (self as NSString).lastPathComponent
    }
}

extension UIImage {

    func resize(targetSize: CGSize) -> UIImage {
        if targetSize == size { return self }
        if targetSize.width > size.width && targetSize.height > size.height { return self }

        guard let data = jpegData(compressionQuality: 1) else { return self }
        let imageData = NSData(data: data) as CFData

        let options = [
            kCGImageSourceCreateThumbnailFromImageAlways: true,
            kCGImageSourceCreateThumbnailWithTransform: true,
            kCGImageSourceThumbnailMaxPixelSize: max(targetSize.width, targetSize.height)
        ] as CFDictionary

        guard let source = CGImageSourceCreateWithData(imageData, nil) else {
            assertionFailure("no source created from \(self)")
            return self
        }
        guard let imageReference = CGImageSourceCreateThumbnailAtIndex(source, 0, options) else {
            assertionFailure("no reference created from \(self)")
            return self
        }
        return UIImage(cgImage: imageReference)
    }
}

final class CachedBackground {

    private enum StoredBackground: String {
        case publicProd = "7e88f8b3-16ed-4290-a2dd-b39feba03f15"
        case publicStage = "45f80f11-832c-47dc-9e48-4b9776de5fae"

        case networkProd = "85705527-a525-4304-8853-567a2eaddff8"
        case networkStage = "f9ecedc9-cefe-4174-b1ae-60258c4f955c"

        case largePublicProd = "1d2e56b0-d28c-4aff-be3f-3f89da8abdad"
        case largePublicStage = "021da593-e6f0-46d6-b610-b0afb03304a4"

        case smallNetworkProd = "117d7c9a-5c66-4a39-a73f-8a5070e4be54"
        case smallNetworkStage = "314009d4-fed1-4375-b865-e0816ca2f1b5"

        case artGalleryProd = "df19fd7d-683c-48c0-9673-7c3dc93c386e"
        case artGalleryStage = "36b9dc26-1bf0-4be2-a494-a44b42026dfd"

        case multiroomProd = "929bac50-8278-48d7-9b33-770dcaa53ac3"
        case multiroomStage = "1c387701-9e37-431a-8002-94636fe72b4f"

        var resourceName: String {
            switch self {
            case .publicProd, .publicStage:
                return "public"
            case .largePublicProd, .largePublicStage:
                return "largePublic"
            case .networkProd, .networkStage:
                return "networking"
            case .smallNetworkProd, .smallNetworkStage:
                return "smallNetworking"
            case .artGalleryProd, .artGalleryStage:
                return "artGallery"
            case .multiroomProd, .multiroomStage:
                return "multiroom"
            }
        }

        var path: String? {
            Bundle(for: CachedBackground.self).path(forResource: resourceName, ofType: "jpg")
        }
    }

    static func getBackground(name: String) -> UIImage? {
        let imageFormat = ".jpg"

        let name = name.replacingOccurrences(of: imageFormat, with: "")
        let stored = StoredBackground(rawValue: name)
        let path = stored?.path

        return path == nil ? nil : UIImage(contentsOfFile: path!)
    }
}

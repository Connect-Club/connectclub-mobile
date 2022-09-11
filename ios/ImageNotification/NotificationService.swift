//
//  NotificationService.swift
//  ImageNotification
//
//  Created by Тарас Минин on 14.02.2022.
//

import UserNotifications
import Firebase
import Kingfisher

class NotificationService: UNNotificationServiceExtension {

    var contentHandler: ((UNNotificationContent) -> Void)?
    var bestAttemptContent: UNMutableNotificationContent?

    private let imageKey = "largeImage"

    override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
        self.contentHandler = contentHandler
        bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)

        if let imageLink = request.content.userInfo[imageKey] as? String,
            let url = URL(string: imageLink) {
            
            KingfisherManager.shared.retrieveImage(with: url, options: nil, progressBlock: nil) { [weak self] result in
                switch result {
                case .success(let value):
                    if let attach = UNNotificationAttachment.saveImageToDisk(
                        name: url.lastPathComponent,
                        data: value.image.pngData()!
                    ) {
                        self?.bestAttemptContent?.attachments = [attach]
                    }
                case .failure:
                    break
                }
                self?.completeAttempt()
            }
        } else {
            completeAttempt()
        }
    }

    private func completeAttempt() {
        if let bestAttemptContent = bestAttemptContent {
            FIRMessagingExtensionHelper().populateNotificationContent(
                bestAttemptContent,
                withContentHandler: contentHandler!
            )
        }
    }
    
    override func serviceExtensionTimeWillExpire() {
        // Called just before the extension will be terminated by the system.
        // Use this as an opportunity to deliver your "best attempt" at modified content, otherwise the original push payload will be used.
        if let contentHandler = contentHandler, let bestAttemptContent =  bestAttemptContent {
            contentHandler(bestAttemptContent)
        }
    }
}

extension UNNotificationAttachment {

    static func saveImageToDisk(name: String, data: Data) -> UNNotificationAttachment? {
        let fileManager: FileManager = .default
        let folderURL = NSURL(
            fileURLWithPath: NSTemporaryDirectory()
        ) as URL
        let fileURL = folderURL.appendingPathComponent(name)

        if fileManager.fileExists(atPath: fileURL.path) {
            let attachment = try? UNNotificationAttachment(identifier: name, url: fileURL, options: nil)
            return attachment
        }

        do {
            try fileManager.createDirectory(
                at: folderURL,
                withIntermediateDirectories: true, attributes: nil
            )
            try data.write(to: fileURL, options: [])
            let attachment = try UNNotificationAttachment(identifier: name, url: fileURL, options: nil)
            return attachment
        } catch let error {
            debugPrint("error \(error)")
        }

        return nil
    }
}

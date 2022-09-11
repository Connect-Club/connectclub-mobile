//
//  HttpClient.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 18/05/2021.
//

import Foundation
import React
import Common
import Kingfisher

@objc(HttpClient)
final class HttpClient: RCTEventEmitter {

    static var logInfo = ""
    static var httpClient: CommonPublicHttpClientProtocol?

    private var AMPLITUDE_SESSION_ID = "amplitudeSessionId"
    private var AMPLITUDE_DEVICE_ID = "amplitudeDeviceId"

    let queue = DispatchQueue(label: "httpQueue")
    let goAsyncStorage = GoAsyncStorage.shared

    override init() {
        super.init()
        CommonSetStorage(goAsyncStorage)
        goAsyncStorage.delete(AMPLITUDE_SESSION_ID)
        goAsyncStorage.delete(AMPLITUDE_DEVICE_ID)
    }

    override func supportedEvents() -> [String]! { [] }
    override class func requiresMainQueueSetup() -> Bool {
        false
    }

    @objc
    func initialize(
        _ endpoint: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        let version = Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as! String
        let versionName = Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as! String
        let buildNumber = UIDevice.current.systemVersion

        Self.logInfo = String(
            format: "iOS %@ build: %@(%@) device: %@",
            UIDevice.current.systemVersion,
            version,
            versionName,
            UIDevice.deviceType.rawValue
        )

        Self.httpClient = CommonHttpClient(
            endpoint,
            "ios",
            version,
            versionName,
            buildNumber
        )
        resolver(true)

        #if DEBUG
        return
        #endif
    }

    @objc
    func isAuthorized(
        _ resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock) {
        resolver(!goAsyncStorage.getString("accessToken").isEmpty)
    }

    @objc
    func queryAuthorize(
        _ query: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        queue.async {
            let response = Self.httpClient!.authorize(query)
            resolver(response)
        }
    }

    @objc
    func request(
        _ endpoint: String,
        method: String,
        useAuthorizeHeader: Bool,
        generateJwt: Bool,
        query: String?,
        body: String?,
        file: String?,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        queue.async {
            let response = Self.httpClient!.getRequest(
                endpoint,
                method: method,
                useAuthorizeHeader: useAuthorizeHeader,
                generateJwt: generateJwt,
                query: query,
                body: body,
                filePartName: "photo",
                fileName: "photo",
                filePath: file
            )
            resolver(response)
        }
    }

    @objc
    func sendLogFile(
        _ body: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        let text = "\(Self.logInfo)\n\(body)"
        let response = Self.httpClient!.sendLogFile(withBodyText: text)
        resolver(response)
    }

    @objc
    func sendPreservedLogFile(
        _ body: String,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) {
        let path = Logger.preservedLogFilePath
        let text = "(Error) \(Self.logInfo)\n\(body)"
        let response = Self.httpClient!.sendLogFile(withPath: path, bodyText: text)
        resolver(response)
    }

    @objc
    func setAmplitudeIds(_ sessionId: String, deviceId: String) {
        goAsyncStorage.setString(AMPLITUDE_SESSION_ID, value: sessionId)
        goAsyncStorage.setString(AMPLITUDE_DEVICE_ID, value: deviceId)
    }
}

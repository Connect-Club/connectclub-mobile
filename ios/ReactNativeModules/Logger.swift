//
//  Logger.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 04/06/2021.
//

import Foundation
import React
import Common
import JitsiWebRTC

private let loggerQueue = DispatchQueue(label: "loggerQueue", qos: .utility)
private let goIosLogger = CommonNewLogger("IOS")
private let goJsLogger = CommonNewLogger("JS")

/// returns the filename of a path
private func fileNameOfFile(_ file: String) -> String {
    let fileParts = file.components(separatedBy: "/")
    if let lastPart = fileParts.last {
        return lastPart.replacingOccurrences(of: ".swift", with: "")
    }
    return ""
}

/// removes the parameters from a function because it looks weird with a single param
private func stripParams(function: String) -> String {
    var f = function
    if let indexOfBrace = f.firstIndex(of: "(") {
        f = String(f[..<indexOfBrace])
    }
    return f
}

enum DebugLevel: String {
    case trace
    case debug
    case info
    case warning
    case error
}

func debugLog(
    _ level: DebugLevel = .debug,
    _ items: Any...,
    function: String = #function,
    file: String = #file
) {
    loggerQueue.async {
        let funcName = stripParams(function: function)
        let params = items.map { "\($0)" }.joined(separator: " ")
        let fileName = fileNameOfFile(file)
        var log = "\(fileName).\(funcName)(\(params))"
        if let name = Thread.current.name, !name.isEmpty {
            log.append(" |\(name)")
        }

        switch level {
        case .trace:
            goIosLogger?.trace(log)
        case .debug:
            goIosLogger?.debug(log)
        case .info:
            goIosLogger?.info(log)
        case .warning:
            goIosLogger?.warn(log)
        case .error:
            goIosLogger?.error(log)
        }
    }
}

@objc(Logger)
class Logger: RCTEventEmitter {

    static var logDirPath: String {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!.path
    }

    static var LOG_FILE_NAME: String = "goLogFile.txt"
    static var PRESERVED_LOG_FILE_NAME: String = "preserved.log"

    static var logFilePath: String {
        logDirPath.appending("/\(LOG_FILE_NAME)")
    }

    @objc static var preservedLogFilePath: String {
        logDirPath.appending("/\(PRESERVED_LOG_FILE_NAME)")
    }

    @objc static func getLogId() -> String {
        if FileManager.default.fileExists(atPath: Self.preservedLogFilePath) { return "" }
        let id = UUID().uuidString
        GoAsyncStorage.shared.setString("bugsnagReportId", value: id)
        CommonInitLoggerFile(Self.logDirPath, Self.LOG_FILE_NAME)
        CommonPreserveLogFile(logDirPath, PRESERVED_LOG_FILE_NAME)
        return id
    }

    var isEnabled: Bool {
        #if DEBUG
        return true
        #else
        return true
        #endif
    }
    
    override init() {
        super.init()
        CommonInitLoggerFile(Self.logDirPath, Self.LOG_FILE_NAME)
        if isEnabled {
            JitsiWebRTC.debugLog = debugLog
        }
    }
    
    override class func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    override func supportedEvents() -> [String]! { [] }
    
    @objc
    func logJS(_ message: String, level: String) {
        guard let debugLevel = DebugLevel(rawValue: level) else {
            assertionFailure("Unknown debug level from js")
            goJsLogger?.debug(message)
            return
        }
        loggerQueue.async {
            switch debugLevel {
            case .trace:
                goJsLogger?.trace(message)
            case .debug:
                goJsLogger?.debug(message)
            case .info:
                goJsLogger?.info(message)
            case .warning:
                goJsLogger?.warn(message)
            case .error:
                goJsLogger?.error(message)
            }
        }
    }
}

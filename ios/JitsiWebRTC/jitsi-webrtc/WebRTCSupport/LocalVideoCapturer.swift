//
//  LocalVideoCapturer.swift
//  jitsi-webrtc
//
//  Created by Тарас Минин on 30/07/2020.
//  Copyright © 2020 CNNCT Limited. All rights reserved.
//

import WebRTC
import AVKit

public enum LocalCameraType {
    case back
    case front
}

public final class LocalVideoCapturer {
    
    public let cameraType: LocalCameraType

    private let cameraCapturer: RTCCameraVideoCapturer
    private let fileCapturer: RTCFileVideoCapturer?
    private var frontalCamera: AVCaptureDevice?
    private let fps: Int
    
    private var isCapturingDevice = false

    public init(
        cameraCapturer: RTCCameraVideoCapturer,
        fileCapturer: RTCFileVideoCapturer?,
        fps: Int,
        cameraType: LocalCameraType
    ) {
        self.cameraType = cameraType
        self.cameraCapturer = cameraCapturer
        self.fileCapturer = fileCapturer
        self.fps = fps
    }

    public func startCapture() {
        let position = cameraType == .front
            ? AVCaptureDevice.Position.front
            : AVCaptureDevice.Position.back
        frontalCamera = findDeviceForPosition(position: position)
        guard let device = frontalCamera else { return }

        let availableFormats = RTCCameraVideoCapturer.supportedFormats(for: device)
        // availableFormats[4] = 'vide'/'420v'  480x 360, { 2- 30 fps}, HRSI:3088x2320, fov:56.559,
        // max zoom:145.00 (upscales @6.43), ISO:19.0-1824.0, SS:0.000013-0.500000

        if let filec = fileCapturer, !isCapturingDevice {
            filec.stopCapture()
        }
        cameraCapturer.startCapture(
            with: device,
            format: availableFormats[4],
            fps: fps
        )
        isCapturingDevice = true
    }

    public func stopCapture() {
        guard isCapturingDevice else { return }
        cameraCapturer.stopCapture()
        
        if let filec = fileCapturer {
            filec.startCapturing(fromFileNamed: "black.mp4") { error in
                debugP("startFileCapturing error: \(error.localizedDescription)")
            }
        }
        isCapturingDevice = false
    }
    
    private func findDeviceForPosition(position: AVCaptureDevice.Position) -> AVCaptureDevice? {
        let captureDevices = RTCCameraVideoCapturer.captureDevices()
        for device in captureDevices where device.position == position {
            return device
        }
        return captureDevices.first
    }
}

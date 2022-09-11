//
//  WebrtcLogger.swift
//  DemoApp
//
//  Created by Sergei Golishnikov on 04/06/2021.
//  Copyright © 2021 CNNCT Limited. All rights reserved.
//

import Foundation

public var debugLog: (Any, String, String) -> Void = { _, _, _ in }

func debugP(
    _ items: Any...,
    function: String = #function,
    file: String = #file
) {
    debugLog(items, function, file)
}

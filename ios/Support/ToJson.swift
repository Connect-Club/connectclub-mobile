//
//  ToJson.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 28/04/2021.
//

import Foundation

func dataToJSON(data: Data?) -> Any? {
    guard let d = data else { return nil }
    return try? JSONSerialization.jsonObject(with: d, options: .allowFragments)
}

func toJSON(json: String?) -> [String: Any] {
    guard let json = json else { return [:] }
    guard let data = json.data(using: .utf8) else { return [:] }
    let dict = try? JSONSerialization.jsonObject(
        with: data,
        options: .allowFragments
    )
    guard let jsonDict = dict as? [String: Any] else { return [:]}
    return jsonDict
}

func objectToJSONString(object: Any) -> String? {
    let json = try? JSONSerialization.data(withJSONObject: object, options: .fragmentsAllowed)
    if json == nil { return nil }
    return String(data: json!, encoding: .utf8)
}

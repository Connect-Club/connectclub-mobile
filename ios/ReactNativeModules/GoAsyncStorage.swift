//
//  GoAsyncStorage.swift
//  connectreactive
//
//  Created by Sergei Golishnikov on 19/05/2021.
//

import Foundation
import Common

class GoAsyncStorage: NSObject, CommonPublicStorageProtocol {

    static let shared = GoAsyncStorage()
    
    func getString(_ key: String?) -> String {
        return UserDefaults.standard.string(forKey: key!) ?? ""
    }
    
    func setString(_ key: String?, value: String?) {
        UserDefaults.standard.set(value, forKey: key!)
    }
    

    func delete(_ key: String?) {
        UserDefaults.standard.removeObject(forKey: key!)
    }
}

//
//  Device+Extension.swift
//  connectreactive
//
//  Created by Тарас Минин on 29.10.2021.
//

import Foundation
import UIKit

extension UIDevice {
    
    static var deviceType: DeviceType = {
        let version = getVersionCode()
        let type = getDevice(code: version)
        return type
    }()
    
    static var physicalScreenWidth: CGFloat = {
        let nativeSize = UIScreen.main.nativeBounds
        
        return nativeSize.width / CGFloat(ppi)
    }()
    
    static var ppi: Int = {
        switch deviceType {
        case .iPodTouch1Gen, .iPodTouch2Gen, .iPodTouch3Gen, .iPadMini, .iPhone2G, .iPhone3G, .iPhone3GS:
            return 163
        case .iPodTouch4Gen, .iPodTouch5Gen, .iPodTouch6Gen, .iPadAir2, .iPadMini4, .iPadMini5, .iPadMini6, .iPhone4, .iPhone4S, .iPhone5, .iPhone5S, .iPhone5C, .iPhone6, .iPhone6S, .iPhoneSE, .iPhone7, .iPhone8, .iPhoneXR, .iPhone11, .iPhoneSE2:
            return 326
        case .iPhone12Pro, .iPhone12, .iPhone13Pro, .iPhone13:
            return 460
        case .iPhone12Mini, .iPhone13Mini:
            return 476
        default:
            let idiom = UIDevice.current.userInterfaceIdiom
            let screen = UIScreen.main
            switch idiom {
            case .pad:
                return screen.scale == 1 ? 132 : 264
            default:
                return screen.nativeScale == 3 ? 458 : 401
                
            }
        }
    }()
    
    enum DeviceType: String {
        /*** iPhone ***/
        case iPhone2G
        case iPhone3G
        case iPhone3GS
        case iPhone4
        case iPhone4S
        case iPhone5
        case iPhone5C
        case iPhone5S
        case iPhone6
        case iPhone6Plus
        case iPhone6S
        case iPhone6SPlus
        case iPhoneSE
        case iPhone7
        case iPhone7Plus
        case iPhone8
        case iPhone8Plus
        case iPhoneX
        case iPhoneXS
        case iPhoneXS_Max
        case iPhoneXR
        case iPhone11
        case iPhone11Pro
        case iPhone11Pro_Max
        case iPhoneSE2
        case iPhone12Mini
        case iPhone12
        case iPhone12Pro
        case iPhone12Pro_Max
        case iPhone13Mini
        case iPhone13
        case iPhone13Pro
        case iPhone13Pro_Max
        
        /*** iPad ***/
        case iPad1
        case iPad2
        case iPad3
        case iPad4
        case iPad5
        case iPad6
        case iPad7
        case iPad8
        case iPad9
        case iPadAir
        case iPadAir2
        case iPadAir3
        case iPadAir4
        case iPadMini
        case iPadMini2
        case iPadMini3
        case iPadMini4
        case iPadMini5
        case iPadMini6
        
        /*** iPadPro ***/
        case iPadPro9_7Inch
        case iPadPro12_9Inch
        case iPadPro10_5Inch
        case iPadPro12_9Inch2
        case iPadPro11_0Inch
        case iPadPro12_9Inch3
        case iPadPro11_0Inch2
        case iPadPro12_9Inch4
        case iPadPro11_0Inch3
        case iPadPro12_9Inch5
        
        /*** iPod ***/
        case iPodTouch1Gen
        case iPodTouch2Gen
        case iPodTouch3Gen
        case iPodTouch4Gen
        case iPodTouch5Gen
        case iPodTouch6Gen
        case iPodTouch7Gen
        
        /*** simulator ***/
        case simulator
        
        /*** unknown ***/
        case unknown
    }
    
    static private func getVersionCode() -> String {
        var systemInfo = utsname()
        uname(&systemInfo)
        
        let versionCode: String = String(
            validatingUTF8: NSString(
                bytes: &systemInfo.machine,
                length: Int(_SYS_NAMELEN),
                encoding: String.Encoding.ascii.rawValue
            )!.utf8String!
        )!
        
        return versionCode
    }
    
    static fileprivate func getDevice(code: String) -> DeviceType {
        switch code {
            /*** iPhone ***/
        case "iPhone1,1":                                return .iPhone2G
        case "iPhone1,2":                                return .iPhone3G
        case "iPhone2,1":                                return .iPhone3GS
        case "iPhone3,1", "iPhone3,2", "iPhone3,3":      return .iPhone4
        case "iPhone4,1", "iPhone4,2", "iPhone4,3":      return .iPhone4S
        case "iPhone5,1", "iPhone5,2":                   return .iPhone5
        case "iPhone5,3", "iPhone5,4":                   return .iPhone5C
        case "iPhone6,1", "iPhone6,2":                   return .iPhone5S
        case "iPhone7,2":                                return .iPhone6
        case "iPhone7,1":                                return .iPhone6Plus
        case "iPhone8,1":                                return .iPhone6S
        case "iPhone8,2":                                return .iPhone6SPlus
        case "iPhone8,3", "iPhone8,4":                   return .iPhoneSE
        case "iPhone9,1", "iPhone9,3":                   return .iPhone7
        case "iPhone9,2", "iPhone9,4":                   return .iPhone7Plus
        case "iPhone10,1", "iPhone10,4":                 return .iPhone8
        case "iPhone10,2", "iPhone10,5":                 return .iPhone8Plus
        case "iPhone10,3", "iPhone10,6":                 return .iPhoneX
        case "iPhone11,2":                               return .iPhoneXS
        case "iPhone11,4", "iPhone11,6":                 return .iPhoneXS_Max
        case "iPhone11,8":                               return .iPhoneXR
        case "iPhone12,1":                               return .iPhone11
        case "iPhone12,3":                               return .iPhone11Pro
        case "iPhone12,5":                               return .iPhone11Pro_Max
        case "iPhone12,8":                               return .iPhoneSE2
        case "iPhone13,1":                               return .iPhone12Mini
        case "iPhone13,2":                               return .iPhone12
        case "iPhone13,3":                               return .iPhone12Pro
        case "iPhone13,4":                               return .iPhone12Pro_Max
        case "iPhone14,4":                               return .iPhone13Mini
        case "iPhone14,5":                               return .iPhone13
        case "iPhone14,2":                               return .iPhone13Pro
        case "iPhone14,3":                               return .iPhone13Pro_Max
            
            /*** iPad ***/
        case "iPad1,1", "iPad1,2":                       return .iPad1
        case "iPad2,1", "iPad2,2", "iPad2,3", "iPad2,4": return .iPad2
        case "iPad3,1", "iPad3,2", "iPad3,3":            return .iPad3
        case "iPad3,4", "iPad3,5", "iPad3,6":            return .iPad4
        case "iPad6,11", "iPad6,12":                     return .iPad5
        case "iPad7,5", "iPad7,6":                       return .iPad6
        case "iPad7,11", "iPad7,12":                     return .iPad7
        case "iPad11,6", "iPad11,7":                     return .iPad8
        case "iPad12,1", "iPad12,2":                     return .iPad9
        case "iPad4,1", "iPad4,2", "iPad4,3":            return .iPadAir
        case "iPad5,3", "iPad5,4":                       return .iPadAir2
        case "iPad11,3", "iPad11,4":                     return .iPadAir3
        case "iPad13,1", "iPad13,2":                     return .iPadAir4
        case "iPad2,5", "iPad2,6", "iPad2,7":            return .iPadMini
        case "iPad4,4", "iPad4,5", "iPad4,6":            return .iPadMini2
        case "iPad4,7", "iPad4,8", "iPad4,9":            return .iPadMini3
        case "iPad5,1", "iPad5,2":                       return .iPadMini4
        case "iPad11,1", "iPad11,2":                     return .iPadMini5
        case "iPad14,1", "iPad14,2":                     return .iPadMini6
            
            /*** iPadPro ***/
        case "iPad6,3", "iPad6,4":                       return .iPadPro9_7Inch
        case "iPad6,7", "iPad6,8":                       return .iPadPro12_9Inch
        case "iPad7,1", "iPad7,2":                       return .iPadPro12_9Inch2
        case "iPad7,3", "iPad7,4":                       return .iPadPro10_5Inch
        case "iPad8,1", "iPad8,2", "iPad8,3", "iPad8,4": return .iPadPro11_0Inch
        case "iPad8,5", "iPad8,6", "iPad8,7", "iPad8,8": return .iPadPro12_9Inch3
        case "iPad8,9", "iPad8,10":                      return .iPadPro11_0Inch2
        case "iPad8,11", "iPad8,12":                     return .iPadPro12_9Inch4
        case "iPad13,4", "iPad13,5", "iPad13,6", "iPad13,7":
            return .iPadPro11_0Inch3
        case "iPad13,8", "iPad13,9", "iPad13,10", "iPad13,11":
            return .iPadPro12_9Inch4
            
            /*** iPod ***/
        case "iPod1,1":                                  return .iPodTouch1Gen
        case "iPod2,1":                                  return .iPodTouch2Gen
        case "iPod3,1":                                  return .iPodTouch3Gen
        case "iPod4,1":                                  return .iPodTouch4Gen
        case "iPod5,1":                                  return .iPodTouch5Gen
        case "iPod7,1":                                  return .iPodTouch6Gen
        case "iPod9,1":                                  return .iPodTouch7Gen
            
            /*** Simulator ***/
        case "i386", "x86_64":                           return .simulator
            
        default:                                         return .unknown
        }
    }
}

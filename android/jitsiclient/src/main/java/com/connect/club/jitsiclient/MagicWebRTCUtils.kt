package com.connect.club.jitsiclient

object MagicWebRTCUtils {
    /*
        https://github.com/nextcloud/talk-android/blob/380667040a2eeae2c4cabd6e5f03321f0fdfaad1/app/src/main/java/com/nextcloud/talk/webrtc/MagicWebRTCUtils.java
        AEC blacklist and SL_ES_WHITELIST are borrowed from Signal
        https://github.com/WhisperSystems/Signal-Android/blob/551470123d006b76a68d705d131bb12513a5e683/src/org/thoughtcrime/securesms/ApplicationContext.java
    */
    var HARDWARE_AEC_BLACKLIST = setOf(
        "D6503",
        "ONE A2005",
        "MotoG3",
        "Nexus 6P",
        "Pixel",
        "Pixel XL",
        "MI 4LTE",
        "Redmi Note 3",
        "Redmi Note 4",
        "SM-G900F",
        "g3_kt_kr",
        "GT-I9195",
        "SM-G930F",
        "Xperia SP",
        "Nexus 6",
        "ONE E1003",
        "One",
        "Moto G5",
        "Moto G (5S) Plus",
        "Moto G4",
        "TA-1053",
        "E5823"
    )

    var OPEN_SL_ES_WHITELIST = setOf("Pixel", "Pixel XL")
}

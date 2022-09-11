package com.connect.club.react.bridge.iosLike

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import io.intercom.android.sdk.Intercom
import io.intercom.android.sdk.identity.Registration

class IntercomModule(reactContext: ReactApplicationContext?) :
    ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "IntercomModule"

    @ReactMethod
    fun registerUnidentifiedUser() {
        debugP("Intercom register unidentified")
        Intercom.client().registerUnidentifiedUser()
    }

    @ReactMethod
    fun setLauncherVisibility(isVisible: Boolean?) {
        debugP("Intercom set launcher visible:", isVisible)
        Intercom.client().setLauncherVisibility(
            if (isVisible == true) Intercom.Visibility.VISIBLE else Intercom.Visibility.GONE
        )
    }

    @ReactMethod
    fun loginUser(userId: String) {
        debugP("Intercom login:", userId)
        val registration = Registration.create().withUserId(userId)
        Intercom.client().registerIdentifiedUser(registration)
    }

    @ReactMethod
    fun logoutUser() {
        debugP("Intercom logout")
        Intercom.client().logout()
    }

    @ReactMethod
    fun presentIntercom() {
        debugP("Intercom present")
        Intercom.client().displayMessenger()
    }

    @ReactMethod
    fun presentIntercomCarousel() {
        debugP("Intercom present carousel")
        Intercom.client().displayCarousel("19961407")
    }
}
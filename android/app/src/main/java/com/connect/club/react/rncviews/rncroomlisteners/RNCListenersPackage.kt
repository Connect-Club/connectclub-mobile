package com.connect.club.react.rncviews.rncroomlisteners

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class RNCListenersPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext) = emptyList<NativeModule>()

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
        mutableListOf(RNCRoomListenersViewManager())
}

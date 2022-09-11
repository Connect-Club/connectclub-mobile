package com.connect.club.react.rncviews.rncsurfacevideoview.rnccirclesurfacevideoview

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class RNCCircleSurfaceVideoViewReactPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
        ArrayList()

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
        mutableListOf(RNCCircleSurfaceVideoViewViewManager())
}

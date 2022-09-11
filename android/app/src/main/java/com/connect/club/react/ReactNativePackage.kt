package com.connect.club.react

import android.view.View
import com.connect.club.react.navbar.DecorConfigModule
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager

class ReactNativePackage : ReactPackage {

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): MutableList<ViewManager<View, ReactShadowNode<*>>> {
        return mutableListOf()
    }

    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): MutableList<NativeModule> {
        return mutableListOf(DecorConfigModule(reactContext), AppInfoModule(reactContext))
    }
}

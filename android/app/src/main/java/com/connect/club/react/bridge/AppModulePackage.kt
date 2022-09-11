package com.connect.club.react.bridge

import com.connect.club.react.bridge.iosLike.AppModule
import com.connect.club.react.bridge.iosLike.Logger
import com.connect.club.react.bridge.iosLike.IntercomModule
import com.connect.club.react.bridge.iosLike.ui.go.HttpClient
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class AppModulePackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(AppModule(reactContext), IntercomModule(reactContext), HttpClient(reactContext), Logger(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
package com.connect.club.react.bridge.iosLike.ui

import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.views.view.ReactViewGroup
import com.facebook.react.views.view.ReactViewManager
import java.lang.ref.WeakReference

class RadarViewManager : ReactViewManager() {

    companion object {
        const val REACT_CLASS = "RadarView"
    }

    override fun getName(): String = REACT_CLASS

    override fun createViewInstance(reactContext: ThemedReactContext): RadarView {
        val view = RadarView(reactContext)
        AppManager.radarView = view
        return view
    }
}

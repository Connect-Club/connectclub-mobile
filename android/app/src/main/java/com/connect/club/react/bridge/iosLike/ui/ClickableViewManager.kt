package com.connect.club.react.bridge.iosLike.ui

import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.views.view.ReactViewManager

class ClickableViewManager : ReactViewManager() {

    override fun getName(): String = "ClickableView"

    override fun createViewInstance(reactContext: ThemedReactContext) = ClickableView(reactContext)

    override fun getExportedCustomBubblingEventTypeConstants(): Map<String, Any> {
        return MapBuilder.builder<String, Any>().put("onClick", MapBuilder.of<String, Any>("phasedRegistrationNames", MapBuilder.of("bubbled", "onClick"))).build()
    }
}

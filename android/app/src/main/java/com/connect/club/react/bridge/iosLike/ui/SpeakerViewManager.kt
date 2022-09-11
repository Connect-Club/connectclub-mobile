package com.connect.club.react.bridge.iosLike.ui

import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.views.view.ReactViewManager

class SpeakerViewManager : ReactViewManager() {
    override fun getName(): String = "SpeakerView"
    override fun createViewInstance(reactContext: ThemedReactContext) = SpeakerView(reactContext)

    @ReactProp(name = "userId")
    fun setUserId(view: SpeakerView, userId: String) {
        view.userId = userId
    }

    override fun getExportedCustomBubblingEventTypeConstants(): Map<String, Any> {
        return MapBuilder.builder<String, Any>().put("onClick", MapBuilder.of<String, Any>("phasedRegistrationNames", MapBuilder.of("bubbled", "onClick"))).build()
    }
}

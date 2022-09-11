package com.connect.club.react.rncviews.rncroomlayout

import com.connect.club.react.bridge.iosLike.debugP
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp

class RNCRoomLayoutViewManager : ViewGroupManager<RNCRoomLayout>() {

    companion object {
        const val REACT_CLASS = "RNCRoomLayout"
    }

    override fun getName(): String = REACT_CLASS

    override fun createViewInstance(reactContext: ThemedReactContext): RNCRoomLayout =
        RNCRoomLayout(reactContext)

    @ReactProp(name = "options")
    fun setOptions(view: RNCRoomLayout, optionsRm: ReadableMap) {
        val options = optionsRm.toHashMap().let {
            Options(
                width = (it["width"] as Double).toFloat(),
                height = (it["height"] as Double).toFloat(),
                multiplier = (it["multiplier"] as Double).toFloat(),
                minZoom = (it["minZoom"] as Double).toFloat(),
                maxZoom = (it["maxZoom"] as Double).toFloat(),
            )
        }
        view.setOptions(options)
        debugP("🎛 ZoomLayout options", options)
    }

    override fun getExportedCustomBubblingEventTypeConstants(): Map<String, Any> {
        return MapBuilder.builder<String, Any>()
            .put(
                "onLocationClicked",
                MapBuilder.of<String, Any>(
                    "phasedRegistrationNames",
                    MapBuilder.of("bubbled", "onLocationClicked")
                )
            )
            .build()
    }
//
//    override fun needsCustomLayoutForChildren(): Boolean = true
//
//    override fun shouldPromoteGrandchildren(): Boolean = true

//    private fun getOnClickHandlerInfoEvent(): Pair<String, Map<String, Any>> {
//        val eventName = "onClickEvent"
//        val propName = "onClick"
//        return Pair(eventName, mapOf("phasedRegistrationNames" to mapOf("bubbled" to propName)))
//    }
}

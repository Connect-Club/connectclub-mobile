package com.connect.club.react.rncviews.rncroomlisteners

import android.view.View
import android.view.ViewGroup
import com.connect.club.R
import com.connect.club.react.bridge.iosLike.ui.allReactions
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp

class RNCRoomListenersViewManager : ViewGroupManager<RNCListenersView>() {

    override fun getName(): String = "RNCRoomListeners"

    override fun createViewInstance(reactContext: ThemedReactContext): RNCListenersView {
        return RNCListenersView(reactContext)
    }

    @ReactProp(name = "minSheetHeight")
    fun setMinSheetHeight(view: RNCListenersView, value: Float) {
        view.updatePeekHeight(value.toInt())
    }

    @ReactProp(name = "middleSheetHeight")
    fun setMiddleSheetHeight(view: RNCListenersView, value: Float) {
        view.updateMiddleHeight(value)
    }

    @ReactProp(name = "specialGuestBadgeIcon")
    fun setSpecialGuestBadgeIcon(view: RNCListenersView, icon: String) {
        view.specialGuestBadgeIcon = icon
    }

    @ReactProp(name = "badgedGuestBadgeIcon")
    fun setBadgedGuestBadgeIcon(view: RNCListenersView, icon: String) {
        view.badgedGuestBadgeIcon = icon
    }

    @ReactProp(name = "specialModeratorBadgeIcon")
    fun setSpecialModeratorBadgeIcon(view: RNCListenersView, icon: String) {
        view.specialModeratorBadgeIcon = icon
    }

    @ReactProp(name = "newbieBadgeIcon")
    fun setnewbieBadgeIcon(view: RNCListenersView, icon: String) {
        view.newbieBadgeIcon = icon
    }

    @ReactProp(name = "emojiIcons")
    fun setEmojiIcons(view: RNCListenersView, icons: ReadableMap) {
        val keySetIterator = icons.keySetIterator()
        while (keySetIterator.hasNextKey()) {
            val key = keySetIterator.nextKey()
            allReactions[key] = icons.getString(key)!!
        }
    }

    override fun addView(parent: RNCListenersView, child: View?, index: Int) {
        parent.findViewById<ViewGroup>(R.id.popupHeader)?.addView(child, index)
    }

    override fun removeViewAt(parent: RNCListenersView, index: Int) {
        // don't remove here because of exception
    }

    override fun getExportedCustomBubblingEventTypeConstants(): MutableMap<String, Any> {
        return MapBuilder.builder<String, Any>()
                .put("onUserTap",
                        MapBuilder.of<String, Any>(
                                "phasedRegistrationNames",
                                MapBuilder.of("bubbled", "onUserTap")
                        )
                )
                .build()
    }
}

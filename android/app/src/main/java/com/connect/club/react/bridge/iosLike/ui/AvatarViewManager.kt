package com.connect.club.react.bridge.iosLike.ui

import com.connect.club.view.AvatarView
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

class AvatarViewManager : SimpleViewManager<AvatarView>() {
    override fun getName() = "AvatarView"

    override fun createViewInstance(reactContext: ThemedReactContext): AvatarView {
        val view = AvatarView(reactContext)
        return view
    }

    @ReactProp(name = "initials")
    fun setInitials(view: AvatarView, initials: String) {
        view.lettersText = initials
    }

    @ReactProp(name = "avatar")
    fun setAvatar(view: AvatarView, avatar: String?) {
        view.image = avatar
    }

    @ReactProp(name = "fontSize")
    fun setFonSize(view: AvatarView, size: Int) {
        view.fontSize = size.toFloat()
    }

    @ReactProp(name = "initialsMode")
    fun setInitialsMode(view: AvatarView, mode: String?) {
        view.initialsMode = mode.orEmpty()
    }
}

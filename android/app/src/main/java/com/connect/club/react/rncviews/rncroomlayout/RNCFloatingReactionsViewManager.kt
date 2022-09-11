package com.connect.club.react.rncviews.rncroomlayout

import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager

class RNCFloatingReactionsViewManager : ViewGroupManager<RNCFloatingReactionsView>() {

    companion object {
        const val REACT_CLASS = "RNCFloatingReactions"
    }

    override fun getName(): String = REACT_CLASS

    override fun createViewInstance(reactContext: ThemedReactContext): RNCFloatingReactionsView =
        RNCFloatingReactionsView(reactContext)
}

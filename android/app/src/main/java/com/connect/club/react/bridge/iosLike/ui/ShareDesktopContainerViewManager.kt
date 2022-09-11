package com.connect.club.react.bridge.iosLike.ui

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.annotations.ReactProp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch

class ShareDesktopContainerViewManager : ViewGroupManager<ShareDesktopContainerView>() {
    companion object {
        private const val COMMAND_COLLAPSE = 1
    }

    override fun getName(): String = "ShareDesktopContainerView"

    override fun getExportedCustomBubblingEventTypeConstants(): Map<String, Any> {
        return MapBuilder.builder<String, Any>()
            .put(
                "onStateChange",
                MapBuilder.of<String, Any>("phasedRegistrationNames", MapBuilder.of("bubbled", "onStateChange"))
            )
            .build()
    }

    override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any>? {
        return MapBuilder.builder<String, Any>()
            .put(
                "onShareClick",
                MapBuilder.of("registrationName", "onShareClick"),
            )
            .build()
    }

    @ReactProp(name = "allowToShare")
    fun setAllowToShare(view: ShareDesktopContainerView, allowToShare: Boolean) {
        view.allowToShare = allowToShare
    }

    override fun createViewInstance(reactContext: ThemedReactContext): ShareDesktopContainerView {
        val view = ShareDesktopContainerView(reactContext)
        AppManager.shareScreenVideoView = view
        return view
    }

    override fun getCommandsMap(): Map<String, Int>? {
        return MapBuilder.of(
            "collapse",
            COMMAND_COLLAPSE,
        )
    }

    override fun receiveCommand(root: ShareDesktopContainerView, commandId: Int, args: ReadableArray?) {
        super.receiveCommand(root, commandId, args)
        when (commandId) {
            COMMAND_COLLAPSE -> GlobalScope.launch(Dispatchers.Main) {
                root.forceCollapse()
            }
        }
    }
}

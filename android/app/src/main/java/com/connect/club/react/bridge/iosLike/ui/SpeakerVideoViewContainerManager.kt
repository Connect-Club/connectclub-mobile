package com.connect.club.react.bridge.iosLike.ui

import com.connect.club.utils.toPx
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.views.view.ReactViewGroup
import com.facebook.react.views.view.ReactViewManager

class SpeakerVideoViewContainerManager : ReactViewManager() {
    override fun getName(): String = "SpeakerVideoViewContainer"
    override fun createViewInstance(reactContext: ThemedReactContext) = SpeakerVideoViewContainer(reactContext)
}


class ToggleVideoAudioButtonsManager : ReactViewManager() {
    private val commands = mutableMapOf(
            "toggleVideo" to 1,
            "toggleAudio" to 2,
    )

    private val inverseCommands = mutableMapOf(
            1 to "toggleVideo",
            2 to "toggleAudio",
    )


    override fun getName(): String = "ToggleVideoAudioButtons"
    override fun createViewInstance(reactContext: ThemedReactContext) = ToggleVideoAudioButtons(reactContext)

    @ReactProp(name = "micOnIcon")
    fun micOnIcon(view: ToggleVideoAudioButtons, icon: String) {
        view.micOnIcon = icon
    }

    @ReactProp(name = "micOffIcon")
    fun micOffIcon(view: ToggleVideoAudioButtons, icon: String) {
        view.micOffIcon = icon
    }

    @ReactProp(name = "cameraOnIcon")
    fun cameraOnIcon(view: ToggleVideoAudioButtons, icon: String) {
        view.cameraOnIcon = icon
    }

    @ReactProp(name = "cameraOffIcon")
    fun cameraOffIcon(view: ToggleVideoAudioButtons, icon: String) {
        view.cameraOffIcon = icon
    }

    @ReactProp(name = "progressColor", customType = "Color")
    fun cameraOffIcon(view: ToggleVideoAudioButtons, color: Int?) {
        view.progressColor = color
    }

    override fun receiveCommand(root: ReactViewGroup, commandId: Int, args: ReadableArray?) {
        receiveCommand(root, inverseCommands[commandId], args)
    }

    override fun receiveCommand(root: ReactViewGroup, commandId: String?, args: ReadableArray?) {
        args ?: return
        commandId ?: return
        when(commandId) {
            "toggleVideo" -> (root as ToggleVideoAudioButtons).toggleVideo()
            "toggleAudio" -> (root as ToggleVideoAudioButtons).toggleAudio()
        }
    }

    override fun getCommandsMap(): MutableMap<String, Int> {
        return commands
    }
}

class UserTogglesViewManager : ReactViewManager() {
    override fun getName(): String = "UserTogglesView"
    override fun createViewInstance(reactContext: ThemedReactContext) = UserTogglesView(reactContext)
}

class UserSpeakerMicrophoneIconsViewManager : ReactViewManager() {
    override fun getName(): String = "UserSpeakerMicrophoneIconsView"
    override fun createViewInstance(reactContext: ThemedReactContext): UserSpeakerMicrophoneIconsView {
        return UserSpeakerMicrophoneIconsView(reactContext).also {
            it.contentDescription = "speakerMicrophoneIcon"
        }
    }
}

class RasterIconViewManager : SimpleViewManager<RasterIconView>() {
    override fun getName(): String = "RasterIcon"
    override fun createViewInstance(reactContext: ThemedReactContext) = RasterIconView(reactContext)

    @ReactProp(name = "uri")
    fun setUri(view: RasterIconView, uri: String) {
        view.showImage(uri)
    }

    @ReactProp(name = "paddingHorizontal", defaultFloat = 0F)
    fun setPaddingHorizontal(view: RasterIconView, paddingHorizontal: Float) {
        val padding = paddingHorizontal.toPx()
        view.setPadding(padding, 0, padding, 0)
    }

    @ReactProp(name = "scaleType")
    fun setScaleType(view: RasterIconView, scaleType: String) {
        view.setReactScaleType(scaleType)
    }

    @ReactProp(name = "circle")
    fun setCircle(view: RasterIconView, isCircle: Boolean) {
        view.setCircle(isCircle)
    }
}

class TargetPathViewManager : ReactViewManager() {

    override fun getName(): String {
        return "TargetPathView"
    }


    override fun createViewInstance(reactContext: ThemedReactContext): TargetPathView {
        val view = TargetPathView(reactContext)
        AppManager.targetPathView = view
        return view
    }
}

class UserReactionsViewManager : ReactViewManager() {
    override fun getName() = "UserReactionsView"
    override fun createViewInstance(reactContext: ThemedReactContext) = UserReactionsView(reactContext)
}

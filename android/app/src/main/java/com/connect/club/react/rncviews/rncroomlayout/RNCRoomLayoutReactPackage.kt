package com.connect.club.react.rncviews.rncroomlayout

import com.connect.club.react.bridge.iosLike.ui.*
import com.connect.club.react.rncviews.rncroombackground.RNCRoomBackgroundManager
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class RNCRoomLayoutReactPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
        ArrayList()

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
        mutableListOf(
                RNCRoomLayoutViewManager(),
                RNCFloatingReactionsViewManager(),
                TargetPathViewManager(),
                RNCRoomBackgroundManager(),
                ShareDesktopContainerViewManager(),
                SpeakerViewManager(),
                ClickableViewManager(),
                RadarViewManager(),
                SpeakerVideoViewContainerManager(),
                ToggleVideoAudioButtonsManager(),
                UserTogglesViewManager(),
                UserSpeakerMicrophoneIconsViewManager(),
                RasterIconViewManager(),
                AvatarViewManager(),
                UserReactionsViewManager(),
                MenuTextInputViewManager(),
        )
}

package com.connect.club

import android.app.Application
import android.content.Context
import android.media.AudioAttributes
import android.media.AudioManager
import com.bugsnag.android.Bugsnag
import com.bugsnag.android.Configuration
import com.connect.club.react.AppInfoModule
import com.connect.club.react.ReactNativePackage
import com.connect.club.react.bridge.AppModulePackage
import com.connect.club.react.bridge.iosLike.LogUtil
import com.connect.club.react.bridge.iosLike.debugP
import com.connect.club.react.rncviews.rncroomlayout.RNCRoomLayoutReactPackage
import com.connect.club.react.rncviews.rncroomlisteners.RNCListenersPackage
import com.connect.club.react.rncviews.rncsurfacevideoview.rnccirclesurfacevideoview.RNCCircleSurfaceVideoViewReactPackage
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.google.firebase.installations.FirebaseInstallations
import io.branch.referral.Branch
import io.intercom.android.sdk.Intercom
import io.intercom.android.sdk.push.IntercomPushClient
import org.webrtc.audio.WebRtcAudioTrack

class App(
    private val applicationContext: Context,
    private val reactNativeHost: ReactNativeHost,
) {

    companion object {
        lateinit var appContext: Application
            get
            private set
    }

    /**
     * Called from React Native application implementation
     */
    fun onCreate(app: MainApplication) {
        appContext = app
        val config = Configuration.load(app)
        config.addOnError { event ->
            debugP("native received error event from bugsnag")
            LogUtil.attachLogToBugsnag(event)
            true
        }

        Bugsnag.start(app, config)
        Branch.enableLogging()
        Branch.getAutoInstance(applicationContext)
        Intercom.initialize(app, "android_sdk-2700f6089e18588655aef81da4700b85bfd53cfb", "bfcjjicu")
        FirebaseInstallations.getInstance().getToken(false).addOnSuccessListener {
            debugP("Send FCM token to Intercom")
            IntercomPushClient().sendTokenToIntercom(appContext, it.token)
        }.addOnFailureListener {
            debugP("Send FCM token to Intercom failure", it)
            if (BuildConfig.DEBUG) it.printStackTrace()
        }
    }

    fun getRNComponentsPackages(): List<ReactPackage> = listOf(
        AppModulePackage(),
        // Bridge
        ReactNativePackage(),
        RNCRoomLayoutReactPackage(),
        RNCCircleSurfaceVideoViewReactPackage(),
        RNCListenersPackage(),
    )
}

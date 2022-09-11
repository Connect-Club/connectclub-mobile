package com.connect.club.react

import android.media.AudioAttributes
import android.media.AudioManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import org.webrtc.audio.WebRtcAudioTrack

class AppInfoModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    var buildFeatures: List<String> = emptyList()
        get
        private set

    val isHostApp: Boolean
        get() {
            return AppInfoModule.instance.buildFeatures.contains(AppInfoModule.FEATURE_HOST)
        }

    override fun getName(): String = "AppInfoModule"

    init {
        instance = this
    }

    @ReactMethod
    fun registerBuildFeatures(features: ReadableArray) {
        buildFeatures = features.toArrayList().map(Any::toString)

        WebRtcAudioTrack.Attrs.getInstance().apply {
            defaultStream = if (isHostApp) AudioManager.STREAM_MUSIC else AudioManager.STREAM_VOICE_CALL
            defaultUsage = if (isHostApp) AudioAttributes.USAGE_MEDIA else AudioAttributes.USAGE_VOICE_COMMUNICATION
            useLowLatency = true
        }
    }

    companion object {
        lateinit var instance: AppInfoModule
            get
            private set
        const val FEATURE_HOST = "host"
    }
}

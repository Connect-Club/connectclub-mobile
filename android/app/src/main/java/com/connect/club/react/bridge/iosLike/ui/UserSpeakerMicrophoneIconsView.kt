package com.connect.club.react.bridge.iosLike.ui

import android.content.Context
import android.view.View
import androidx.core.view.isVisible
import com.facebook.react.views.view.ReactViewGroup
import org.json.JSONObject

class UserSpeakerMicrophoneIconsView(context: Context?) : ReactViewGroup(context) {
    private var icSpeakerOn: View? = null

    fun onState(state: JSONObject) {
        val isExpired = state.getBoolean("isExpired")
        val isReaction = state.getString("reaction") != "none"
        val isSpeaker = state.getBoolean("isSpeaker")
        val isAbsoluteSpeaker = state.getBoolean("isAbsoluteSpeaker")
        val isLocal = state.getBoolean("isLocal")
        val audio = state.getBoolean("audio")

        isVisible = (isAbsoluteSpeaker || isSpeaker) && !isReaction && !isExpired

        if (isLocal) {
            if (isSpeaker && !isAbsoluteSpeaker) {
                AppManager.radarView?.hide()
            } else {
                AppManager.radarView?.show()
            }
        }
        if (!isVisible) return

        icSpeakerOn?.isVisible = audio
    }

    override fun addView(child: View?, index: Int) {
        super.addView(child, index)

        if (child?.contentDescription == "icSpeakerOn") {
            icSpeakerOn = child
            child.isVisible = false
        }
    }
}

package com.connect.club.react.bridge.iosLike.ui

import android.content.Context
import android.view.View
import androidx.core.view.isVisible
import com.connect.club.react.bridge.iosLike.Bool
import com.facebook.react.views.view.ReactViewGroup
import org.json.JSONObject

fun countIcons(video: Bool, audio: Bool): Int {
    var count = 0
    if (!video) count += 1
    if (!audio) count += 1
    return count
}

class UserTogglesView(context: Context?) : ReactViewGroup(context) {
    private var audioIconView: View? = null
    private var videoIconView: View? = null

    var audio = false
    var video = false

    fun onState(state: JSONObject) {
        //val isExpired = state.getBoolean("isExpired")
        val isReaction = state.getString("reaction") != "none"
        video = state.getBoolean("video")
        audio = state.getBoolean("audio")

        isVisible = (!video || !audio) && !isReaction// && !isExpired
        if (!isVisible) return
        requestLayout()

        videoIconView?.isVisible = !video
        audioIconView?.isVisible = !audio

        val count = countIcons(video, audio)

        val width = audioIconView!!.height
        if (audioIconView != null) {
            layout(left, top, left + width, top + width * count)
        }
    }

    fun showIfNeed() {
        isVisible = !video || !audio
    }

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        if ((!audio && video) || (audio && !video)) { audioIconView?.layout(0, 0, width, width) }
        if (!audio && !video) { videoIconView?.layout(0, 0, width, width) }
        if (!audio && !video) {
            videoIconView?.layout(0, 0, width, width)
            audioIconView?.layout(0, width, width, width * 2)
        }
    }


    override fun addView(child: View?, index: Int) {
        super.addView(child, index)

        if (child?.contentDescription == "audioIconView") {
            audioIconView = child
            child.isVisible = false
        }

        if (child?.contentDescription == "videoIconView") {
            videoIconView = child
            child.isVisible = false
        }
    }
}
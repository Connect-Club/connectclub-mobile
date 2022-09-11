package com.connect.club.react.bridge.iosLike.ui

import android.content.Context
import androidx.core.view.isVisible
import com.facebook.react.views.view.ReactViewGroup
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class UserReactionsView(context: Context?) : ReactViewGroup(context) {
    private var currentReaction: String = "none"
    private var userId: String? = null
    private val hideRunnable = Runnable {
        userId?.let { AppManager.room?.removeReaction(it) }
        isVisible = false
    }

    fun onState(state: JSONObject) {
        toggleReaction(state.getString("id"), state.getString("reaction"))
    }

    fun toggleReaction(id: String, newReaction: String) {
        val isReaction = newReaction != "none"
        if (!isReaction) {
            currentReaction = newReaction
            isVisible = false
            handler?.removeCallbacks(hideRunnable)
            return
        }
        if (currentReaction == newReaction) return
        isVisible = true
        currentReaction = newReaction
        handler?.removeCallbacks(hideRunnable)
        userId = id
        handler?.postDelayed(hideRunnable, TimeUnit.SECONDS.toMillis(10))
    }
}

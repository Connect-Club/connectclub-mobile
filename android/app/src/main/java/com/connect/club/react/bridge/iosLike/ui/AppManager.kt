package com.connect.club.react.bridge.iosLike.ui

import android.view.View
import androidx.core.view.isVisible
import com.connect.club.react.AppInfoModule
import com.connect.club.react.bridge.iosLike.NewJitsi
import com.connect.club.react.bridge.iosLike.debugP
import com.connect.club.react.bridge.iosLike.weak
import com.connect.club.react.rncviews.rncroomlayout.RNCFloatingReactionsView
import com.connect.club.react.rncviews.rncroomlisteners.ListenersPresenter
import com.connect.club.utils.forEach
import com.connect.club.utils.runOnMainThread
import common.LiveRoom
import org.json.JSONArray
import org.json.JSONObject
import java.util.*

object AppManager {

    val speakers = mutableMapOf<String, SpeakerView>()
    var targetPathView by weak<TargetPathView?>()
    var radarView by weak<RadarView?>()
    var shareScreenVideoView by weak<ShareDesktopContainerView?>()
    var reactionsView by weak<RNCFloatingReactionsView?>()

    var toggleVideoAudioButtonsSet = ToggleVideoAudioButtonsSet()
    var newJitsi by weak<NewJitsi?>()

    var room: LiveRoom? = null
    var roomName: String = ""
    var shouldUpdateUserPositionOnState = true

    var localUserId: String = ""

    @Volatile
    var isDestroying = false

    @Volatile
    var isJitsiConnected = false

    var isOffline = false

    val currentUserState: JSONObject?
        get() = synchronized(speakers) { speakers[localUserId]?.lastState }

    val currentSpeaker: SpeakerView?
        get() = synchronized(speakers) { speakers[localUserId] }


    fun addSpeaker(id: String, view: SpeakerView) {
        debugP("||| add speaker", id)
        speakers[id] = view
    }

    fun removeSpeaker(id: String) {
        synchronized(speakers) { speakers.remove(id) }
        room?.removeReaction(id)
    }

    fun sendMove(x: Float, y: Float) {
        debugP("View: sendMove", x, y)
        targetPathView?.move(x, y)
        room?.sendUserPath(x.toDouble(), y.toDouble())
    }

    fun moveUserTo(user: View, x: Double, y: Double, duration: Double, userId: String) {
        // wait radar only for current user
        if (radarView == null && userId == localUserId) return
        val radar = radarView
        val x = x.toFloat()
        val y = y.toFloat()

        val halfWidth = user.width / 2
        val halfHeight = user.height / 2
        val tx = user.translationX + halfWidth
        val ty = user.translationY + halfHeight

        if (x.toInt() == tx.toInt() && y.toInt() == ty.toInt()) return
        debugP("View: moveUser", userId, x, y, user.translationX, user.translationY, user.width)
        if (x.toInt() == 0 || y.toInt() == 0) {
            val speaker = user as? SpeakerView
            speaker?.move(0f, 0f)
            speaker?.isVisible = false
            if (userId == localUserId) {
                radarView?.isVisible = false
                targetPathView?.isVisible = false
            }
            return
        }

        if (userId == localUserId) targetPathView?.move(x, y)

        val userView = (user as BaseMovableView)
        if (userView.translationX < 0) userView.move(x, y)
        else userView.animatedMove(x, y, duration)

        if (userId == localUserId) {
            val rtx = radar?.translationX ?: 0F
            if (rtx == -10000f) radar?.move(x, y)
            else radar?.animatedMove(x, y, duration)
        }
    }

    fun moveUser(userId: String, x: Double, y: Double) {
        if (isDestroying) return
        val view = synchronized(speakers) { speakers[userId] } ?: return
        val isFirstMove = view.translationX <= 0 || view.translationY <= 0
        if (isFirstMove || shouldUpdateUserPositionOnState) {
            debugP("++++++ move user")
            moveUserTo(view, x, y, 1.0, userId)
        }
    }

    fun moveUserOnUI(userId: String, x: Double, y: Double, duration: Double) {
        runOnMainThread {
            if (isDestroying) return@runOnMainThread
            val view = synchronized(speakers) { speakers[userId] } ?: return@runOnMainThread
            moveUserTo(view, x, y, duration, userId)
        }
    }

    fun onNativeState(json: ByteArray?) {
        json ?: return
        val string = String(json)
        debugP("onNativeState", string)
        val array = JSONArray(string)
        runOnMainThread {
            array.forEach { state ->
                val id = state.getString("id")
                val x = state.getDouble("x")
                val y = state.getDouble("y")
                moveUser(id, x, y)
                if (isDestroying) return@runOnMainThread
                synchronized(speakers) { speakers[id] }?.let {
                    val scale = state.getDouble("audioLevel")
                    it.animateScale(scale.toFloat())
                    it.onState(state)
                    if (localUserId == id) toggleVideoAudioButtonsSet.onState(state)
                }
            }
            shouldUpdateUserPositionOnState = false
        }
    }

    fun onReaction(json: ByteArray?) {
        json ?: return
        val string = String(json)
        val jsonObject = JSONObject(string)
        runOnMainThread {
            val payload = jsonObject.getJSONObject("payload")
            val userId = payload.getString("fromId")
            val reaction = payload.getString("reaction")
            speakers[userId]?.toggleReaction(userId, reaction)
            ListenersPresenter.updateReaction(userId, reaction)
        }
    }

    fun onConnectionState(state: ByteArray?) {
        state ?: return
        val jsonString = String(state)
        val json = JSONObject(jsonString)
        if (json.getString("id") != localUserId) return
        runOnMainThread {
            toggleVideoAudioButtonsSet.isVisible = false
            if (json.getString("mode") != "popup") return@runOnMainThread
            synchronized(speakers) {
                val speaker = speakers.remove(localUserId) ?: return@synchronized
                moveUserTo(speaker, 0.0, 0.0, 1.0, localUserId)
            }
        }
    }
}

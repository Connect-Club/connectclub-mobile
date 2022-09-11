package com.connect.club.react.rncviews.rncroomlisteners

import com.connect.club.react.bridge.iosLike.ui.AppManager
import com.connect.club.utils.contains
import com.connect.club.utils.runOnMainThread
import kotlinx.coroutines.*
import org.json.JSONArray
import org.json.JSONObject

object ListenersPresenter {
    private var updatedAfterAttach = false
    private var listenersView: RNCListenersView? = null
    private var model = Model()
    private lateinit var bg: CoroutineScope
    private var diffJob: Job? = null
    private var prevJson: String? = null

    fun takeView(listenersView: RNCListenersView) {
        removeView(listenersView)
        if (::bg.isInitialized) bg.cancel()
        bg = CoroutineScope(Dispatchers.Default)
        this.listenersView = listenersView
        renderModel()
        updatedAfterAttach = false
    }

    fun removeView(listenersView: RNCListenersView) {
        if (this.listenersView !== listenersView) return
        this.listenersView = null
        bg.cancel()
        diffJob = null
        prevJson = null
        model = Model()
    }

    fun update(json: String) = runOnMainThread {
        if (!::bg.isInitialized) return@runOnMainThread
        if (prevJson == json && updatedAfterAttach) return@runOnMainThread
        updatedAfterAttach = true
        prevJson = json
        bg.launch {
            val model = parseData(JSONObject(json))
            withContext(Dispatchers.Main) {
                this@ListenersPresenter.model = model
                renderModel()
            }
        }
    }

    fun updateReaction(userId: String, reaction: String) = runOnMainThread {
        val listener = model.listeners[userId]?.copy(reaction = reaction) ?: return@runOnMainThread
        val index = model.indices[userId] ?: return@runOnMainThread
        model.listeners[listener.id] = listener
        this.listenersView?.renderListener(index, listener)
    }

    private fun renderModel() = this.listenersView?.let { view ->
        diffJob?.cancel()
        diffJob = bg.launch {
            val listeners = model.listeners.values.toMutableList()
            val diff = view.onCreateListenersDiff(listeners)
            withContext(Dispatchers.Main) {
                view.renderInfo(model.topic, model.speakersNum, model.listenersNum)
                view.renderListeners(listeners, diff)
            }
        }
    }

    private fun parseData(json: JSONObject): Model {
        val usersObj = json.optJSONArray("users") ?: return Model(AppManager.roomName)
        val speakersNum = json.getInt("speakersCount")
        val users = LinkedHashMap<String, ListenerItem>()
        val listenersNum = if (json.has("listenersCount")) json.getInt("listenersCount") else 0
        val total = usersObj.length()
        val indices = mutableMapOf<String, Int>()
        var index = 0
        while (index < total) {
            val userObj = usersObj.getJSONObject(index)
            val reaction = userObj.getString("reaction")
            val id = userObj.getString("id")
            val isAdmin = userObj.getBoolean("isAdmin")
            val isSpecialGuest = userObj.getBoolean("isSpecialGuest")
            indices[id] = index
            index += 1
            users[id] = ListenerItem(
                id = id,
                name = userObj.optString("name").orEmpty(),
                surname = userObj.optString("surname").orEmpty(),
                avatarSrc = userObj.optString("avatar").orEmpty(),
                reaction = if (reaction.isEmpty()) null else reaction,
                isAdmin = isAdmin,
                isLocal = userObj.getBoolean("isLocal"),
                role = defineRole(isAdmin, isSpecialGuest, userObj.optJSONArray("badges"))
            )
        }
        return Model(AppManager.roomName, speakersNum, listenersNum, users, indices)
    }

    private fun defineRole(isAdmin: Boolean,isSpecial: Boolean, badges: JSONArray?): ListenerRole {
        if (isSpecial) return ListenerRole.SpecialGuest

        val badgeCount = badges?.length() ?: 0
        if (badgeCount == 0 && !isAdmin) return ListenerRole.Default

        val isNewbie = badges?.contains("new") ?: false
        val isNewbieOnly = isNewbie && badgeCount == 1

        if (isAdmin) {
            if (badgeCount == 0 || isNewbieOnly) {
                return ListenerRole.Admin
            }
            return ListenerRole.FestivalAdmin
        }

        if (isNewbie) {
            return if (badgeCount > 1) ListenerRole.BadgedGuest else ListenerRole.Newbie
        }

        return if (badgeCount > 0) ListenerRole.BadgedGuest else ListenerRole.Default
    }

    data class Model(
        val topic: String = "",
        val speakersNum: Int = 0,
        val listenersNum: Int = 0,
        val listeners: LinkedHashMap<String, ListenerItem> = LinkedHashMap(),
        val indices: Map<String, Int> = emptyMap()
    )
}

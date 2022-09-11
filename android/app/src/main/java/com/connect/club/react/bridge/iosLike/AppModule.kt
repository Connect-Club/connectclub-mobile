package com.connect.club.react.bridge.iosLike

import android.os.Handler
import android.os.HandlerThread
import com.connect.club.App
import com.connect.club.RoomService
import com.connect.club.react.bridge.iosLike.ui.AppManager
import com.connect.club.react.bridge.iosLike.ui.go.GoAsyncStorage
import com.connect.club.react.rncviews.rncroomlisteners.ListenersPresenter
import com.connect.club.utils.map
import com.connect.club.utils.runOnMainThread
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import common.Common
import common.DatatrackDelegate
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import kotlinx.coroutines.GlobalScope


enum class Event {
    onWebSocketMessage,
    onRoomReconnecting,
    onError,
    onChangeRoomMode,
    killRoom,
    analyticsEvent,
}

class AppModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext),
    DatatrackDelegate {
    companion object {
        var instance by weak<AppModule?>()
    }

    init {
        instance = this
    }

    override fun getName() = "AppModule"

    private val networkManager = NetworkReachabilityManager()
    private val queue by lazy {
        val thread = HandlerThread("AppModuleQueue")
        thread.start()
        return@lazy Handler(thread.looper)
    }
    private val defaultScope = CoroutineScope(Dispatchers.Default)

    internal val client = NewJitsi()

    fun sendEvent(type: Event, body: Any) {
        reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit(type.name, body)
    }

    override fun getConstants(): MutableMap<String, Any> {
        return mutableMapOf("LOG_FILE_PATH" to LogUtil.logFilePath)
    }

    @ReactMethod
    fun jvBusterSetSubscriptionType(type: String) {
        queue.post {
            debugP("AppModule.jvBusterSetSubscriptionType", type)
            AppManager.room?.setJvbusterSubscriptionType(type)
        }
    }

    @ReactMethod
    fun connectToRoom(json: String, promise: Promise) {
        queue.post {
            RoomService.start(reactApplicationContext)
            val jsonObject = JSONObject(json)
            debugP("AppModule websocketsConnect.start", json)
            val dm = App.appContext.resources.displayMetrics
            val sw = dm.widthPixels.toDouble() / dm.xdpi
            client.isQuite = false
            client.context = reactApplicationContext
            client.appModule = this
            AppManager.isDestroying = false
            AppManager.localUserId = jsonObject.getString("userId")
            AppManager.roomName = jsonObject.getString("roomName")

            client.setParams(
                jsonObject.getInt("videoWidth"),
                jsonObject.getInt("videoHeight"),
                jsonObject.getInt("fps"),
                jsonObject.getBoolean("videoEnabled"),
                jsonObject.getBoolean("audioEnabled"),
            )

            var roomConnected = false
            try {
                AppManager.room = Common.connectToLiveRoom(
                    this@AppModule,
                    jsonObject.getString("url"),
                    jsonObject.getString("roomId"),
                    GoAsyncStorage.instance.getString("accessToken"),
                    jsonObject.optString("roomPass", ""),
                    jsonObject.getDouble("roomWidthMul"),
                    jsonObject.getDouble("roomHeightMul"),
                    jsonObject.getDouble("adaptiveBubbleSize"),
                    jsonObject.getDouble("devicePixelRatio"),
                    client,
                    jsonObject.getString("address"),
                    jsonObject.getString("token"),
                    1.0,
                    sw,
                    NewJitsi.VIDEO_BANDWIDTH,
                    NewJitsi.AUDIO_BANDWIDTH,
                )
                roomConnected = true
            } catch (e: Exception) {
                debugP("AppModule Common.connectToLiveRoom exception", e)
            }
            // TODO: retrieve detailed data about connection/room instead of bool
            // so we can decide if we require mic permission this time
            val isSuccess = roomConnected && !AppManager.isDestroying

            debugP("AppModule websocketsConnect.complete", isSuccess)
            promise.resolve(isSuccess)
            if (!isSuccess) {
                RoomService.stop(reactApplicationContext)
                return@post
            }

            networkManager.startListening(reactApplicationContext)
            networkManager.listener = {
                if (it) debugP("notReachable")
                else debugP("reachable")
                AppManager.isOffline = it
            }
        }
    }

    override fun onStateChanged(newState: Long) {
        debugP("AppModule.onStateChanged", newState)
        sendEvent(Event.onRoomReconnecting, newState == /*LiveRoomStateConnecting*/0L)
        if (newState == /*LiveRoomStateConnecting*/0L) {
            AppManager.speakers.forEach {
                val userId = AppTrackStore.instance.mainParticipant?.endpoint
                if (it.key != userId) {
                    it.value.disableVideo()
                }
            }
        } else if (newState == /*LiveRoomStateConnected*/1L) {
            AppManager.shouldUpdateUserPositionOnState = true
        }
    }

    override fun onParticipantsVisibilityChanged(json: String?) = runOnMainThread {
        defaultScope.launch {
            debugP("onParticipantsVisibilityChanged", json)
            requireNotNull(json)
            val data = JSONObject(json)
            val shown = data.getJSONArray("shown").map(JSONArray::getString)
            val hidden = data.getJSONArray("hidden").map(JSONArray::getString)
            runOnMainThread {
                shown.forEach { AppManager.speakers[it]?.onShown() }
                hidden.forEach { AppManager.speakers[it]?.onHidden() }
            }
        }
    }

    @ReactMethod
    fun disconnectFromRoom(promise: Promise) {
        if (AppManager.isDestroying) {
            promise.resolve(true)
            return
        }
        client.isQuite = true
        AppManager.isDestroying = true
        debugP("AppModule disconnectFromRoom")
        queue.post {
            RoomService.stop(reactApplicationContext)
            networkManager.stop(reactApplicationContext)
            if (AppManager.room == null) {
                promise.resolve(true)
                return@post
            }
            client.onDestroy()
            debugP("AppModule disconnectFromRoom")
            AppManager.room?.disconnect()
            AppManager.room = null
            debugP("AppModule disconnectFromRoom complete")
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun isThereOtherAdmin(promise: Promise) {
        queue.post {
            promise.resolve(AppManager.room?.isThereOtherAdmin)
        }
    }

    @ReactMethod
    fun admins(promise: Promise) {
        AppManager.room?.let {
            queue.post {
                val jsonString = String(it.admins())
                promise.resolve(jsonString)
            }
        }
    }

    @ReactMethod
    fun hands(promise: Promise) {
        AppManager.room?.let {
            queue.post {
                val jsonString = String(it.hands())
                promise.resolve(jsonString)
            }
        }
    }

    @ReactMethod
    fun websocketsSendMessage(message: String) {
        if (client.isQuite) return
        AppManager.room?.sendMessage(message)
    }

    @ReactMethod
    fun sendAudioVideoState(isVideoEnabled: Boolean, isAudioEnabled: Boolean) {
        AppManager.room?.updateVideoAudioPhoneState(
            isVideoEnabled,
            isAudioEnabled,
            NewJitsiAndroidSpecific.isInCall
        )
    }


    @ReactMethod
    fun phoneState(state: String) {
        client.phoneState(state)
    }

    @ReactMethod
    fun toggleVideo(enable: Boolean) {
        runOnMainThread {
            val buttonsSet = AppManager.toggleVideoAudioButtonsSet
            if (enable) buttonsSet.enableVideo()
            else buttonsSet.disableVideo()
            AppManager.newJitsi?.setVideo(enable)
        }
    }

    @ReactMethod
    fun toggleAudio(enable: Boolean) {
        runOnMainThread {
            val buttonsSet = AppManager.toggleVideoAudioButtonsSet
            if (enable) buttonsSet.enableAudio()
            else buttonsSet.disableAudio()
        }
    }

    @ReactMethod
    fun switchCamera() {
        runOnMainThread {
            client.toggleUserCamera()
        }
    }

    @ReactMethod
    fun setDjMode(enabled: Boolean) {
        if (AppManager.isDestroying || client.useHighQualityInput == enabled) return
        debugP("AppModule set dj mode enabled:", enabled)
        client.useHighQualityInput = enabled
        if (!AppManager.isJitsiConnected) return
        //todo: reconnect jvbuster
    }

    override fun onMessage(json: String?) {
        val jsonMessage = json ?: return
        if (AppManager.isDestroying) {
            return
        }
        sendEvent(Event.onWebSocketMessage, jsonMessage)
    }

    override fun onReaction(json: ByteArray?) {
        if (AppManager.isDestroying) {
            return
        }
        AppManager.onReaction(json)
    }

    override fun onChangeRoomMode(mode: String?, isFirstConnection: Boolean) {
        sendEvent(Event.onChangeRoomMode, Arguments.createMap().apply {
            putString("mode", mode)
            putBoolean("isFirstConnection", isFirstConnection)
        })
    }

    override fun onPath(userId: String?, x: Double, y: Double, duration: Double) {
        val id = userId ?: return
        AppManager.moveUserOnUI(id, x, y, duration)
    }

    //{
    //  userId: {
    //    id: string,
    //    x: float,
    //    y: float,
    //    audioLevel: int,
    //    video: boolean,
    //    audio: boolean,
    //    avatar: string,
    //    isExpired: boolean,
    //    isAdmin: boolean,
    //    isOwner: boolean,
    //    isSpeaker: boolean,
    //    name: string,
    //    surname: string,
    //    reaction: string | ""
    //  }
    //}

    override fun onNativeState(json: ByteArray?) {
        if (AppManager.isDestroying) {
            return
        }
        AppManager.onNativeState(json)
    }

    override fun onPopupUsers(json: String?) {
        if (AppManager.isDestroying) {
            return
        }
        json ?: return
        ListenersPresenter.update(json)
    }

    override fun onConnectionState(state: ByteArray?) {
        AppManager.onConnectionState(state)
    }

    override fun onRadarVolume(state: ByteArray?) {
        AppTrackStore.instance.onRadarVolume(state)
    }

    @ReactMethod
    fun switchScreenShotMode(enable: Boolean, promise: Promise) {
        runOnMainThread {
            AppManager.speakers.forEach { (_, speaker) ->
                speaker.switchScreenShotMode(enable)
            }
            AppManager.shareScreenVideoView?.switchScreenShotMode(enable)
            promise.resolve(null)
        }
    }

    @ReactMethod
    fun preserveLogFile(promise: Promise) {
        GlobalScope.launch {
            Common.preserveLogFile(LogUtil.logsDirPath, LogUtil.PRESERVED_LOG_FILE_NAME)
            promise.resolve(null)
        }
    }

    fun onAnalyticsEvent(name: String, body: Map<String, String>? = null) {
        val arguments = Arguments.createMap()
        val bodyMap = Arguments.createMap()
        for (entry in body ?: emptyMap()) {
            bodyMap.putString(entry.key, entry.value)
        }
        arguments.putString("name", name)
        arguments.putMap("body", bodyMap)
        sendEvent(Event.analyticsEvent, arguments)
    }

    override fun onCatalystInstanceDestroy() {
        defaultScope.cancel()
    }
}

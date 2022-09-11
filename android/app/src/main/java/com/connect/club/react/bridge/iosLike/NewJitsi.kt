package com.connect.club.react.bridge.iosLike

import com.connect.club.BuildConfig
import com.connect.club.MainActivity
import com.connect.club.react.bridge.iosLike.ui.AppManager
import com.connect.club.utils.runOnMainThread
import com.sergeymild.event_dispatcher.EventDispatcher
import common.Common
import common.JvBusterDelegate
import common.JvbusterCallbacks
import common.JvbusterPeerConnectionCallbacks
import kotlinx.coroutines.*
import org.json.JSONObject
import org.webrtc.DataChannel
import org.webrtc.PeerConnection.*
import java.lang.ref.WeakReference
import java.nio.ByteBuffer
import java.util.*
import java.util.concurrent.Semaphore
import java.util.concurrent.TimeUnit

class NewJitsi : NewJitsiAndroidSpecific(), JvBusterDelegate, PeerConnectionDelegate, RTCDataChannelDelegate {

    var appModule by weak<AppModule?>()
    private val observation = MediaStatsObservation()

    private var videoWidth: Int = 0
    private var videoHeight: Int = 0
    private var fps: Int = 0

    private var screenSharingUserId: String? = null

    var isQuite = false
    var wasHandledPeerConnectionFailed = false

    init {
        AppManager.newJitsi = this
        EventDispatcher.register(this, true)
    }

    fun setParams(
            videoWidth: Int,
            videoHeight: Int,
            fps: Int,
            videoEnabled: Boolean,
            audioEnabled: Boolean
    ) {
        MainActivity.audioFocusManager.start()
        this.videoWidth = videoWidth
        this.videoHeight = videoHeight
        this.fps = fps
        this.beforeMuteVideoWasEnabled = videoEnabled
        this.beforeMuteAudioWasEnabled = audioEnabled
        initialize()
    }

    fun cleanup() {
        synchronized(AppManager.speakers) {
            isInitialized = false
            AppManager.isJitsiConnected = false
            debugP("NewJitsi cleanup")
            observation.stopUpdatingLocalAudioTrackLevel()

            if (screenSharingUserId != null) {
                AppManager.speakers[screenSharingUserId]?.hideScreenSharing()
            }
            for (speaker in AppManager.speakers) {
                speaker.value.disableVideo()
            }
            AppTrackStore.instance.clear()
            debugP("NewJitsi.cleanup 🚗 complete")
            AppManager.shareScreenVideoView?.disableVideo()
        }
    }

    fun onDestroy() {
        debugP("NewJitsi onDestroy")
        MainActivity.audioFocusManager.stop()
        cleanup()
    }

    override fun initializeRTCPeerConnection(
            userId: String?,
            id_: String?,
            isMain: Boolean,
            isSpeaker: Boolean,
            sdpOffer: String?,
            unused: JvbusterPeerConnectionCallbacks?
    ): String {
        if (AppManager.isDestroying) return ""
        userId ?: throw RuntimeException()
        val id = id_ ?: throw RuntimeException()
        debugP("NewJitsi onNewOffer", id)

        if (AppTrackStore.instance.peerConnections[id] == null) {
            debugP("NewJitsi createNewPeerConnection", id)
            val peerConnectionListener = PeerConnectionListener(id, this)

            val pc = PeerConnectionHolder(
                    id = id,
                    userId = userId,
                    isMain = isMain,
                    pc = peerFactory.createPeerConnection(peerConnectionListener),
                    pcListener = peerConnectionListener
            )
            peerConnectionListener.pc = pc.pc
            AppTrackStore.instance.peerConnections[id] = pc
            debugP("NewJitsi peerConnectionCreated", pc.pc.hashCode())
            AppTrackStore.instance.mainPeerConnection = pc

            if (isMain && isSpeaker) {
                val participant = RemoteParticipant(userId)
                AppTrackStore.instance.mainParticipant = participant

                setLocalMediaTracks(
                        context!!,
                        peerFactory.factory!!,
                        participant,
                        videoWidth,
                        videoHeight,
                        fps,
                        beforeMuteVideoWasEnabled,
                        beforeMuteAudioWasEnabled
                )
                debugP("NewJitsi setLocalMediaTracks", participant.videoTrack?.track.hashCode(), participant.audioTrack?.track.hashCode())

                if (participant.videoTrack == null || participant.audioTrack == null) {
                    throw RuntimeException()
                }
                val videoTrack = participant.videoTrack!!.track

                val audioTrack = participant.audioTrack!!.track
                videoTrack.setEnabled(beforeMuteVideoWasEnabled)
                audioTrack.setEnabled(beforeMuteAudioWasEnabled)

                participant.rtpSender = pc.pc.addTrack(videoTrack, listOf(userId))
                pc.pc.addTrack(audioTrack, listOf(userId))
                AppTrackStore.instance.participants[userId] = participant
                observation.getAudioLevel(pc.pc) {
                    AppManager.room?.updateAudioLevel(it)
                }
            }
        }

        if (sdpOffer == null || sdpOffer.isEmpty()) {
            debugP("sdpOffer = nil do nothing", id)
            return ""
        }

        val pc = AppTrackStore.instance.peerConnections[id]!!

        var createdSdp: String? = null
        if (AppManager.isDestroying) return ""
        val semaphore = Semaphore(0)
        debugP("NewJitsi startNegotiation", pc.pc.hashCode())
        if (AppManager.isDestroying) return ""
        pc.setRemote(sdpOffer) { error ->
            debugP("NewJitsi remoteGenerated", error ?: "noError")
            if (AppManager.isDestroying || error != null) {
                createdSdp = ""
                semaphore.release()
                onError("WebRTC setRemote")
                return@setRemote
            }
            pc.generateAnswer { err, sdp ->
                debugP("NewJitsi answerGenerated", err ?: "noError")
                if (AppManager.isDestroying || err != null) {
                    createdSdp = ""
                    semaphore.release()
                    onError("WebRTC generateAnswer")
                    return@generateAnswer
                }
                createdSdp = sdp
                semaphore.release()
            }
        }

        semaphore.tryAcquire(3, TimeUnit.SECONDS)
        debugP("NewJitsi complete onNewOffer", id, pc.hashCode())
        return createdSdp ?: ""
    }

    override fun destroyPeerConnections() {
        cleanup()
    }

    override fun init(p0: JvbusterCallbacks?) {}

    override fun setLocalRTCPeerConnectionDescription(id_: String?, description: String?) {
        val id = id_ ?: throw RuntimeException()
        description ?: throw RuntimeException()
        debugP("NewJitsi setLocalRTCPeerConnectionDescription", id)
        if (AppManager.isDestroying) return
        val pc = AppTrackStore.instance.peerConnections[id]
        if (pc == null) {
            debugP("NewJitsi setLocalRTCPeerConnectionDescription peerConnection not found", id)
            return
        }
        if (AppManager.isDestroying) return

        val semaphore = Semaphore(0)
        pc.setLocal(description) { error ->
            debugP("NewJitsi localGenerated", error
                    ?: "noError", "isDestroying", AppManager.isDestroying)
            semaphore.release()
        }
        semaphore.tryAcquire(3, TimeUnit.SECONDS)
        debugP("NewJitsi complete setLocalRTCPeerConnectionDescription", id)
    }

    override fun sendMessageToDataChannel(id_: String?, message: String?) {
        if (AppManager.isDestroying) return
        val id = id_ ?: throw RuntimeException()
        message ?: throw RuntimeException()

        if (id == "*") {
            for (entry in AppTrackStore.instance.peerConnections) {
                sendMessage(entry.value, message)
            }
        } else {
            val pc = AppTrackStore.instance.peerConnections[id] ?: return
            sendMessage(pc, message)
        }
    }

    private fun sendMessage(pc: PeerConnectionHolder, message: String) {
        val dataChannel = pc.dataChannel
        if (dataChannel?.state() == DataChannel.State.OPEN) {
            val buffer = DataChannel.Buffer(ByteBuffer.wrap(message.toByteArray()), false)
            dataChannel.send(buffer)
        }
    }

    override fun processMetaAdd(json: String?) {
        if (!AppManager.isJitsiConnected) {
            return debugP("NewJitsi processMetaAdd webrtcNotConnected")
        }
        debugP("NewJitsi processMetaAdd start AppManager.isDestroying", AppManager.isDestroying)
        json ?: return
        val jsonDict = JSONObject(json)
        if (BuildConfig.DEBUG) {
            debugLazy("NewJitsi processMetaAdd start keys") {
                jsonDict.keys().asSequence().toList().toString()
            }
            debugP("NewJitsi participants ", AppTrackStore.instance.participants.values)
            debugP("NewJitsi processMetaAdd ", json)
        }
        if (AppManager.isDestroying) return

        for (key in jsonDict.keys()) {
            val videosAudios = jsonDict.getJSONObject(key)
            val v = videosAudios.optString("video")
            val a = videosAudios.optString("audio")
            val videos = if (v.isEmpty()) null else v
            val audios = if (a.isEmpty()) null else a
            val remoteUserId = key


            var remoteUser = AppTrackStore.instance.participants[remoteUserId]
            if (remoteUser == null) {
                remoteUser = RemoteParticipant(remoteUserId)
                if (videos == null && audios == null) {
                    AppTrackStore.instance.participants[remoteUserId] = remoteUser
                    continue
                }
            }

            val tracks = AppTrackStore.instance.getPeerConnectionsTracks()
            if (AppManager.isDestroying) return

            if (videos != remoteUser.videoTrack?.track?.id()) {
                AppTrackStore.instance.participants[remoteUserId] = remoteUser
                var videoTrack: RTCMediaStreamTrack? = null
                if (tracks[videos] != null) videoTrack = tracks[videos]

                if (videoTrack != null) {
                    remoteUser.videoTrack = VideoTrack(videoTrack as RTCVideoTrack)
                } else {
                    debugP("||| delete ", remoteUserId, videoTrack?.id())
                    remoteUser.videoTrack = null
                }

                if (key.startsWith("screen-")) {
                    AppManager.shareScreenVideoView?.enableVideo(key)
                }
            }

            if (audios != remoteUser.audioTrack?.track?.id()) {
                var audioTrack: RTCMediaStreamTrack? = null
                if (tracks[audios] != null) audioTrack = tracks[audios]

                if (audioTrack != null) {
                    remoteUser.audioTrack = AudioTrack(audioTrack as RTCAudioTrack)
                } else {
                    remoteUser.audioTrack = null
                }
            }

            AppTrackStore.instance.participants[remoteUserId] = remoteUser

            if (key.startsWith("screen-")) {
                if (AppTrackStore.instance.screenShareTrack == null) {
                    remoteUser.audioTrack?.track?.setVolume(0.0)
                }
                AppTrackStore.instance.screenShareTrack = remoteUser
                val id = key.replace("screen-", "")
                AppManager.speakers[id]?.showScreenSharing()
                screenSharingUserId = id
            }
        }
        debugP("NewJitsi processMetaAdd complete")
    }

    override fun processMetaRemove(json: String?) {
        if (!AppManager.isJitsiConnected) {
            debugP("NewJitsi processMetaRemove webrtcNotConnected")
            return
        }
        debugP("NewJitsi processMetaRemove AppManager.isDestroying", AppManager.isDestroying)
        if (AppManager.isDestroying) return
        json ?: return
        val data = JSONObject(json)

        val participants = AppTrackStore.instance.participants
        val newParticipants = mutableMapOf<String, RemoteParticipant>()
        for (entry in participants) {
            // skip current user
            if (entry.value.endpoint == AppTrackStore.instance.mainParticipant?.endpoint) {
                newParticipants[entry.value.endpoint] = entry.value
                continue
            }

            val isDesktopShare = entry.key.startsWith("screen-")
            if (AppManager.isDestroying) return
            val speakerView = synchronized(AppManager.speakers) { AppManager.speakers[entry.key] }

            if (!data.has(entry.value.endpoint)) {
                speakerView?.disableVideo()
                debugP("||| processMetaRemove participant", entry.value.endpoint)
                if (isDesktopShare) {
                    AppManager.shareScreenVideoView?.disableVideo()
                    val id = entry.key.replace("screen-", "")
                    AppManager.speakers[id]?.hideScreenSharing()
                }
                continue
            }

            val media = data.getJSONObject(entry.value.endpoint) ?: continue
            val videoTrackId = media["video"]
            val audioTrackId = media["audio"]
            val videoTrack = entry.value.videoTrack?.track
            val audioTrack = entry.value.audioTrack?.track
            val localVideoId = videoTrack?.id() ?: ""
            val localAudioId = audioTrack?.id() ?: ""

            val videoWasChanged = localVideoId != videoTrackId
            val audioWasChanged = localAudioId != audioTrackId

            if (isDesktopShare && videoWasChanged) {
                AppTrackStore.instance.screenShareTrack = null
                AppManager.shareScreenVideoView?.disableVideo()
                val id = entry.key.replace("screen-", "")
                AppManager.speakers[id]?.hideScreenSharing()
                continue
            }

            if (!videoWasChanged && !audioWasChanged) {
                newParticipants[entry.key] = entry.value
            } else {
                speakerView?.disableVideo()
                debugP("||| processMetaRemove deleteVideo", entry.value.endpoint)
            }
        }

        AppTrackStore.instance.participants = newParticipants
    }


    // region PeerConnectionDelegate

    override fun dataChannelCreated(pc: RTCPeerConnection, dataChannel: RTCDataChannel) {
        for (pcHolder in AppTrackStore.instance.peerConnections.values) {
            if (pcHolder.pc === pc) {
                pcHolder.dataChannel = dataChannel
                pcHolder.dataChannel!!.registerObserver(AppDataChannelDelegate(WeakReference(this), WeakReference(dataChannel)))
            }
        }
    }


    override fun didChange(pc: RTCPeerConnection) {
        val state = pc.connectionState()
        debugP("|NewJitsi peerConnection didChange state", state, AppTrackStore.instance.mainPeerConnection?.pc.hashCode(), pc.hashCode())
        if (state == PeerConnectionState.CLOSED || state == PeerConnectionState.FAILED) {
            debugP("||| disconnected")
            AppManager.isJitsiConnected = false
        } else if (state == PeerConnectionState.CONNECTED) {
            AppManager.isJitsiConnected = true
            debugP("||| connected")
            val userId = AppTrackStore.instance.mainParticipant?.endpoint
            if (userId != null) {
                synchronized(AppManager.speakers) { AppManager.speakers[userId]?.enableVideo() }
            }
        }
        for (entry in AppTrackStore.instance.peerConnections) {
            if (entry.value.pc === pc) {
                debugP("NewJitsi peerConnection didChange state", entry.value.userId, entry.key, state)
                AppManager.room?.processPeerConnectionState(entry.key, state.ordinal.toLong())
                break
            }
        }

        if (AppTrackStore.instance.mainPeerConnection?.pc === pc) {
            if (state == PeerConnectionState.CONNECTED) {
                debugP("NewJitsi peerConnection didChange to connectedState")
                wasHandledPeerConnectionFailed = false
                if (beforeMuteVideoWasEnabled) AppTrackStore.instance.mainParticipant?.capturer?.startCapture()
            }
        }
    }

    //endregion

    // region RTCDataChannelDelegate
    override fun dataChannel(dataChannel: RTCDataChannel, buffer: RTCDataBuffer) {
        val data = buffer.data
        val bytes = ByteArray(data.remaining())
        data.get(bytes)
        var isFound = false
        for (entry in AppTrackStore.instance.peerConnections) {
            if (entry.value.dataChannel?.id() == dataChannel.id()) {
                isFound = true
                AppManager.room?.processDataChannelMessage(entry.key, String(bytes))
                break
            }
        }
        if (!isFound) {
            debugP("NewJitsi.dataChannel")
        }
    }

    //endregion

    override fun onError(error: String?) {
        val appModule = appModule ?: return
        AppManager.isJitsiConnected = false
        debugP("AppModule onError", error)
        if (error == "expired" || error == "WebSocketsReconnectAttemptsEnd") {
            debugP("AppModule error expired")
            appModule.sendEvent(Event.onError, "expired")
            return
        }
        if (isQuite) {
            appModule.sendEvent(Event.onError, "unknownError")
            return
        }

        if (!AppManager.isOffline) return appModule.sendEvent(Event.onError, error
                ?: "unknownError")
    }

    fun toggleUserCamera() {
        runOnMainThread {
            val participant = AppTrackStore.instance.mainParticipant ?: return@runOnMainThread
            val capturer = participant.capturer ?: return@runOnMainThread
            capturer.switch()
            AppManager.currentSpeaker?.mirror(capturer.shouldMirror)
        }
    }

    companion object {
        const val VIDEO_BANDWIDTH = 0L
        const val AUDIO_BANDWIDTH = 0L
    }
}

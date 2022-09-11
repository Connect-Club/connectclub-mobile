package com.connect.club.react.bridge.iosLike

import com.connect.club.react.bridge.iosLike.ui.AppManager
import com.connect.club.utils.forEach
import org.json.JSONArray
import org.json.JSONObject
import org.webrtc.PeerConnection
import org.webrtc.RtpReceiver

class AppTrackStore {
    companion object {
        val instance = AppTrackStore()
    }

    var isJitsiConnected = false
    var peerConnections = mutableMapOf<String, PeerConnectionHolder>()
    var mainPeerConnection: PeerConnectionHolder? = null
    var screenShareTrack: RemoteParticipant? = null
    var participants = mutableMapOf<String, RemoteParticipant>()
    var mainParticipant: RemoteParticipant? = null
    private val nativeGetReceiversMethod by lazy {
        RTCPeerConnection::class.java.getDeclaredMethod("nativeGetReceivers").also {
            it.isAccessible = true
        }
    }

    fun containsFailedPeers(): Bool {
        var isFailed = false
        for (value in instance.peerConnections.values) {
            if (!isFailed && value.pc.connectionState() == PeerConnection.PeerConnectionState.FAILED) {
                isFailed = true
                break
            }
        }
        return isFailed
    }

    fun getPeerConnectionsTracks(): Map<String, RTCMediaStreamTrack> {
        val tracks = mutableMapOf<String, RTCMediaStreamTrack>()
        for (peerConnection in peerConnections.values) {
            val receivers = nativeGetReceiversMethod.invoke(peerConnection.pc) as List<RtpReceiver>
            receivers.forEach {
                val track = it.track()
                if (track != null) tracks[track.id()] = track
            }
        }
        return tracks
    }

    fun clear() {
        debugP("AppTrackStore clear start")
        mainParticipant?.destroy()
        mainPeerConnection = null
        isJitsiConnected = false
        val iterator = peerConnections.values.toList()
        iterator.forEach {
            try {
                it.dataChannel?.unregisterObserver()
                it.dataChannel?.dispose()
                it.dataChannel = null
                it.pc.dispose()
            } catch (e: Exception) {
                debugP("AppTrackStore error dispose", e)
            }
        }
        peerConnections.clear()
        participants.clear()
        debugP("AppTrackStore clear complete")
    }

    fun participantIds(): List<String> {
        return participants.keys.toList()
    }

    fun onRadarVolume(json: ByteArray?) {
        json ?: return
        val string = String(json)
        val j = JSONObject(string)
        debugP("onRadarVolume:", string)
        val screenVolume = j.getDouble("screenVolume")
        if (instance.screenShareTrack != null) {
            instance.screenShareTrack?.audioTrack?.track?.setVolume(screenVolume)
        }
        if (j.has("isSubscriber") && j.getBoolean("isSubscriber")) {
            AppManager.radarView?.flick()
        }
        j.getJSONArray("radarVolume").forEach { state ->
            val id = state.getString("id")
            participants[id]?.let {
                val newVolume = state.getDouble("volume")
                val track = it.audioTrack?.track
                if (it.audioTrack?.isEnabled == true) {
                    track?.setVolume(newVolume)
                }
            }
        }
    }
}
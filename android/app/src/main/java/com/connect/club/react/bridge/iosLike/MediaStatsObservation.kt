package com.connect.club.react.bridge.iosLike

import kotlinx.coroutines.*
import org.webrtc.RTCStatsReport


private const val AUDIO_SOURCE_STATS_PREFIX = "RTCAudioSource"
private const val AUDIO_LEVEL_STATS_KEY = "audioLevel"
private const val MAX_VALUE = 32767

private fun RTCStatsReport.findAudioLevel(): Double? =
        statsMap.entries
                .find { it.key.startsWith(AUDIO_SOURCE_STATS_PREFIX) && it.value.members.containsKey(AUDIO_LEVEL_STATS_KEY) }
                ?.let { (_, stats) -> (stats.members[AUDIO_LEVEL_STATS_KEY] as? Double) }

class MediaStatsObservation {
    private var job: Job? = null

    fun stopUpdatingLocalAudioTrackLevel() {
        job?.cancel()
    }

    fun getAudioLevel(pc: RTCPeerConnection, completion: (Long) -> Unit) {
        job = GlobalScope.launch {
            while (isActive) {
                pc.getStats {
                    val level = it.findAudioLevel() ?: 0.0
                    val audio = if (level > 0) (level * MAX_VALUE).toLong() else 0
                    completion(audio)
                }
                delay(1000)
            }
        }
    }
}
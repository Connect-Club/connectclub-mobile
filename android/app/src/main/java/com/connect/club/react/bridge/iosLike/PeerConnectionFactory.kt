package com.connect.club.react.bridge.iosLike

import android.content.Context
import android.os.Build
import android.util.Log
import com.connect.club.jitsiclient.MagicWebRTCUtils
import org.webrtc.*
import org.webrtc.PeerConnectionFactory
import org.webrtc.audio.JavaAudioDeviceModule
import org.webrtc.voiceengine.WebRtcAudioManager
import org.webrtc.voiceengine.WebRtcAudioUtils

private val ICE_SERVERS =
    listOf(PeerConnection.IceServer.builder("stun:stun.l.google.com:19302").createIceServer())

fun createPeerConnectionConfiguration(): PeerConnection.RTCConfiguration =
    PeerConnection.RTCConfiguration(ICE_SERVERS).apply {
        keyType = PeerConnection.KeyType.ECDSA
        enableDtlsSrtp = true
        sdpSemantics = PeerConnection.SdpSemantics.UNIFIED_PLAN
    }

//for setInjectableLogger. See below
@Suppress("unused")
fun convertWebRtcSeverityToLogPriority(severity: Logging.Severity): Int {
    return when (severity) {
        Logging.Severity.LS_VERBOSE -> Log.VERBOSE
        Logging.Severity.LS_INFO -> Log.INFO
        Logging.Severity.LS_WARNING -> Log.WARN
        Logging.Severity.LS_ERROR -> Log.ERROR
        Logging.Severity.LS_NONE -> Log.ASSERT
    }
}

enum class VideoMode(val description: String) {
    SOFTWARE("SOFTWARE"),
    HARDWARE("HARDWARE");
}

val eglBase: EglBase = EglBase.create()

class PeerConnectionFactory {

    var useHighQualityInput: Boolean = false
    var factory: PeerConnectionFactory? = null

    fun createPeerConnection(listener: PeerConnectionListener): PeerConnection {
        return factory!!.createPeerConnection(createPeerConnectionConfiguration(), listener)!!
    }

    fun setContext(context: Context) {
        factory = createPeerConnectionFactory(context, VideoMode.SOFTWARE)
    }

    fun dispose() {
        factory?.dispose()
    }

    fun createPeerConnectionFactory(
        context: Context,
        videoMode: VideoMode,
    ): PeerConnectionFactory {
        WebRtcAudioUtils.setWebRtcBasedAcousticEchoCanceler(!useHighQualityInput)
        WebRtcAudioUtils.setWebRtcBasedAutomaticGainControl(!useHighQualityInput)
        WebRtcAudioUtils.setWebRtcBasedNoiseSuppressor(!useHighQualityInput)
        WebRtcAudioManager.setBlacklistDeviceForOpenSLESUsage(
            !MagicWebRTCUtils.OPEN_SL_ES_WHITELIST.contains(
                Build.MODEL
            )
        )

        PeerConnectionFactory.initialize(
            PeerConnectionFactory.InitializationOptions
                .builder(context)
                .setFieldTrials("WebRTC-LegacySimulcastLayerLimit/Disabled/")
                //.setInjectableLogger({message, severity, tag -> Log.println(convertWebRtcSeverityToLogPriority(severity), tag, message)}, Logging.Severity.LS_INFO)
                .createInitializationOptions()
        )
        val eglBaseContext = eglBase.eglBaseContext
        val builder = PeerConnectionFactory.builder()
            .apply {
                when (videoMode) {
                    VideoMode.HARDWARE -> {
                        setVideoDecoderFactory(DefaultVideoDecoderFactory(eglBaseContext))
                        setVideoEncoderFactory(
                            DefaultVideoEncoderFactory(
                                eglBaseContext,
                                true,
                                false
                            )
                        )
                    }
                    VideoMode.SOFTWARE -> {
                        setVideoDecoderFactory(SoftwareVideoDecoderFactory())
                        setVideoEncoderFactory(SoftwareVideoEncoderFactory())
                    }
                }
            }
            .setOptions(PeerConnectionFactory.Options().apply {
                disableEncryption = false
                disableNetworkMonitor = true
            })

        if (useHighQualityInput) {
            builder.setAudioDeviceModule(
                JavaAudioDeviceModule.builder(context)
                    .setInputSampleRate(48000)
                    .setUseStereoInput(true)
                    .setUseHardwareNoiseSuppressor(false)
                    .setUseHardwareAcousticEchoCanceler(false)
                    .createAudioDeviceModule()
            )
        } else {
            val useHardwareAcousticEchoCanceler = !MagicWebRTCUtils.HARDWARE_AEC_BLACKLIST.contains(Build.MODEL)
            builder.setAudioDeviceModule(
                JavaAudioDeviceModule.builder(context)
                    .setUseHardwareAcousticEchoCanceler(useHardwareAcousticEchoCanceler)
                    .createAudioDeviceModule()
            )
        }

        return builder.createPeerConnectionFactory()
    }
}
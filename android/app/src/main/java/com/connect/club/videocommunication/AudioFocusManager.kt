package com.connect.club.videocommunication

import android.app.Activity
import android.content.Context
import android.media.AudioManager
import android.util.Log
import com.connect.club.BuildConfig
import com.connect.club.react.AppInfoModule
import com.connect.club.react.bridge.iosLike.debugP
import com.connect.club.utils.runOnMainThread
import com.tinder.StateMachine
import com.twilio.audioswitch.AudioDevice
import com.twilio.audioswitch.AudioSwitch
import java.lang.ref.WeakReference
private object SwitchChecker {

    private const val MAX_DEVICE_RESET_COUNT = 10
    private const val DEVICE_RESET_DELAY = 2000

    private var lastDevice: String? = null
    private var lastSetDeviceTime: Long = 0L
    private var lastSetDeviceResetCount: Int = 0
    private var badDevices: MutableSet<String> = mutableSetOf()

    fun checkSwitch(newDevice: String?): Boolean =
        newDevice == null || newDevice !in badDevices

    fun switchRequested(newDevice: String?) {
        if (newDevice?.contains("watch", ignoreCase = true) == true) {
            debugP("ignored audio output device", newDevice)
            badDevices.add(newDevice)
            return
        }
        if (lastDevice == newDevice && lastSetDeviceTime != 0L && System.currentTimeMillis() - lastSetDeviceTime < DEVICE_RESET_DELAY) {
            lastSetDeviceResetCount++
            if (lastSetDeviceResetCount > MAX_DEVICE_RESET_COUNT) {
                newDevice?.let {
                    badDevices.add(it)
                }
            }
        } else {
            lastDevice = newDevice
            lastSetDeviceResetCount = 1
        }
        lastSetDeviceTime = System.currentTimeMillis()
    }
}

interface AudioEventListener {

    enum class AudioEvent { INCOMING_CALL, INCOMING_NOTIFICATION, FOREVER_FOCUS_LOSS, FOCUS_RETURN }

    fun onAudioEvent(e: AudioEvent)
}

class AudioFocusManager(activity: Activity) : AudioManager.OnAudioFocusChangeListener, AudioEventListener {

    data class AudioSettings(
        val audioStream: Int,
        val audioMode: Int
    )

    private val stateMachine = StateMachineFactory.create()

    private var initialAudioSettings: AudioSettings? = null
    private var audioEventListener: AudioEventListener? = null

    private val audioManager = activity.getSystemService(Context.AUDIO_SERVICE) as AudioManager
    private val ownerActivity = WeakReference(activity)
    private var audioDeviceSwitch: AudioSwitch? = null

    fun start() {
        runOnMainThread { handleEvent(StateMachineFactory.Event.OnPlayEvent(this)) }
    }

    fun pause() {
        runOnMainThread { handleEvent(StateMachineFactory.Event.OnPauseEvent) }
    }

    fun stop() {
        runOnMainThread { handleEvent(StateMachineFactory.Event.OnStopEvent) }
    }

    override fun onAudioFocusChange(focusChange: Int) {
        debugP("audio focus change: ", focusChange)
        val event = when (focusChange) {
            AudioManager.AUDIOFOCUS_LOSS_TRANSIENT -> AudioEventListener.AudioEvent.INCOMING_CALL
            AudioManager.AUDIOFOCUS_LOSS_TRANSIENT_CAN_DUCK -> AudioEventListener.AudioEvent.INCOMING_NOTIFICATION
            AudioManager.AUDIOFOCUS_LOSS -> AudioEventListener.AudioEvent.FOREVER_FOCUS_LOSS
            AudioManager.AUDIOFOCUS_GAIN -> AudioEventListener.AudioEvent.FOCUS_RETURN
            else -> null
        }
        event?.let {
            audioEventListener?.onAudioEvent(it)
        }
    }

    private fun handleEvent(event: StateMachineFactory.Event) {
        val transition = stateMachine.transition(event) as? StateMachine.Transition.Valid
        transition?.let {
            when (val sideEffect = it.sideEffect) {
                is StateMachineFactory.SideEffect.PlayAudioEffect -> {
                    if (it.fromState == StateMachineFactory.State.Idle) {
                        saveInitialAudioSettings()
                        audioEventListener = sideEffect.audioEventListener
                        audioDeviceSwitch = ownerActivity.get()?.applicationContext?.let { context ->
                            createAudioDeviceSwitch(context)
                        }
                        audioDeviceSwitch!!.start(::handleDevicesChange)
                        audioDeviceSwitch!!.activate()
                    }
                    changeAudioSettings()
                    handleDevicesChange(
                        audioDevices = audioDeviceSwitch!!.availableAudioDevices,
                        currentDevice = audioDeviceSwitch!!.selectedAudioDevice
                    )
                }
                StateMachineFactory.SideEffect.PauseAudioEffect -> {
                    restoreInitialAudioSettings()
                }
                StateMachineFactory.SideEffect.StopAudioEffect -> {
                    if (it.fromState == StateMachineFactory.State.Playing) {
                        restoreInitialAudioSettings()
                    }
                    audioDeviceSwitch?.stop()
                    audioDeviceSwitch = null
                    audioEventListener = null
                }
                null -> {
                }
            }
        }
    }

    private fun createAudioDeviceSwitch(context: Context) =
        AudioSwitch(
            context = context,
            loggingEnabled = true,
            audioFocusChangeListener = this
        )

    private fun handleDevicesChange(audioDevices: List<AudioDevice>, currentDevice: AudioDevice?) {
        val newPriorityDevice = getPriorityOutput(audioDevices)
        debugP("AS/Me", "handleDevicesChange; current device", currentDevice)
        if (newPriorityDevice != currentDevice) {
            debugP("AS/Me", "handleDevicesChange; priority device", newPriorityDevice)
            SwitchChecker.switchRequested(newPriorityDevice?.name)
            audioDeviceSwitch?.selectDevice(newPriorityDevice)
        }
    }

    private fun getPriorityOutput(devices: List<AudioDevice>): AudioDevice? {
        return devices.find { it is AudioDevice.WiredHeadset && SwitchChecker.checkSwitch(it.name) }
            ?: devices.find { it is AudioDevice.BluetoothHeadset && SwitchChecker.checkSwitch(it.name) }
            ?: devices.find { it is AudioDevice.Speakerphone && SwitchChecker.checkSwitch(it.name) }
            ?: devices.find { it is AudioDevice.Earpiece && SwitchChecker.checkSwitch(it.name) }
            ?: audioDeviceSwitch?.selectedAudioDevice
    }

    private fun changeAudioSettings() {
        ownerActivity.get()?.volumeControlStream =
            if (AppInfoModule.instance.isHostApp) AudioManager.STREAM_MUSIC else AudioManager.STREAM_VOICE_CALL
        audioManager.mode = AudioManager.MODE_IN_COMMUNICATION
    }

    private fun saveInitialAudioSettings() {
        initialAudioSettings = AudioSettings(
            audioStream = ownerActivity.get()?.volumeControlStream ?: AudioManager.USE_DEFAULT_STREAM_TYPE,
            audioMode = audioManager.mode
        )
    }

    private fun restoreInitialAudioSettings() {
        initialAudioSettings?.let {
            ownerActivity.get()?.volumeControlStream = it.audioStream
            audioManager.mode = it.audioMode
        }
    }

    override fun onAudioEvent(e: AudioEventListener.AudioEvent) {
        when (e) {
            AudioEventListener.AudioEvent.INCOMING_CALL -> {
                pause()
            }
            AudioEventListener.AudioEvent.INCOMING_NOTIFICATION -> Unit
            AudioEventListener.AudioEvent.FOREVER_FOCUS_LOSS -> {
                stop()
            }
            AudioEventListener.AudioEvent.FOCUS_RETURN -> {
                start()
            }
        }
    }
}

internal object StateMachineFactory {

    sealed class State {
        object Idle : State()
        object Playing : State()
        object Paused : State()
    }

    sealed class Event {
        data class OnPlayEvent(
            val audioEventListener: AudioEventListener
        ) : Event()
        object OnPauseEvent : Event()
        object OnStopEvent : Event()
    }

    sealed class SideEffect {
        data class PlayAudioEffect(
            val audioEventListener: AudioEventListener?
        ) : SideEffect()
        object PauseAudioEffect : SideEffect()
        object StopAudioEffect : SideEffect()
    }

    fun create(): StateMachine<State, Event, SideEffect> = StateMachine.create {

        initialState(State.Idle)

        state<State.Idle> {
            on<Event.OnPlayEvent> {
                transitionTo(State.Playing, SideEffect.PlayAudioEffect(it.audioEventListener))
            }
        }
        state<State.Playing> {
            on<Event.OnPauseEvent> {
                transitionTo(State.Paused, SideEffect.PauseAudioEffect)
            }
            on<Event.OnStopEvent> {
                transitionTo(State.Idle, SideEffect.StopAudioEffect)
            }
        }
        state<State.Paused> {
            on<Event.OnPlayEvent> {
                transitionTo(State.Playing, SideEffect.PlayAudioEffect(it.audioEventListener))
            }
            on<Event.OnStopEvent> {
                transitionTo(State.Idle, SideEffect.StopAudioEffect)
            }
        }
    }
}

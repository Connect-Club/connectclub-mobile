package com.connect.club.react.bridge.iosLike

import android.content.Context
import android.graphics.ImageFormat
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import com.connect.club.react.bridge.iosLike.Direction.BACK
import com.connect.club.react.bridge.iosLike.Direction.FRONT
import com.connect.club.react.bridge.iosLike.webrtc.FakeVideoCapturer
import org.webrtc.*
import org.webrtc.PeerConnectionFactory
import kotlin.math.min


fun setLocalMediaTracks(
    context: Context,
    peerFactory: PeerConnectionFactory,
    user: RemoteParticipant,
    videoWidth: Int,
    videoHeight: Int,
    fps: Int,
    videoEnabled: Bool,
    audioEnabled: Bool
) {
    setLocalMediaVideoTrack(context, peerFactory, user, videoWidth, videoHeight, fps, videoEnabled, FRONT)
    user.audioTrack = AudioTrack(peerFactory.createAudioTrack(user.endpoint, peerFactory.createAudioSource(MediaConstraints())))
    if (user.videoTrack == null || user.audioTrack == null) throw RuntimeException()
    user.audioTrack?.isEnabled = audioEnabled
}

fun setLocalMediaVideoTrack(
    context: Context,
    peerFactory: PeerConnectionFactory,
    user: RemoteParticipant,
    videoWidth: Int,
    videoHeight: Int,
    fps: Int,
    videoEnabled: Bool,
    direction: Direction
) {
    val frameSide = getAvailableSize(context, min(videoWidth, videoHeight), direction)
    debugP("setLocalMediaTracks size: $frameSide")

    val surface = SurfaceTextureHelper.create("WebRTC-SurfaceTextureHelper", eglBase.eglBaseContext)

    val (video, fakeCapturer, cameraCapturer, enumerator) = localVideoTrackAndCapturer(
        context,
        surface,
        peerFactory,
        user.endpoint,
        frameSide,
        fps,
        direction
    )
    user.videoTrack = VideoTrack(video)
    user.capturer = LocalVideoCapturer(fakeCapturer, cameraCapturer, enumerator, frameSide, fps, surface, direction)
    user.videoTrack?.isEnabled = videoEnabled
}

enum class Direction {
    FRONT, BACK
}

data class LocalCapturerObjects(
    val videoTrack: org.webrtc.VideoTrack,
    val fakeCapturer: FakeVideoCapturer,
    val cameraCapturer: CameraVideoCapturer,
    val cameraEnumerator: CameraEnumerator
)

fun localVideoTrackAndCapturer(
    context: Context,
    surface: SurfaceTextureHelper,
    peerFactory: PeerConnectionFactory,
    id: String,
    frameSide: Int,
    fps: Int,
    direction: Direction
): LocalCapturerObjects {
    val videoSource = peerFactory.createVideoSource(false)
    videoSource.adaptOutputFormat(frameSide, frameSide, frameSide, frameSide, fps)

    val enumerator = getCameraEnumerator(context)

    debugP("localVideoTrackAndCapturer enumerator", enumerator)
    val cameraCapturer: CameraVideoCapturer = createVideoCapturer(enumerator, direction)!!
    cameraCapturer.initialize(surface, context, videoSource.capturerObserver)
    debugP("localVideoTrackAndCapturer cameraCapturer", cameraCapturer)

    val fakeCapturer = FakeVideoCapturer()
    fakeCapturer.initialize(surface, context, videoSource.capturerObserver)

    val videoTrack = peerFactory.createVideoTrack(id, videoSource)

    return LocalCapturerObjects(videoTrack, fakeCapturer, cameraCapturer, enumerator)
}

fun createVideoCapturer(enumerator: CameraEnumerator, direction: Direction): CameraVideoCapturer? {
    val deviceNames = enumerator.deviceNames
    for (deviceName in deviceNames) {
        if (direction === FRONT && enumerator.isFrontFacing(deviceName)) {
            return enumerator.createCapturer(deviceName, null)
        }

        if (direction === BACK && enumerator.isBackFacing(deviceName)) {
            return enumerator.createCapturer(deviceName, null)
        }
    }
    return null
}

private fun getCameraEnumerator(context: Context): CameraEnumerator {
    var camera2EnumeratorIsSupported = false
    camera2EnumeratorIsSupported = Camera2Enumerator.isSupported(context)
    return if (camera2EnumeratorIsSupported) Camera2Enumerator(context) else Camera1Enumerator(true)
}

fun getCameraName(enumerator: CameraEnumerator, direction: Direction): String? {
    val deviceNames = enumerator.deviceNames
    for (deviceName in deviceNames) {
        if (direction === FRONT && enumerator.isFrontFacing(deviceName)) {
            return deviceName
        }

        if (direction === BACK && enumerator.isBackFacing(deviceName)) {
            return deviceName
        }
    }
    return null
}

fun getAvailableSize(context: Context, preferred: Int, direction: Direction): Int {
    try {
        val enumerator = getCameraEnumerator(context)
        val cameraName = getCameraName(enumerator, direction) ?: return preferred
        val mCameraManager = context.getSystemService(Context.CAMERA_SERVICE) as CameraManager?
        val cameraCharacteristics = mCameraManager?.getCameraCharacteristics(cameraName)
        val get = cameraCharacteristics?.get(CameraCharacteristics.SCALER_STREAM_CONFIGURATION_MAP)
        val outputSizes = get?.getOutputSizes(ImageFormat.JPEG) ?: return preferred
        if (outputSizes.isEmpty()) return preferred
        val reversed = outputSizes.sortedByDescending { it.width }.reversed()
        for (size in reversed) {
            if (size.width == preferred || size.height == preferred) {
                return min(size.width, size.height)
            }
        }

        for (size in reversed) {
            if (size.width > preferred) return min(size.width, size.height)
        }
        return preferred
    } catch (e: Throwable) {
        return preferred
    }
}


class LocalVideoCapturer(
    internal val fakeCapturer: FakeVideoCapturer,
    internal val cameraCapturer: RTCCameraVideoCapturer,
    internal val cameraEnumerator: CameraEnumerator,
    private val frameSide: Int,
    private val fps: Int,
    private var surface: SurfaceTextureHelper?,
    var direction: Direction
) {
//    init {
//        fakeCapturer.startCapture(frameSide, frameSide, fps/2)
//    }

    fun stopCapture() {
        debugP("LocalVideoCapturer stopCapture")
        cameraCapturer.stopCapture()
//        fakeCapturer.startCapture(frameSide, frameSide, fps/2)
    }

    fun startCapture() {
        debugP("LocalVideoCapturer startCapture")
//        fakeCapturer.stopCapture()
        cameraCapturer.startCapture(frameSide, frameSide, fps)
    }

    fun switch() {
        try {
            val nextDirection = if (direction === FRONT) BACK else FRONT
            val nextCameraName =
                if (nextDirection === FRONT) findFrontCameraName() else findBackCameraName()
                    ?: return
            cameraCapturer.switchCamera(null, nextCameraName)
            direction = nextDirection
        } catch (e: Exception) {
            /* no-op */
        }
    }

    private fun findFrontCameraName(): String? =
        cameraEnumerator.deviceNames.find(cameraEnumerator::isFrontFacing)

    private fun findBackCameraName(): String? =
        cameraEnumerator.deviceNames.find(cameraEnumerator::isBackFacing)

    fun destroy() {
        debugP("LocalVideoCapturer destroy")
        cameraCapturer.stopCapture()
        cameraCapturer.dispose()
        //fakeCapturer.stopCapture()
        fakeCapturer.dispose()
        surface?.stopListening()
        surface?.dispose()
        surface = null
    }

    val shouldMirror: Boolean
        get() = direction == FRONT
}

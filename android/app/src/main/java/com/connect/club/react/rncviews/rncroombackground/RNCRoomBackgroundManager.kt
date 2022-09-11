package com.connect.club.react.rncviews.rncroombackground

import android.content.Context
import android.content.SharedPreferences
import android.util.Size
import android.view.View
import androidx.annotation.RawRes
import com.connect.club.R
import com.connect.club.react.bridge.iosLike.debugP
import com.connect.club.react.bridge.iosLike.weak
import com.facebook.react.common.MapBuilder
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.views.view.ReactViewGroup
import com.facebook.react.views.view.ReactViewManager
import kotlin.math.floor

class RNCRoomBackgroundManager : ReactViewManager(), View.OnAttachStateChangeListener, RoomBackgroundPresenter {

    private var state = State()
    private lateinit var prefs: SharedPreferences
    private var maxImageSize: Size
        get() = Size.parseSize(prefs.getString(KEY_MAX_IMG_SIZE, "0x0"))
        set(value) = prefs.edit().putString(KEY_MAX_IMG_SIZE, value.toString()).apply()
    private val onMaxImageSizeComputed = { w: Int, h: Int ->
        maxImageSize = Size(w, h)
        debugP("max image size: %d,%d", w, h)
        applyComputedMaxImageSize(state)
    }
    private var viewRef by weak<RNCRoomBackgroundView?>()

    override fun getName(): String = "RNCRoomBackground"

    @ReactProp(name = "bgSize")
    fun setBgSize(view: RNCRoomBackgroundView, bgSize: String?) = view.post {
        debugP("bg size %s", bgSize)
        val size = if (bgSize.isNullOrEmpty()) {
            Size(0, 0)
        } else {
            val split = bgSize.split(",")
            Size(split[0].toFloat().toInt(), split[1].toFloat().toInt())
        }
        state = state.copy(originSize = size)
        if (maxImageSize.width > 0) {
            applyComputedMaxImageSize(state)
            return@post
        }
        debugP("will compute max image memory size")
        view.computeMaxBitmapSize(onMaxImageSizeComputed)
    }

    @ReactProp(name = "imageSource")
    fun setImageSource(view: RNCRoomBackgroundView, imageSource: String?) = view.post {
        debugP("source %s", imageSource)
        state = state.copy(
            source = imageSource.orEmpty(),
            resId = getRawImageId(imageSource)
        )
        render(view)
    }

    private fun applyComputedMaxImageSize(state: State) {
        require(state.originSize.width > 0 && state.originSize.height > 0)
        this.state = state.copy(scaledSize = getScaledSize(state.originSize, maxImageSize))
        viewRef?.let { render(it) }
    }

    private fun render(view: RNCRoomBackgroundView) {
        if (!view.isAttachedToWindow ||
            state.scaledSize.width <= 0 ||
            state.scaledSize.height <= 0 ||
            state.source.isEmpty()
        ) return
        view.render(state.source, state.scaledSize, state.resId)
    }

    override fun createViewInstance(reactContext: ThemedReactContext): ReactViewGroup {
        prefs = reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().putString(KEY_MAX_IMG_SIZE, "0x0").apply()

        return RNCRoomBackgroundView(reactContext).also {
            it.addOnAttachStateChangeListener(this)
            it.init(this)
            viewRef = it
        }
    }

    override fun onDropViewInstance(view: ReactViewGroup) {
        super.onDropViewInstance(view)
        viewRef = null
        view.removeOnAttachStateChangeListener(this)
    }

    override fun onViewAttachedToWindow(v: View) {
        render(v as RNCRoomBackgroundView)
    }

    override fun onViewDetachedFromWindow(v: View) {
    }

    private data class State(
        val originSize: Size = Size(0, 0),
        val scaledSize: Size = Size(0, 0),
        val source: String = "",
        @RawRes
        val resId: Int = 0,
    )

    companion object {
        private const val PREFS_NAME = "bg_prefs"
        private const val KEY_MAX_IMG_SIZE = "max_img_size"

        private val broadcastingNames = mapOf(
            // Regular
            "7e88f8b3-16ed-4290-a2dd-b39feba03f15" to R.raw.pub, // prod
            "45f80f11-832c-47dc-9e48-4b9776de5fae" to R.raw.pub, // stage
            // Large
            "1d2e56b0-d28c-4aff-be3f-3f89da8abdad" to R.raw.large_public, // prod
            "021da593-e6f0-46d6-b610-b0afb03304a4" to R.raw.large_public, // stage
        )
        private val networkingNames = mapOf(
            // Regular
            "85705527-a525-4304-8853-567a2eaddff8" to R.raw.networking, // prod
            "f9ecedc9-cefe-4174-b1ae-60258c4f955c" to R.raw.networking, // stage
            // Small
            "117d7c9a-5c66-4a39-a73f-8a5070e4be54" to R.raw.small_networking, // prod
            "314009d4-fed1-4375-b865-e0816ca2f1b5" to R.raw.small_networking, // stage
        )
        private val artGalleryNames = mapOf(
            // Regular
            "df19fd7d-683c-48c0-9673-7c3dc93c386e" to R.raw.art_gallery, // prod
            "36b9dc26-1bf0-4be2-a494-a44b42026dfd" to R.raw.art_gallery, // stage
        )
        private val multiroomNames = mapOf(
            // Regular
            "929bac50-8278-48d7-9b33-770dcaa53ac3" to R.raw.multiroom, // prod
            "1c387701-9e37-431a-8002-94636fe72b4f" to R.raw.multiroom, // stage
        )

        private fun getScaledSize(size: Size, maxSize: Size): Size {
            if (size.width <= maxSize.width && size.height <= maxSize.height) return size
            val wScale = maxSize.width / size.width.toFloat()
            val hScale = maxSize.height / size.height.toFloat()
            val scale = minOf(wScale, hScale)
            return Size(floor(size.width * scale).toInt(), floor(size.height * scale).toInt())
        }

        @RawRes
        private fun getRawImageId(imageSource: String?): Int {
            val separatorIndex = imageSource?.lastIndexOf('/') ?: return 0
            if (separatorIndex < 0 || separatorIndex == imageSource.length - 1) return 0
            val extIndex = imageSource.lastIndexOf('.')
            if (extIndex < 0 || extIndex == separatorIndex) return 0

            val imageId = imageSource.substring(separatorIndex + 1, extIndex)
            var resId = broadcastingNames[imageId] ?: 0
            if (resId == 0) {
                resId = networkingNames[imageId] ?: 0
            }
            if (resId == 0) {
                resId = artGalleryNames[imageId] ?: 0
            }
            if (resId == 0) {
                return multiroomNames[imageId] ?: 0
            }
            return resId
        }
    }

    override fun onImageLoadFailed() {
        viewRef?.postDelayed(
            {
                viewRef?.let {
                    debugP("retry room background load")
                    render(it)
                }
            }, 2000L
        )
    }

    override fun getExportedCustomBubblingEventTypeConstants(): Map<String, Any> {
        return MapBuilder.builder<String, Any>()
            .put(
                "onBackgroundLoaded",
                MapBuilder.of<String, Any>("phasedRegistrationNames", MapBuilder.of("bubbled", "onBackgroundLoaded"))
            )
            .build()
    }
}

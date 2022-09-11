package com.connect.club.react.rncviews.rncroomlayout

import android.annotation.SuppressLint
import android.content.Context
import android.util.AttributeSet
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.widget.FrameLayout
import com.connect.club.react.bridge.iosLike.debugP
import com.connect.club.react.bridge.iosLike.ui.AppManager
import com.connect.club.react.rncviews.rnutils.ReactHelper
import com.connect.club.view.ClickListener
import com.otaliastudios.zoom.ZoomApi
import com.otaliastudios.zoom.ZoomLayout
import kotlin.math.roundToInt

data class Options(
    val width: Float,
    val height: Float,
    val multiplier: Float,
    val minZoom: Float,
    val maxZoom: Float,
)

@SuppressLint("ClickableViewAccessibility")
class RNCRoomLayout @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
) : ZoomLayout(context, attrs), RoomScene {

    private val reactHelper = ReactHelper(this)
    private var containerLayout = FrameLayout(context)
    private var badgesViewGroup = FrameLayout(context).also { it.clipChildren = false }
    private var reactionsViewGroup = FrameLayout(context).also { it.clipChildren = false }
    private var roomWidth = 0
    private var roomHeight = 0
    private val viewportUpdateListener = ViewportUpdateListener()

    override val badgesContainer: ViewGroup
        get() = badgesViewGroup

    override val reactionsContainer: ViewGroup
        get() = reactionsViewGroup

    private var multiplier = 0F

    private var bgImage: View? = null

    init {
        isClickable = true
        clipChildren = false
        clipToPadding = false
        setHasClickableChildren(hasClickableChildren = true)
        setOverPinchable(false)
        setOverScrollHorizontal(false)
        setOverScrollVertical(false)
        setTransformation(ZoomApi.TRANSFORMATION_CENTER_INSIDE, Gravity.TOP)
        containerLayout.clipChildren = false
        LayoutParams(LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT).let { params ->
            containerLayout.addView(badgesViewGroup, -1, params)
            containerLayout.addView(reactionsViewGroup, -1, params)
        }
        LayoutParams(LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT).let { params ->
            super.addView(containerLayout, -1, params)
        }
        engine.addListener(viewportUpdateListener)
    }

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        super.onLayout(changed, left, top, right, bottom)
        if (changed) reactHelper.doIfOnGlobalLayoutListenersNotWorking {
            engine.setContainerSize((right - left).toFloat(), (bottom - top).toFloat(), false)
        }
    }

    fun setOptions(options: Options) {
        setBgSize(options.width, options.height)
        viewportUpdateListener.onBgSizeChanged(
            options.width.roundToInt(),
            options.height.roundToInt()
        )
        multiplier = options.multiplier
        val minZoom = options.minZoom.let { if (it == 1.0F) 1.000001F else it }
        val maxZoom = options.maxZoom
        if (getMinZoom() != minZoom) setMinZoom(minZoom, ZoomApi.TYPE_ZOOM)
        if (getMaxZoom() != maxZoom) setMaxZoom(maxZoom, ZoomApi.TYPE_ZOOM)
    }

    private fun setBgSize(w: Float, h: Float) {
        this.roomWidth = w.toInt()
        this.roomHeight = h.toInt()
        bgImage?.also {
            containerLayout.layoutParams = LayoutParams(this.roomWidth, this.roomHeight)
            it.layoutParams = LayoutParams(this.roomWidth, this.roomHeight)
            reactHelper.doIfOnGlobalLayoutListenersNotWorking {
                engine.setContentSize(roomWidth.toFloat(), roomHeight.toFloat(), true)
            }
        }
    }

    private fun addChildViewInternal(
        child: View,
        index: Int? = null,
        params: ViewGroup.LayoutParams? = null
    ) {
        when (child.contentDescription) {
            "bgImage" -> {
                bgImage = child
                containerLayout.layoutParams = LayoutParams(this.roomWidth, this.roomHeight)
                containerLayout.addView(child, index ?: -1, LayoutParams(roomWidth, roomHeight))
                reactHelper.doIfOnGlobalLayoutListenersNotWorking {
                    engine.setContentSize(roomWidth.toFloat(), roomHeight.toFloat(), true)
                }
                setInitialZoom()
            }
            "UsersList" -> {
                setupUserList(child)
                params?.also { containerLayout.addView(child, index ?: -1, it) }
                    ?: containerLayout.addView(child, index ?: -1)
            }
            else -> {
                params?.also { containerLayout.addView(child, index ?: -1, it) }
                    ?: containerLayout.addView(child, index ?: -1)
            }
        }
    }

    override fun removeView(view: View) {
        if (view.contentDescription != "bgImage" && view.parent != containerLayout) {
            containerLayout.removeView(view)
        }
    }

//    override fun removeViewAt(index: Int) {
//        if (view.contentDescription != "bgImage" && view.parent != containerLayout) {
//            containerLayout.removeView(view)
//        }
//    }

    override fun addView(child: View, index: Int) {
        addChildViewInternal(child = child, index = index)
    }

    override fun addView(child: View, index: Int, params: ViewGroup.LayoutParams) {
        addChildViewInternal(child = child, index = index, params = params)
    }

    private fun setupUserList(view: View) {
        view.setOnTouchListener(ClickListener(::onTap))
    }

    private fun onTap(e: MotionEvent) {
        val x = e.x
        val y = e.y
        debugP("View: onTap", x, y)
        AppManager.sendMove(e.x, e.y)
    }

    private fun setInitialZoom() {
        engine.zoomTo(multiplier, animate = false)
        engine.panTo(0f, 0f, animate = false)
    }
}

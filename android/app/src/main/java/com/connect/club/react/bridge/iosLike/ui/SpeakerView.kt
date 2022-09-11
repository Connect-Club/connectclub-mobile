package com.connect.club.react.bridge.iosLike.ui

import android.animation.Animator
import android.animation.ObjectAnimator
import android.annotation.SuppressLint
import android.content.Context
import android.util.Size
import android.util.SparseArray
import android.view.View
import android.view.ViewGroup
import androidx.core.view.isVisible
import com.connect.club.react.bridge.iosLike.debugP
import com.connect.club.react.rncviews.rncroomlayout.RoomScene
import com.connect.club.view.BadgesViewGroup
import com.connect.club.view.ViewTraversalUtil
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import org.json.JSONObject
import java.lang.ref.WeakReference

@SuppressLint("ClickableViewAccessibility")
class SpeakerView(context: Context) : BaseMovableView(context) {
    var userId: String = ""
    var size: Float = 0f

    var isBadgedGuest = false
    var isSpecialGuest = false
    var isAdmin = false
    var isLocal = false
    var lastState: JSONObject? = null
    var isSharingVisible = false

    private val scene: RoomScene
        get() {
            return ViewTraversalUtil.findParent(this) {
                it is RoomScene
            } as RoomScene
        }

    @Suppress("UNNECESSARY_LATEINIT")
    private lateinit var badgesView: BadgesViewGroup
    @Suppress("UNNECESSARY_LATEINIT")
    private lateinit var reactionsView: BadgesViewGroup
    private var videoViewContainer: SpeakerVideoViewContainer? = null
    private var userReactionView: UserReactionsView? = null
    private var userBadgeView: View? = null
    private var userSpeakerView: UserSpeakerMicrophoneIconsView? = null
    private var userScreenShareView: View? = null
    private var userTogglesView: UserTogglesView? = null
    private var scaleAnimator: Animator? = null
    private val regularView: SparseArray<WeakReference<View>> = SparseArray()

    init {
        clipChildren = false
        clipToPadding = false
        badgesView = BadgesViewGroup(context).also {
            it.layoutParams = LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT)
            it.clipChildren = false
        }
        reactionsView = BadgesViewGroup(context).also {
            it.layoutParams = LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT)
            it.clipChildren = false
            it.contentDescription = "Speaker"
            it.onClick = {
                val args = Arguments.createMap()
                args.putMap("user", Arguments.createMap().apply {
                    putString("id", userId)
                    putBoolean("isAdmin", isAdmin)
                    putBoolean("isLocal", isLocal)
                    putString("mode", "room")
                })
                (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
                        .receiveEvent(id, "onClick", args)
            }
        }
    }

    fun switchScreenShotMode(enable: Boolean) {
        videoViewContainer?.switchScreenShotMode(enable)
    }

    override fun setTranslationX(translationX: Float) {
        super.setTranslationX(translationX)
        if (::badgesView.isInitialized) {
            badgesView.translationX = translationX
            // hide badges immediately if user moved out of scene
            // otherwise badges remain visible until view is detached from window
            badgesView.isVisible = translationX > 0
        }
        if (::reactionsView.isInitialized) {
            reactionsView.translationX = translationX
            reactionsView.isVisible = translationX > 0
        }
    }

    override fun setTranslationY(translationY: Float) {
        super.setTranslationY(translationY)
        if (::badgesView.isInitialized) {
            badgesView.translationY = translationY
        }
        if (::reactionsView.isInitialized) {
            reactionsView.translationY = translationY
        }
    }

    override fun setScaleX(scaleX: Float) {
        super.setScaleX(scaleX)
        badgesView.scaleX = scaleX
        reactionsView.scaleX = scaleX
    }

    override fun setScaleY(scaleY: Float) {
        super.setScaleY(scaleY)
        badgesView.scaleY = scaleY
        reactionsView.scaleY = scaleY
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)

        applySizeChange(badgesView, w, h)
        applySizeChange(reactionsView, w, h)
    }

    private fun applySizeChange(child: BadgesViewGroup, w: Int, h: Int) =
        child.let {
            it.size = Size(w, h)
            it.measure(
                MeasureSpec.makeMeasureSpec(w, MeasureSpec.EXACTLY),
                MeasureSpec.makeMeasureSpec(h, MeasureSpec.EXACTLY)
            )
            it.layout(0, 0, it.measuredWidth, it.measuredHeight)
        }

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        if (userId == "") throw RuntimeException("Cant add view without userId")
        if (badgesView.parent == null) scene.badgesContainer.addView(badgesView)
        if (reactionsView.parent == null) scene.reactionsContainer.addView(reactionsView)
        AppManager.addSpeaker(userId, this)
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        if (userId == "") throw RuntimeException("Cant remove view without userId")
        AppManager.removeSpeaker(userId)
        post {
            if (badgesView.parent is ViewGroup) {
                (badgesView.parent as ViewGroup).removeView(badgesView)
            }
            if (reactionsView.parent is ViewGroup) {
                (reactionsView.parent as ViewGroup).removeView(reactionsView)
            }
        }
    }

    fun onState(state: JSONObject) {
        lastState = state
        videoViewContainer?.onState(state, userId)
        userTogglesView?.onState(state)
        size = state.getDouble("size").toFloat()
        isLocal = state.getBoolean("isLocal")
        isAdmin = state.getBoolean("isAdmin")
        isSpecialGuest = state.getBoolean("isSpecialGuest")
        isBadgedGuest = state.has("badges") && state.getJSONArray("badges").length() > 0
        if (isLocal) {
            badgesView.bringToFront()
            reactionsView.bringToFront()
        }

        //val isExpired = state.getBoolean("isExpired")
        val isReaction = state.getString("reaction") != "none"

        userBadgeView?.isVisible = (isAdmin || isBadgedGuest || isSpecialGuest) && !isReaction// && !isExpired
        userReactionView?.onState(state)
        userSpeakerView?.onState(state)

        userScreenShareView?.isVisible = isSharingVisible && !isReaction// && !isExpired
    }

    fun onHidden() {
        debugP("hidden video of", userId)
        videoViewContainer?.hideVideo()
    }

    fun onShown() {
        debugP("shown video of", userId)
        videoViewContainer?.unhideVideo()
    }

    fun toggleReaction(id: String, type: String) {
        userReactionView?.toggleReaction(id, type)
        userBadgeView?.isVisible = (isAdmin || isBadgedGuest || isSpecialGuest) && type == "none"
        if (type == "none") {
            userTogglesView?.showIfNeed()
            userScreenShareView?.isVisible = isSharingVisible
        } else {
            userTogglesView?.isVisible = false
            userScreenShareView?.isVisible = false
        }
    }

    fun showScreenSharing() {
        isSharingVisible = true
    }

    fun hideScreenSharing() {
        isSharingVisible = false
    }

    fun animateScale(scale: Float) {
        if (this.scaleX == scale) return
        scaleAnimator?.cancel()
        scaleAnimator = ObjectAnimator.ofFloat(scaleX, scale)
                .setDuration(250)
                .apply {
                    addUpdateListener {
                        scaleX = it.animatedValue as Float
                        scaleY = it.animatedValue as Float
                    }
                    start()
                }

    }

    fun mirror(isMirror: Boolean) {
        videoViewContainer?.mirror(isMirror)
    }

    fun disableVideo() {
        videoViewContainer?.disableVideo()
    }

    fun enableVideo() {
        videoViewContainer?.enableVideo()
    }

    override fun addView(child: View?, index: Int) {
        if (child is SpeakerVideoViewContainer) {
            videoViewContainer = child
            super.addView(child, -1)
            return
        }
        if (child is UserReactionsView) {
            userReactionView = child
            child.isVisible = false
            reactionsView.addView(child)
            return
        }
        if (child?.contentDescription == "UserBadgeView") {
            userBadgeView = child
            child.isVisible = false
            badgesView.addView(child)
            return
        }
        if (child?.contentDescription == "UserScreenShareView") {
            userScreenShareView = child
            child.isVisible = false
            badgesView.addView(child)
            return
        }
        if (child is UserTogglesView) {
            userTogglesView = child
            child.isVisible = false
            badgesView.addView(child)
            return
        }
        if (child is UserSpeakerMicrophoneIconsView) {
            userSpeakerView = child
            child.isVisible = false
            badgesView.addView(child)
            return
        }

        // Saving a reference on a view by index at the addition moment,
        // to compute real index at removing
        regularView.put(index, WeakReference(child))
        super.addView(child, -1)
    }

    override fun removeViewAt(index: Int) {
        // Computing a real index of a view
        // based on a stored index and reference
        val realView = regularView.get(index)?.get() ?: return
        if (realView.parent != this) return
        val realIndex = indexOfChild(realView)
        regularView.delete(index)
        if (realIndex < 0 || realIndex >= childCount) return
        super.removeViewAt(realIndex)
    }
}

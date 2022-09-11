package com.connect.club.react.bridge.iosLike.ui

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.animation.AnimatorSet
import android.animation.ObjectAnimator
import android.annotation.SuppressLint
import android.content.Context
import com.connect.club.utils.AnimQueue
import com.connect.club.utils.runOnMainThread

class RadarView(context: Context) : BaseMovableView(context) {
    private var originalAlpha = -1f
    private val showHideQueue = AnimQueue()
    private var flickerAnim: Animator? = null

    fun flick() = runOnMainThread {
        if (alpha == 0f) return@runOnMainThread
        if (flickerAnim != null) return@runOnMainThread
        if (originalAlpha < 0f) {
            originalAlpha = this.alpha
        }

        val anim = AnimatorSet().also {
            it.playSequentially(
                ObjectAnimator.ofFloat(this, "alpha", originalAlpha / 2f).setDuration(200),
                ObjectAnimator.ofFloat(this, "alpha", 1f).setDuration(200),
                ObjectAnimator.ofFloat(this, "alpha", originalAlpha).setDuration(400),
            )
        }
        anim.addListener(object : AnimatorListenerAdapter() {
            override fun onAnimationEnd(animation: Animator?) {
                flickerAnim = null
            }

            override fun onAnimationCancel(animation: Animator?) {
                flickerAnim = null
            }
        })
        anim.start()
    }

    fun hide() = runOnMainThread {
        if (this.alpha < 0.001f) {
            // already hidden
            flickerAnim?.cancel()
            flickerAnim = null
            showHideQueue.cancelAll(RADAR_SHOW_HIDE_KEY)
            return@runOnMainThread
        }
        if (originalAlpha < 0f) {
            originalAlpha = this.alpha
        }
        val anim = AnimatorSet().also {
            it.playTogether(
                ObjectAnimator.ofFloat(this, "scaleX", scaleX, 0.3f),
                ObjectAnimator.ofFloat(this, "scaleY", scaleX, 0.3f),
                ObjectAnimator.ofFloat(this, "alpha", alpha, 0f),
            )
            it.duration = 200
        }
        flickerAnim?.cancel()
        flickerAnim = null
        showHideQueue.cancelAll(RADAR_SHOW_HIDE_KEY)
        showHideQueue.enqueue(anim, RADAR_SHOW_HIDE_KEY)
    }

    fun show() = runOnMainThread {
        if (originalAlpha < 0f) {
            originalAlpha = this.alpha
        }
        val anim = AnimatorSet().also {
            it.playTogether(
                ObjectAnimator.ofFloat(this, "scaleX", scaleX, 1f),
                ObjectAnimator.ofFloat(this, "scaleY", scaleX, 1f),
                ObjectAnimator.ofFloat(this, "alpha", alpha, originalAlpha),
            )
            it.duration = 200
        }
        showHideQueue.cancelAll(RADAR_SHOW_HIDE_KEY)
        showHideQueue.enqueue(anim, RADAR_SHOW_HIDE_KEY)
    }

    companion object {
        const val RADAR_SHOW_HIDE_KEY = "radarViewShowHide"
    }
}
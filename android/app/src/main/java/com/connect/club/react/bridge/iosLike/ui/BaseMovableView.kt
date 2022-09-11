package com.connect.club.react.bridge.iosLike.ui

import android.animation.Animator
import android.animation.ObjectAnimator
import android.content.Context
import com.facebook.react.views.view.ReactViewGroup

open class BaseMovableView(context: Context) : ReactViewGroup(context) {

    private var moveAnimator: Animator? = null

    init {
        translationX = -10000f
        translationY = -10000f
    }

    fun move(x: Float, y: Float) {
        translationX = x - width / 2
        translationY = y - height / 2
    }

    fun animatedMove(x: Float, y: Float, duration: Double) {
        moveAnimator?.cancel()
        val tx = x - width / 2
        val ty = y - height / 2
        val startX = translationX
        val startY = translationY
        moveAnimator = ObjectAnimator.ofFloat(1f)
                .setDuration((duration * 1000.0).toLong())
                .apply {
                    addUpdateListener {
                        translationX = startX * (1f - it.animatedFraction) + it.animatedFraction * tx
                        translationY = startY * (1f - it.animatedFraction) + it.animatedFraction * ty
                    }
                    start()
                }
    }
}

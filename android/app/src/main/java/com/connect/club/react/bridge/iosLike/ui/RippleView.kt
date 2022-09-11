package com.connect.club.react.bridge.iosLike.ui

import android.animation.AnimatorSet
import android.animation.ValueAnimator
import android.animation.ValueAnimator.AnimatorUpdateListener
import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.view.View
import android.view.animation.DecelerateInterpolator
import androidx.annotation.ColorInt
import androidx.annotation.ColorRes
import androidx.core.content.ContextCompat
import java.util.*

@SuppressLint("ViewConstructor")
class RippleView(
    context: Context,
    duration: Int,
    delay: Int,
    startRadius: Float,
    @ColorInt var color: Int
) : View(context, null), AnimatorUpdateListener {

    private class Ripple constructor(
        startRadiusFraction: Float,
        stopRadiusFraction: Float,
        startAlpha: Float,
        stopAlpha: Float,
        color: Int,
        delay: Long,
        duration: Long,
        strokeWidth: Float
    ) {
        var mAnimatorSet: AnimatorSet
        var mRadiusAnimator: ValueAnimator
        var mAlphaAnimator: ValueAnimator
        var mPaint: Paint
        fun addUpdateListener(listener: AnimatorUpdateListener?) {
            mRadiusAnimator.addUpdateListener(listener)
            mAlphaAnimator.addUpdateListener(listener)
        }

        fun removeUpdateListener(listener: AnimatorUpdateListener?) {
            mRadiusAnimator.removeUpdateListener(listener)
            mAlphaAnimator.removeUpdateListener(listener)
        }

        fun draw(canvas: Canvas, centerX: Int, centerY: Int, radiusMultiplicator: Float) {
            mPaint.alpha = (255 * mAlphaAnimator.animatedValue as Float).toInt()
            canvas.drawCircle(centerX.toFloat(), centerY.toFloat(), mRadiusAnimator.animatedValue as Float * radiusMultiplicator, mPaint)
        }

        fun startAnimation() {
            mAnimatorSet.start()
        }

        fun stopAnimation() {
            mAnimatorSet.cancel()
        }

        init {
            mRadiusAnimator = ValueAnimator.ofFloat(startRadiusFraction, stopRadiusFraction)
            mRadiusAnimator.duration = duration
            mRadiusAnimator.repeatCount = ValueAnimator.INFINITE
            mRadiusAnimator.interpolator = DecelerateInterpolator()
            mAlphaAnimator = ValueAnimator.ofFloat(startAlpha, stopAlpha)
            mAlphaAnimator.duration = duration
            mAlphaAnimator.repeatCount = ValueAnimator.INFINITE
            mAlphaAnimator.interpolator = DecelerateInterpolator()
            mAnimatorSet = AnimatorSet()
            mAnimatorSet.playTogether(mRadiusAnimator, mAlphaAnimator)
            mAnimatorSet.startDelay = delay
            mPaint = Paint()
            mPaint.style = Paint.Style.FILL
            mPaint.color = color
            mPaint.alpha = (255 * startAlpha).toInt()
            mPaint.isAntiAlias = true
            mPaint.strokeWidth = strokeWidth
        }
    }

    private var mRipples: MutableList<Ripple> = ArrayList()

    init {
        init(duration, delay, startRadius)
    }

    private fun init(duration: Int, delay: Int, startRadius: Float) {
        if (isInEditMode) return
        /*
        Tweak your ripples here!
        */mRipples = ArrayList()
        Ripple(
            startRadius,
            1.0f,
            1.0f,
            0.0f,
            color,
            0,
            duration.toLong(),
            4F
        ).also {
            it.addUpdateListener(this)
            mRipples.add(it)
        }
        Ripple(
            startRadius,
            1.0f,
            1.0f,
            0.0f,
                color,
            delay.toLong(),
            duration.toLong(),
            4F
        ).also {
            it.addUpdateListener(this)
            mRipples.add(it)
        }
    }

    fun startAnimation() {
        visibility = VISIBLE
        for (ripple in mRipples) {
            ripple.startAnimation()
        }
    }

    fun startAnimationOnce() {
        startAnimation()
        handler.postDelayed({ stopAnimation() }, 1500)
    }

    fun stopAnimation() {
        for (ripple in mRipples) {
            ripple.stopAnimation()
        }
        visibility = GONE
    }

    override fun clearAnimation() {
        for (ripple in mRipples) {
            ripple.stopAnimation()
        }
        visibility = GONE
    }

    override fun onAnimationUpdate(animation: ValueAnimator) {
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        val centerX = width / 2
        val centerY = height / 2
        val radiusMultiplicator = width / 2
        for (ripple in mRipples) {
            ripple.draw(canvas, centerX, centerY, radiusMultiplicator.toFloat())
        }
    }

    fun release() {
        mRipples.forEach { it.removeUpdateListener(this) }
    }
}

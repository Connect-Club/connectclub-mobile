package com.connect.club.react.rncviews.rncroomlayout

import android.animation.ValueAnimator
import android.content.Context
import android.view.ViewGroup
import android.view.animation.AccelerateDecelerateInterpolator
import android.view.animation.LinearInterpolator
import android.widget.FrameLayout
import android.widget.ImageView
import androidx.core.animation.doOnEnd
import com.connect.club.react.bridge.iosLike.ui.AppManager
import com.connect.club.react.bridge.iosLike.ui.RasterIconView
import com.connect.club.utils.toPx
import kotlin.random.Random

class RNCFloatingReactionsView constructor(
    context: Context
) : FrameLayout(context) {

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        AppManager.reactionsView = this
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        AppManager.reactionsView = null
    }

    fun animateReaction(reactionIcon: String, xOffset: Float) {
        val reactionSize = 40.toPx()
        val imageView = ImageView(context)
        addView(imageView)
        imageView.measure(
            MeasureSpec.makeMeasureSpec(reactionSize, MeasureSpec.EXACTLY),
            MeasureSpec.makeMeasureSpec(reactionSize, MeasureSpec.EXACTLY)
        )
        imageView.layout(0, 0, reactionSize, reactionSize)
        RasterIconView.showIcon(imageView, reactionIcon)
        animateReactionImage(imageView, xOffset)
    }

    private fun animateReactionImage(imageView: ImageView, xOffset: Float) {
        val animationDuration = 5f * 1000
        val shakeDuration = 1500L
        val shakeDistance = 20.toPx().toFloat()
        val floatHeightBase = height * 0.7f
        val halfSize = (imageView.measuredHeight / 2f).toInt()
        val floatHeight = Random.nextInt(-halfSize, halfSize) + floatHeightBase
        val initialLocationY = (height - imageView.measuredHeight).toFloat() + Random.nextInt(-halfSize, halfSize)
        val initialFade = Random.nextInt(70, 100) / 100f

        imageView.translationY = initialLocationY
        imageView.translationX = xOffset

        ValueAnimator.ofFloat(initialFade, 0f).apply {
            interpolator = LinearInterpolator()
            duration = animationDuration.toLong()
            addUpdateListener { imageView.alpha = it.animatedValue as Float }
            start()
        }
        val xAnim = ValueAnimator.ofFloat(0f, shakeDistance).apply {
            interpolator = AccelerateDecelerateInterpolator()
            startDelay = (Math.random() * 1000f).toLong()
            duration = shakeDuration
            repeatMode = ValueAnimator.REVERSE
            repeatCount = ValueAnimator.INFINITE
            addUpdateListener { anim ->
                imageView.translationX = xOffset + anim.animatedValue as Float
            }
            start()
        }
        ValueAnimator.ofFloat(0f, floatHeight).apply {
            interpolator = LinearInterpolator()
            startDelay = (Math.random() * 1000f).toLong()
            duration = animationDuration.toLong()
            addUpdateListener { anim ->
                imageView.translationY = initialLocationY - anim.animatedValue as Float
            }
            doOnEnd {
                xAnim.cancel()
                (imageView.parent as ViewGroup?)?.removeView(imageView)
            }
            start()
        }
    }
}
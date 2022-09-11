package com.connect.club.utils

import android.animation.Animator
import android.animation.AnimatorSet
import android.animation.ObjectAnimator
import android.animation.ValueAnimator
import android.graphics.Rect
import android.view.View
import android.view.ViewGroup
import androidx.core.animation.addListener
import kotlin.math.roundToInt

fun View.expandFullScreen(homeView: View, dimView: View, callback: ((Animator) -> Unit)? = null): AnimatorSet {
    val mutableView = this
    val expandAnimation = AnimatorSet()
    callback?.let { expandAnimation.addListener(onEnd = it) }
    val videoParent = dimView.parent as ViewGroup
    val parentWidth = videoParent.width
    val parentHeight = videoParent.height
    val parentRatio = parentWidth.toFloat() / parentHeight
    // inverted because of rotation
    val childRatio = homeView.height / homeView.width.toFloat()
    //region ApplyRatio
    val resultWidth: Int
    val resultHeight: Int
    if (childRatio > parentRatio) {
        resultWidth = parentWidth
        resultHeight = (parentWidth / childRatio).roundToInt()
    } else {
        resultHeight = parentHeight
        resultWidth = (parentHeight * childRatio).roundToInt()
    }
    //endregion ApplyRatio
    val newX = parentWidth / 2F - resultHeight / 2F
    val newY = parentHeight / 2F - resultWidth / 2F
    expandAnimation.apply {
        playTogether(
            ObjectAnimator.ofFloat(mutableView, View.TRANSLATION_X, mutableView.translationX, newX),
            ObjectAnimator.ofFloat(mutableView, View.TRANSLATION_Y, mutableView.translationY, newY),
            ValueAnimator.ofInt(mutableView.width, resultHeight).apply {
                addUpdateListener { updatedAnimation ->
                    mutableView.layoutParams.width = updatedAnimation.animatedValue as Int
                    mutableView.requestLayout()
                }
            },
            ValueAnimator.ofInt(mutableView.height, resultWidth).apply {
                addUpdateListener { updatedAnimation ->
                    mutableView.layoutParams.height = updatedAnimation.animatedValue as Int
                    mutableView.requestLayout()
                }
            },
            ObjectAnimator.ofFloat(mutableView, View.ROTATION, mutableView.rotation, 90F),
            ObjectAnimator.ofFloat(dimView, View.ALPHA, dimView.alpha, 1F),
        )
    }
    return expandAnimation
}

fun View.collapseTo(rect: Rect, dimView: View, callback: ((Animator) -> Unit)? = null): AnimatorSet {
    val mutableView = this
    val expandAnimation = AnimatorSet()
    callback?.let { expandAnimation.addListener(onEnd = it) }
    expandAnimation.apply {
        playTogether(
            ObjectAnimator.ofFloat(mutableView, View.TRANSLATION_X, mutableView.translationX, rect.left.toFloat()),
            ObjectAnimator.ofFloat(mutableView, View.TRANSLATION_Y, mutableView.translationY, rect.top.toFloat()),
            ValueAnimator.ofInt(mutableView.width, rect.width()).apply {
                addUpdateListener { updatedAnimation ->
                    mutableView.layoutParams.width = updatedAnimation.animatedValue as Int
                    mutableView.requestLayout()
                }
            },
            ValueAnimator.ofInt(mutableView.height, rect.height()).apply {
                addUpdateListener { updatedAnimation ->
                    mutableView.layoutParams.height = updatedAnimation.animatedValue as Int
                    mutableView.requestLayout()
                }
            },
            ObjectAnimator.ofFloat(mutableView, View.ROTATION, mutableView.rotation, 0F),
            ObjectAnimator.ofFloat(dimView, View.ALPHA, dimView.alpha, 0F),
        )
    }
    return expandAnimation
}

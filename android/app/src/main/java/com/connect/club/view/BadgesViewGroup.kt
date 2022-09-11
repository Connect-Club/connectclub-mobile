package com.connect.club.view

import android.annotation.SuppressLint
import android.content.Context
import android.util.Size
import android.view.GestureDetector
import android.view.MotionEvent
import com.facebook.react.views.view.ReactViewGroup

class BadgesViewGroup(context: Context) : ReactViewGroup(context) {

    var onClick: (() -> Unit)? = null
    var size = Size(0, 0)
    private val detector = GestureDetector(context, object : GestureDetector.OnGestureListener {
        override fun onDown(e: MotionEvent?): Boolean = true

        override fun onShowPress(e: MotionEvent?) {
        }

        override fun onSingleTapUp(e: MotionEvent?): Boolean {
            onClick?.let {
                it.invoke()
                performClick()
                return true
            }
            return false
        }

        override fun onScroll(
                e1: MotionEvent?,
                e2: MotionEvent?,
                distanceX: Float,
                distanceY: Float
        ): Boolean = false

        override fun onLongPress(e: MotionEvent?) {
        }

        override fun onFling(
                e1: MotionEvent?,
                e2: MotionEvent?,
                velocityX: Float,
                velocityY: Float
        ): Boolean = false
    })

    @SuppressLint("ClickableViewAccessibility")
    override fun onTouchEvent(ev: MotionEvent?): Boolean {
        return detector.onTouchEvent(ev)
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        setMeasuredDimension(size.width, size.height)
    }
}
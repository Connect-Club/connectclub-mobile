package com.connect.club.view

import android.view.MotionEvent
import android.view.View

class ClickListener(private val listener: (MotionEvent) -> Unit) : View.OnTouchListener {
    override fun onTouch(view: View, event: MotionEvent): Boolean = when (event.action) {
        MotionEvent.ACTION_DOWN -> true
        MotionEvent.ACTION_UP -> {
            listener.invoke(event)
            view.performClick()
            true
        }
        else -> false
    }
}

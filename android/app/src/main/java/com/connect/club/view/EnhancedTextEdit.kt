package com.connect.club.view

import android.annotation.SuppressLint
import android.content.Context
import android.view.MotionEvent
import com.connect.club.utils.runOnMainThread
import com.facebook.react.views.textinput.ReactEditText

class EnhancedTextEdit constructor(context: Context) : ReactEditText(context) {

    var onSelectionChangeListener: ((EnhancedTextEdit, Int, Int) -> Unit)? = null
    private var isDownClick = false

    override fun onSelectionChanged(selStart: Int, selEnd: Int) {
        super.onSelectionChanged(selStart, selEnd)
        onSelectionChangeListener?.invoke(this, selStart, selEnd)
    }

    @SuppressLint("ClickableViewAccessibility")
    override fun onTouchEvent(ev: MotionEvent): Boolean {
        when (ev.action) {
            MotionEvent.ACTION_DOWN -> isDownClick = true
            MotionEvent.ACTION_UP -> {
                isDownClick = false
                if (!hasFocus()) {
                    runOnMainThread(50L) {
                        if (!hasFocus()) requestFocusFromJS()
                    }
                }
            }
            else -> isDownClick = false
        }
        return super.onTouchEvent(ev)
    }
}

package com.connect.club.view

import android.annotation.SuppressLint
import android.content.Context
import android.util.AttributeSet
import android.widget.LinearLayout

class CustomLinearLayout @JvmOverloads constructor(
        context: Context, attrs: AttributeSet? = null, defStyleAttr: Int = 0
) : LinearLayout(context, attrs, defStyleAttr) {
    private var isRequestedLayout = false

    fun notifyUpdated() {
        isRequestedLayout = false
    }

    @SuppressLint("WrongCall")
    override fun requestLayout() {
        super.requestLayout()
        if (!isRequestedLayout) {
            isRequestedLayout = true
            post {
                isRequestedLayout = false
                layout(left, top, right, bottom)
                onLayout(false, left, top, right, bottom)
            }
        }
    }
}
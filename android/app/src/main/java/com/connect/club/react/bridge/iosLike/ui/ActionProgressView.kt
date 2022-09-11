package com.connect.club.react.bridge.iosLike.ui

import android.annotation.SuppressLint
import android.content.Context
import android.content.res.ColorStateList
import android.view.Gravity
import android.widget.FrameLayout
import android.widget.ProgressBar
import androidx.core.view.isVisible
import com.connect.club.utils.toPx


@SuppressLint("ViewConstructor")
class ActionProgressView constructor(
    context: Context,
    progressColor: Int? = null
) : FrameLayout(context) {

    private val progressBar: ProgressBar

    var progressColor: Int? = null
        set(value) {
            field = value
            if (value != null) {
                progressBar.indeterminateTintList = ColorStateList.valueOf(value)
            }
        }

    init {
        progressBar = ProgressBar(context, null, android.R.attr.progressBarStyleSmall).apply {
            val params = LayoutParams(24.toPx(), 24.toPx())
            params.gravity = Gravity.CENTER
            addView(this, params)
            isIndeterminate = true
        }
        this.progressColor = progressColor
        isVisible = false
    }
}
package com.connect.club.utils

import android.os.Build
import android.view.View
import android.view.ViewGroup
import android.view.Window
import android.view.WindowManager
import androidx.core.view.children

fun Window.hideNavigationBar() {
    val uiOptions = (View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY)
    decorView.systemUiVisibility = decorView.systemUiVisibility or uiOptions
}

fun Window.showNavigationBar(light: Boolean) {
    val lightFlag =
            if (light && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
            else 0
    val uiOptions = (
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    or lightFlag
            )
    val current = decorView.systemUiVisibility and
            (View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY).inv()
    decorView.systemUiVisibility = current or uiOptions
}

fun Window.setKeepOnScreen(isKeepScreenOn: Boolean) {
    if (isKeepScreenOn) {
        addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    } else {
        clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    }
}

fun View.measureAndLayout(width: Int, height: Int) {
    measure(
            View.MeasureSpec.makeMeasureSpec(width, View.MeasureSpec.EXACTLY),
            View.MeasureSpec.makeMeasureSpec(height, View.MeasureSpec.EXACTLY)
    )
    layout(0, 0, width, height)
}

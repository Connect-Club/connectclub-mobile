package com.connect.club.react.navbar

import android.app.Activity
import android.content.Context
import android.graphics.Color
import android.os.Build
import android.view.View
import android.view.Window
import android.view.WindowManager
import android.view.inputmethod.InputMethodManager
import com.connect.club.utils.hideNavigationBar
import com.connect.club.utils.runOnMainThread
import com.connect.club.utils.setKeepOnScreen
import com.connect.club.utils.showNavigationBar
import com.facebook.react.bridge.*

class DecorConfigModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "AndroidDecorConfig"

    @ReactMethod
    fun setNavigationBarColor(color: String, light: Boolean, promise: Promise) = runOnMainThread {
        val activity = currentActivity
        if (activity == null) {
            promise.resolve(false)
            return@runOnMainThread
        }

        activity.window.navigationBarColor = Color.parseColor(color)
        setNavigationBarTheme(activity, light)
        promise.resolve(true)
    }

    @ReactMethod
    fun showNavigationBar(light: Boolean) = withActivity {
        it.window.showNavigationBar(light)
    }

    @ReactMethod
    fun hideNavigationBar() = withActivity {
        it.window.hideNavigationBar()
    }

    @ReactMethod
    fun setKeepScreenOn(isKeepScreenOn: Boolean) = withActivity {
        it.window.setKeepOnScreen(isKeepScreenOn)
    }

    @ReactMethod
    fun setNoLimitsFlag(noLimits: Boolean) {
        runOnMainThread {
            val activity = currentActivity ?: return@runOnMainThread
            if (noLimits) {
                activity.window.setFlags(
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
                )
            } else {
                activity.window.clearFlags(
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS
                )
            }
        }
    }

    @ReactMethod
    fun setSoftInputMode(mode: String) = runOnMainThread {
        val window = currentActivity?.window ?: return@runOnMainThread
        when (mode) {
            "overlay" -> window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_PAN)
            else -> window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_ADJUST_RESIZE)
        }
    }

    @ReactMethod
    fun clearWindowFocus() = runOnMainThread {
        currentActivity?.window?.currentFocus?.clearFocus()
    }

    private fun withActivity(block: (activity: Activity) -> Unit) {
        runOnMainThread { currentActivity?.let { block(it) } }
    }

    private fun setNavigationBarTheme(activity: Activity?, light: Boolean) {
        if (activity != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val window: Window = activity.window
            var flags: Int = window.decorView.systemUiVisibility
            flags = if (light) {
                flags or View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
            } else {
                flags and View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR.inv()
            }
            flags.also { window.decorView.systemUiVisibility = it }
        }
    }
}

package com.connect.club.react.rncviews.rncroomlayout

import android.graphics.Matrix
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.util.Size
import com.connect.club.BuildConfig
import com.connect.club.react.bridge.iosLike.ui.AppManager
import com.otaliastudios.zoom.ZoomEngine
import common.Common

class ViewportUpdateListener : ZoomEngine.Listener {

    private var isGestureStarted = false
    private val handler = Handler(Looper.getMainLooper())
    private var updateRunnable: Runnable? = null
    private var bgSize = Size(0, 0)
    private var prevX1 = Int.MIN_VALUE
    private var prevY1 = Int.MIN_VALUE
    private var prevZoom = Float.MIN_VALUE
    private var currentX1 = 0
    private var currentY1 = 0
    private var currentZoom = 0f

    fun onBgSizeChanged(w: Int, h: Int) {
        bgSize = Size(w, h)
    }

    override fun onIdle(engine: ZoomEngine) {
        isGestureStarted = false
        val runnable = updateRunnable
        updateRunnable = null
        runnable?.let {
            handler.removeCallbacks(it)
            doViewportUpdate()
        }
    }

    override fun onUpdate(engine: ZoomEngine, matrix: Matrix) {
        currentX1 = (-engine.panX.toInt()).coerceAtLeast(0)
        currentY1 = (-engine.panY.toInt()).coerceAtLeast(0)
        currentZoom = engine.zoom
        if (isGestureStarted) return
        isGestureStarted = true
        scheduleUpdates()
    }

    private fun scheduleUpdates() {
        updateRunnable = Runnable {
            doViewportUpdate()
        }.also {
            handler.postDelayed(it, UPDATE_INTERVAL_MILLIS)
        }
    }

    private fun doViewportUpdate() {
        if (bgSize.width > 0 &&
            bgSize.height > 0 &&
            (prevX1 != currentX1 || prevY1 != currentY1 || currentZoom != prevZoom)
        ) {
            val currentX2 = (currentX1 + bgSize.width * (1f / currentZoom)).toInt()
            val currentY2 = (currentY1 + bgSize.height * (1f / currentZoom)).toInt()
            prevX1 = currentX1
            prevY1 = currentY1
            prevZoom = currentZoom
            if (BuildConfig.DEBUG) {
                Log.d(
                    "ViewportUpdateListener",
                    "viewport: $currentX1, $currentY1; $currentX2, $currentY2; zoom: $currentZoom"
                )
            }
            AppManager.room?.setViewport(
                currentX1.toDouble(),
                currentY1.toDouble(),
                currentX2.toDouble(),
                currentY2.toDouble()
            )
        }

        updateRunnable?.let {
            handler.postDelayed(it, UPDATE_INTERVAL_MILLIS)
        }
    }

    companion object {
        private const val UPDATE_INTERVAL_MILLIS = 500L
    }
}
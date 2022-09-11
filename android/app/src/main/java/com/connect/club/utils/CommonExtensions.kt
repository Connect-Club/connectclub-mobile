package com.connect.club.utils

import android.os.Handler
import android.os.HandlerThread
import android.os.Looper

private val mainThreadHandler = Handler(Looper.getMainLooper())

fun runOnMainThread(delayMills: Long = 0, block: () -> Unit) {
    if (Looper.myLooper() == Looper.getMainLooper() && delayMills == 0L) {
        block()
    } else {
        mainThreadHandler.postDelayed(block, delayMills)
    }
}

val logsHandler by lazy {
    HandlerThread("Logs").let {
        it.start()
        Handler(it.looper)
    }
}

fun replaceSize(src: String?, width: Int, height: Int): String? =
        src?.replace(":WIDTH", width.toString())
                ?.replace(":HEIGHT", height.toString())


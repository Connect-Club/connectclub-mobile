package com.connect.club.utils

import android.animation.Animator
import android.animation.AnimatorListenerAdapter
import android.os.Handler
import android.os.Looper

class AnimQueue {
    val isRunning: Boolean
        get() = _isRunning

    private var _isRunning = false
    private val animations = mutableListOf<Pair<String, Animator>>()
    private val handler = Handler(Looper.getMainLooper())

    fun enqueue(anim: Animator, key: String = "") {
        val shouldRun = animations.isEmpty()
        animations.add(key to anim)
        if (shouldRun) runNext()
    }

    fun cancelAll(key: String) {
        deque(key, true)
    }

    private fun runNext() {
        if (animations.isEmpty()) return
        val (key, anim) = animations.first()
        anim.addListener(object : AnimatorListenerAdapter() {
            override fun onAnimationEnd(animation: Animator?) {
                anim.removeListener(this)
                handler.post {
                    deque(key)
                    runNext()
                }
            }

            override fun onAnimationCancel(animation: Animator?) {
                anim.removeListener(this)
                handler.post {
                    deque(key)
                    runNext()
                }
            }
        })
        anim.start()
    }

    private fun deque(key: String, cancel: Boolean = false) {
        if (animations.isEmpty()) return
        val iter = animations.iterator()
        while (iter.hasNext()) {
            val item = iter.next()
            if (item.first == key) {
                if (cancel) item.second.cancel()
                iter.remove()
            }
        }
    }
}
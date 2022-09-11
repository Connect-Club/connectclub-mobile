package com.connect.club.react.rncviews.rnutils

import android.view.View
import android.view.ViewTreeObserver

class ReactHelper(private val view: View) {

    private var globalOnLayoutListenersWasFixed: Boolean = false

    private val reactHuckOnLayoutListener = object : ViewTreeObserver.OnGlobalLayoutListener {
        override fun onGlobalLayout() {
            globalOnLayoutListenersWasFixed = true
            view.viewTreeObserver.removeOnGlobalLayoutListener(this)
        }
    }

    init {
        view.addOnAttachStateChangeListener(object : View.OnAttachStateChangeListener {
            override fun onViewAttachedToWindow(view: View) {
                view.viewTreeObserver.addOnGlobalLayoutListener(reactHuckOnLayoutListener)
            }

            override fun onViewDetachedFromWindow(view: View) {
                view.viewTreeObserver.removeOnGlobalLayoutListener(reactHuckOnLayoutListener)
            }
        })
    }

    fun doIfOnGlobalLayoutListenersNotWorking(block: () -> Unit) {
        if (!globalOnLayoutListenersWasFixed) block()
    }
}

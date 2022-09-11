package com.connect.club.react.bridge.iosLike.ui

import android.content.Context
import android.view.MotionEvent
import android.view.ViewGroup
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.facebook.react.views.view.ReactViewGroup

class ClickableView(context: Context) : ReactViewGroup(context) {
    var onClickListener: (() -> Unit)? = null

    override fun onTouchEvent(ev: MotionEvent): Boolean {
        when (ev.action) {
            MotionEvent.ACTION_UP -> {
                if (onClickListener != null) {
                    onClickListener?.invoke()
                    return true
                }
                (context as ReactContext).getJSModule(RCTEventEmitter::class.java)
                        .receiveEvent(id, "onClick", Arguments.createMap())
                return true
            }
            else -> return super.onTouchEvent(ev)
        }
    }
}
package com.connect.club.jitsiclient.ui

import android.content.Context
import android.graphics.PixelFormat
import org.webrtc.EglBase
import org.webrtc.RendererCommon
import org.webrtc.SurfaceViewRenderer

open class SurfaceVideoView(context: Context) : SurfaceViewRenderer(context) {

    fun init(sharedContext: EglBase.Context, circleShader: Boolean) {
        if (circleShader) {
            super.init(sharedContext, null, EglBase.CONFIG_RGBA, GlCircleDrawer())
            setScalingType(RendererCommon.ScalingType.SCALE_ASPECT_FIT)
            // setZOrderMediaOverlay(true)
            // setZOrderOnTop(true)
            holder.setFormat(PixelFormat.TRANSLUCENT)
            //setEnableHardwareScaler(true)
        } else {
            super.init(sharedContext, null)
        }
    }
}

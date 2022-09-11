package com.connect.club.react.rncviews.rncsurfacevideoview.rnccirclesurfacevideoview

import com.connect.club.react.rncviews.rncsurfacevideoview.RNCSurfaceVideoVideoView
import com.connect.club.react.rncviews.rncsurfacevideoview.RNCSurfaceVideoViewBaseViewManager
import org.webrtc.EglBase

private const val REACT_CLASS = "RNCTextureVideoView"

class RNCCircleSurfaceVideoViewViewManager : RNCSurfaceVideoViewBaseViewManager() {

    override fun getName(): String = REACT_CLASS

    override fun initView(view: RNCSurfaceVideoVideoView) {
        // view.init(EglBase.create().eglBaseContext, circleShader = true)
        view.init(EglBase.create().eglBaseContext, null)
    }
}

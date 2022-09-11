package com.connect.club.react.rncviews.rncsurfacevideoview

import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp

abstract class RNCSurfaceVideoViewBaseViewManager : SimpleViewManager<RNCSurfaceVideoVideoView>() {

    override fun createViewInstance(reactContext: ThemedReactContext): RNCSurfaceVideoVideoView =
        RNCSurfaceVideoVideoView(reactContext).also { view: RNCSurfaceVideoVideoView ->
            initView(view)
        }

    abstract fun initView(view: RNCSurfaceVideoVideoView)

    @ReactProp(name = "trackId")
    fun setTrackId(view: RNCSurfaceVideoVideoView, trackId: String) {
        view.setTrackId(trackId)
    }

    @ReactProp(name = "isMirror")
    fun setIsMirror(view: RNCSurfaceVideoVideoView, isMirror: Boolean?) {
        view.setMirror(isMirror ?: false)
    }
}

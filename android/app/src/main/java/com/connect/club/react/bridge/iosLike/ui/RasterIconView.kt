package com.connect.club.react.bridge.iosLike.ui

import android.content.Context
import android.graphics.Outline
import android.view.View
import android.view.ViewOutlineProvider
import android.widget.ImageView
import androidx.appcompat.widget.AppCompatImageView
import com.bumptech.glide.Glide
import com.connect.club.BuildConfig
import com.facebook.react.views.imagehelper.ResourceDrawableIdHelper

private class CircularOutlineProvider : ViewOutlineProvider() {
    override fun getOutline(view: View, outline: Outline) {
        outline.setRoundRect(0, 0, view.width, view.height, view.width / 2f)
    }
}

private val circle = CircularOutlineProvider()
private val DEFAULT_SCALE_TYPE = ImageView.ScaleType.CENTER_INSIDE
var allReactions = mutableMapOf<String, String>()

class RasterIconView(context: Context) : AppCompatImageView(context) {

    init {
        scaleType = DEFAULT_SCALE_TYPE
    }

    fun setCircle(isCircle: Boolean) {
        outlineProvider = if (isCircle) circle else null
        clipToOutline = isCircle
    }

    fun setReactScaleType(reactScaleType: String) {
        val newScaleType = when (reactScaleType) {
            "centerInside" -> ScaleType.CENTER_INSIDE
            "fitCenter" -> ScaleType.FIT_CENTER
            else -> DEFAULT_SCALE_TYPE
        }
        this.scaleType = newScaleType
    }

    fun showImage(uri: String?) {
        showIcon(this, uri)
    }

    companion object {
        fun showIcon(view: ImageView, icon: String?) {
            icon ?: return
            if (BuildConfig.DEBUG) {
                Glide.with(view)
                        .load(icon)
                        .into(view)
                return
            }
            val id = ResourceDrawableIdHelper.getInstance().getResourceDrawableId(view.context, icon)
            view.setImageResource(id)
        }
    }
}

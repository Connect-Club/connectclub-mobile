package com.connect.club.view

import android.content.Context
import android.graphics.Typeface
import android.graphics.drawable.Drawable
import android.util.AttributeSet
import android.view.Gravity
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.TextView
import androidx.annotation.DrawableRes
import androidx.annotation.StyleableRes
import androidx.core.content.ContextCompat
import androidx.core.content.res.use
import androidx.core.view.forEach
import androidx.core.widget.TextViewCompat
import com.bumptech.glide.Glide
import com.bumptech.glide.load.DataSource
import com.bumptech.glide.load.engine.GlideException
import com.bumptech.glide.load.resource.bitmap.CircleCrop
import com.bumptech.glide.request.RequestListener
import com.bumptech.glide.request.target.Target
import com.connect.club.R
import com.connect.club.utils.replaceSize

private const val LETTERS_TEXT_SIZE_COEFFICIENT = 0.1f

class AvatarView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    @StyleableRes
    private var lettersTextAppearance: Int? = null

    private var typefaceStyle: Int? = null
    private var lettersAutoSize: Boolean = false
    private var isImageLoaded: Boolean = false
    private var isStroke: Boolean = false

    init {
        context.theme.obtainStyledAttributes(attrs, R.styleable.AvatarView, 0, 0).use {
            lettersTextAppearance = it.getResourceId(R.styleable.AvatarView_textAppearance, -1).takeIf { it != -1 }
            typefaceStyle = it.getColor(R.styleable.AvatarView_android_textStyle, -1).takeIf { it != -1 }
            lettersAutoSize = it.getBoolean(R.styleable.AvatarView_lettersAutoSize, lettersAutoSize)
            isStroke = it.getBoolean(R.styleable.AvatarView_stroke, false)
        }
    }

    private val lettersView: TextView = TextView(context).apply {
        if (isInEditMode) {
            text = "S/T"
            visibility = VISIBLE
        } else {
            visibility = GONE
        }
        gravity = Gravity.CENTER
        lettersTextAppearance?.also { TextViewCompat.setTextAppearance(this, it) }
        setTypeface(typeface, typefaceStyle ?: Typeface.BOLD)
        setTextColor(ContextCompat.getColor(context, R.color.avatarLettersColor))
    }
    private val lettersLp = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)

    private val imageView: ImageView = ImageView(context).apply {
        scaleType = ImageView.ScaleType.CENTER_CROP
        visibility = VISIBLE
    }
    private val imageLp = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT).apply {
        gravity = Gravity.CENTER
    }

    private var imageSource: ImageSource? = null

    /**
     * One of [INITIALS_MODE_AUTO], [INITIALS_MODE_DEFAULT]
     */
    var initialsMode: String = INITIALS_MODE_DEFAULT

    /** Letters for alt avatar in cases when an image avatar is absent.
     * It may be just string. */
    var lettersText: String
        get() = lettersView.text.toString()
        set(value) {
            lettersView.text = value
            if (image == null) switchToLettersMode()
        }

    /** Image source of avatar. It can be either a remote link or drawable or null */
    var image: String? = null
        set(value) {
            field = value
            imageSource = ImageSource.createFromSrc(context, value)
            updateImage()
        }

    var fontSize: Float
        set(value) {
            lettersView.textSize = value
        }
        get() = lettersView.textSize

    init {
        addView(lettersView, lettersLp)
        addView(imageView, imageLp)
        lettersView.setBackgroundResource(
            if (isStroke) R.drawable.bg_avatar_stroke else R.drawable.bg_avatar
        )
    }

    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        if (lettersAutoSize && w != 0 && h != 0 && (w != oldw || h != oldh)) {
            val minSide = minOf(w, h)
            lettersView.textSize = minSide * LETTERS_TEXT_SIZE_COEFFICIENT
        }
    }

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        super.onLayout(changed, left, top, right, bottom)
        forEach { it.layout(0, 0, right - left, bottom - top) }
    }

    private fun updateImage() {
        when (val source = imageSource) {
            is ImageSource.Remote -> {
                imageView.scaleType = ImageView.ScaleType.CENTER_CROP
                Glide.with(imageView)
                    // using common avatar size
                    .load(replaceSize(source.pattern, 500, 500))
                    .override(500, 500)
                    .transform(CircleCrop())
                    .listener(object : RequestListener<Drawable?> {
                        override fun onLoadFailed(
                            e: GlideException?,
                            model: Any?,
                            target: Target<Drawable?>?,
                            isFirstResource: Boolean
                        ) = false

                        override fun onResourceReady(
                            resource: Drawable?,
                            model: Any?,
                            target: Target<Drawable?>?,
                            dataSource: DataSource?,
                            isFirstResource: Boolean
                        ): Boolean {
                            isImageLoaded = true
                            switchToImageMode()
                            return false
                        }
                    })
                    .into(imageView)
                switchToImageMode()
            }
            is ImageSource.Drawable -> setImageRes(drawable = source.res)
            else -> switchToLettersMode()
        }
    }

    private fun setImageRes(
        @DrawableRes
        drawable: Int
    ) {
        imageView.scaleType = ImageView.ScaleType.CENTER
        imageView.setImageResource(drawable)
        switchToImageMode()
    }

    private fun switchToImageMode() {
        imageView.visibility = VISIBLE
        lettersView.visibility = when (initialsMode) {
            INITIALS_MODE_AUTO -> if (isImageLoaded) GONE else VISIBLE
            else -> VISIBLE
        }
    }

    private fun switchToLettersMode() {
        imageView.visibility = GONE
        lettersView.visibility = VISIBLE
        isImageLoaded = false
    }

    companion object {
        /** always render initials, even behind of avatar image */
        private const val INITIALS_MODE_DEFAULT = "default"

        /** hide initials once avatar image is loaded */
        private const val INITIALS_MODE_AUTO = "auto"
    }
}

private sealed class ImageSource {
    companion object {
        fun createFromSrc(context: Context, src: String?): ImageSource =
            src?.takeIf { it.isNotBlank() }?.let {
                if (it.startsWith("https://")) {
                    Remote(pattern = it)
                } else {
                    Drawable(res = context.resources.getIdentifier(it, "drawable", context.packageName))
                }
            } ?: None
    }

    data class Remote(val pattern: String) : ImageSource()
    data class Drawable(
        @DrawableRes
        val res: Int
    ) : ImageSource()

    object None : ImageSource()
}

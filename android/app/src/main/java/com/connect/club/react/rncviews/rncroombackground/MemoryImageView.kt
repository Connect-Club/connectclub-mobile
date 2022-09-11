package com.connect.club.react.rncviews.rncroombackground

import android.app.ActivityManager
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.util.AttributeSet
import android.view.View
import androidx.core.graphics.drawable.toDrawable
import com.connect.club.react.bridge.iosLike.debugP
import com.connect.club.utils.runOnMainThread
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

class MemoryImageView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    var sizeListener: ((Int, Int) -> Unit)? = null
    private var bitmap: Bitmap? = null
    private var mBitmapDrawable: BitmapDrawable? = null
    private var job: Job? = null

    fun start(bitmapSize: Int = MAX_SIZE_DEFAULT) {
        debugP("Start memory size %s", bitmapSize)
        val startSize = if (bitmapSize > 0) bitmapSize else MAX_SIZE_DEFAULT
        job?.cancel()
        job = GlobalScope.launch(Dispatchers.Default) {
            try {
                bitmap = Bitmap.createBitmap(startSize, startSize, Bitmap.Config.ARGB_8888)
                mBitmapDrawable = bitmap?.toDrawable(resources)
                runOnMainThread { invalidate() }
            } catch (e: Throwable) {
                debugP("MemoryImageView", e.message)
                start((startSize * 0.9).toInt())
            }
        }
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        job?.cancel()

    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        try {
            bitmap?.let { bmp ->
                mBitmapDrawable?.draw(canvas)
                sizeListener?.invoke(
                        (bmp.width * OOM_SAFETY_THRESHOLD).toInt(),
                        (bmp.height * OOM_SAFETY_THRESHOLD).toInt()
                )
                bmp.recycle()
            }
            bitmap = null
        } catch (e: Throwable) {
            reduceBitmap()
        }
    }

    private fun reduceBitmap() {
        bitmap?.let {
            it.width = (0.9 * it.width).toInt()
            it.height = (0.9 * it.height).toInt()
            debugP("Image memory size reduced ${it.width}x${it.height}")
            invalidate()
        }
    }

    companion object {
        private const val OOM_SAFETY_THRESHOLD = 0.8f
        private const val BASELINE_MEM_SIZE_MB = 4 * 1024f
        const val MAX_SIZE_DEFAULT = 7000

        fun getAdjustedBitmapSize(size: Int, context: Context): Int {
            val am = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
            val mi = ActivityManager.MemoryInfo()
            am.getMemoryInfo(mi)
            val scale = ((mi.totalMem / (1000*1000f)) / BASELINE_MEM_SIZE_MB).coerceIn(0.8f, 1.8f)
            debugP("device room background bitmap scale:", scale)
            println("🔦 available mem ${mi.availMem/1024/1024} / ${mi.totalMem/1024/1024}")

            return (scale * size).toInt()
        }
    }
}

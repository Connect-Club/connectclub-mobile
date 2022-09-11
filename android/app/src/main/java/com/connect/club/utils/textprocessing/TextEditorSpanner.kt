package com.connect.club.utils.textprocessing

import android.content.Context
import android.graphics.Color
import android.text.SpannableStringBuilder
import android.text.style.BackgroundColorSpan
import android.text.style.ForegroundColorSpan
import android.text.style.UnderlineSpan
import androidx.core.content.ContextCompat
import com.connect.club.R

class TextEditorSpanner(
        private val context: Context,
        var linkTextColor: Int = Color.BLUE,
        var debug: Boolean = false,
) {

    fun getSpans(textTokens: List<ParseToken>): List<SpansInfo> {
        return textTokens.mapIndexed(::handleToken).filterNotNull()
    }

    private fun handleToken(index: Int, token: ParseToken): SpansInfo? {
        if (token.type == UrlToken.TYPE) return createUrlSpan(token, token.index)

        if (!debug) return null

        val colorIndex = index % (COLORS.size - 1)
        val color = ContextCompat.getColor(context, COLORS[colorIndex])
        val alphaColor = Color.argb(0x88, Color.red(color), Color.green(color), Color.blue(color))

        return SpansInfo(
                token,
                token.index,
                token.index + token.length,
                SpannableStringBuilder.SPAN_INCLUSIVE_INCLUSIVE,
                listOf(BackgroundColorSpan(alphaColor))
        )
    }

    private fun createUrlSpan(token: ParseToken, index: Int): SpansInfo {
        return SpansInfo(
                token,
                index,
                index + token.length,
                SpannableStringBuilder.SPAN_INCLUSIVE_INCLUSIVE,
                listOf(ForegroundColorSpan(linkTextColor), UnderlineSpan())
        )
    }

    companion object {
        private val COLORS = intArrayOf(
                R.color.red_300,
                R.color.deep_purple_300,
                R.color.light_blue_300,
                R.color.green_300,
                R.color.yellow_300,
                R.color.blue_grey_300,
                R.color.pink_300,
        )
    }

    data class SpansInfo(
            val token: ParseToken,
            val start: Int,
            val end: Int,
            val inclusiveness: Int,
            val spans: List<Any>
    )
}
package com.connect.club.utils.textprocessing

class UrlToken(
        override val index: Int,
        override val text: String,
        override val sourceText: String,
        val url: String,
) : ParseToken {

    override val type: Int = TYPE

    override fun toString(): String {
        return "[UrlToken(index=$index, length=$length, text=$text)]"
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as UrlToken

        if (index != other.index) return false
        if (text != other.text) return false
        if (sourceText != other.sourceText) return false
        if (url != other.url) return false

        return true
    }

    override fun hashCode(): Int {
        var result = index
        result = 31 * result + text.hashCode()
        result = 31 * result + sourceText.hashCode()
        result = 31 * result + url.hashCode()
        return result
    }

    companion object {
        const val TYPE = 1000
    }
}
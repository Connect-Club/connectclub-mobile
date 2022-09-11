package com.connect.club.utils.textprocessing

class TextToken(
    override val index: Int,
    override val text: String
) : ParseToken {

    override val length: Int
        get() = text.length

    override val type: Int
        get() = TYPE

    override fun toString(): String {
        return "[TextToken(index=$index, length=$length, text=$text)]"
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as TextToken

        if (index != other.index) return false
        if (text != other.text) return false

        return true
    }

    override fun hashCode(): Int {
        var result = index
        result = 31 * result + text.hashCode()
        return result
    }

    companion object {
        const val TYPE = 1
    }
}
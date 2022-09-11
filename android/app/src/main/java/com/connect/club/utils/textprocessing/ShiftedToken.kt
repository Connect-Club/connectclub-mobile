package com.connect.club.utils.textprocessing

class ShiftedToken(val source: ParseToken, val shift: Int) : ParseToken by source {

    override val type: Int
        get() = source.type

    override val index: Int
        get() = source.index + shift

    override val end: Int
        get() = index + source.length

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ShiftedToken

        if (source != other.source) return false
        if (shift != other.shift) return false

        return true
    }

    override fun hashCode(): Int {
        var result = source.hashCode()
        result = 31 * result + shift
        return result
    }

    override fun toString(): String {
        return "[ShiftedToken(shift=$shift, token=$source)]"
    }
}

inline fun <reified T : ParseToken> ParseToken.unwrapped(): T {
    var unwrapped = this
    if (this is ShiftedToken) unwrapped = source
    require(unwrapped is T) { "${T::class.java} requested but ${this::class.java} unwrapped" }
    return unwrapped
}

fun ParseToken.makeShifted(shift: Int): ShiftedToken {
    if (this !is ShiftedToken) {
        return ShiftedToken(this, shift)
    }
    return ShiftedToken(this.source, this.shift + shift)
}

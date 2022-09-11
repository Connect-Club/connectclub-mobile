package com.connect.club.utils.textprocessing

internal object TokenChangeDetect {
    fun isChanged(
        tokens: List<ParseToken>,
        index: Int,
        start: Int,
        count: Int,
        after: Int
    ): Boolean {
        val token = tokens[index]
        val end = start + count

        // Text edited at end, consider a change
        if (index == tokens.size - 1 && end >= tokens.last().index) return true

        // Url edited at end
        if (token.type == UrlToken.TYPE && start + count == token.end && start >= token.index) {
            return after < count
        }
        if (start + count == token.end) return true

        val changeRange = start..end
        val tokenRange = token.index until token.end

        return tokenRange.intersect(changeRange).isNotEmpty()
    }
}

private data class Params(
    val tokens: List<ParseToken>,
    val changedTokensRange: IntRange,
    val text: String,
    val start: Int,
    val count: Int,
    val after: Int,
    val shift: Int,
)

data class ChangeState(
    val currentIndex: Int,
    val result: List<ParseToken> = listOf(),
) {
    fun withNext(token: ParseToken): ChangeState {
        return copy(result = result + listOf(token))
    }

    fun incremented(): ChangeState {
        return copy(currentIndex = currentIndex + 1)
    }
}

object TokenChangeHandler {

    private val changers: List<StateChanger> = listOf(
        TextChanger,
        TextPrepender,
        UrlChanger,
        TextAppender,
    )

    fun handleChanges(
        original: List<ParseToken>,
        changedTokensRange: IntRange,
        text: String,
        start: Int,
        count: Int,
        after: Int,
    ): List<ParseToken> {
        val shift = after - count
        val params = Params(original, changedTokensRange, text, start, count, after, shift)
        val initial = ChangeState(changedTokensRange.first)
        val finalState = params.changedTokensRange.fold(initial) { s, _ ->
            changers.fold(s) { ls, c -> c.change(params, ls) }.incremented()
        }
        return finalState.result
    }
}


private interface StateChanger {
    fun change(params: Params, state: ChangeState): ChangeState
}

private fun findPrecedingToken(params: Params, state: ChangeState): ParseToken? {
    if (state.currentIndex <= 0 || state.currentIndex > params.tokens.size) return null

    var preceding = state.result.getOrNull(state.currentIndex - 1)
    if (preceding == null) {
        preceding = params.tokens.getOrNull(state.currentIndex - 1)
    }
    return preceding
}

private object UrlChanger : StateChanger {
    override fun change(params: Params, state: ChangeState): ChangeState {
        if (params.tokens[state.currentIndex].type != UrlToken.TYPE) {
            return state
        }
        if (params.shift < 0) return applyRemoval(params, state)

        val end = params.start + params.count
        val token = params.tokens[state.currentIndex]
        if (end == token.end) {
            return state.withNext(token)
        }

        val preceding = findPrecedingToken(params, state)
        val shift = if (preceding != null) preceding.end - token.index else 0
        if (shift != 0) {
            return state.withNext(token.makeShifted(shift))
        }

        return state.withNext(token)
    }

    private fun applyRemoval(params: Params, state: ChangeState): ChangeState {
        val token = params.tokens[state.currentIndex]
        if (token.end < token.index + params.count + params.shift) return state.withNext(token)

        val changeEnd = minOf(token.end, params.start + params.count)
        val changeStart = maxOf(params.start, token.index)
        val diff = minOf(-params.shift, changeEnd - changeStart)
        if (diff >= token.length) return state

        if (token.index > params.start + params.count + params.shift) {
            return state.withNext(token.makeShifted(params.shift))
        }

        val text: String
        if (params.start < token.end) {
            text = params.text.substring(token.index, token.end - diff)
        } else {
            text = params.text.substring(token.index, changeEnd)
        }
        val sourceText = token.sourceText.replace("[${token.text}]", "[$text]")

        return state.withNext(
            UrlToken(token.index, text, sourceText, token.unwrapped<UrlToken>().url)
        )
    }
}

private object TextChanger : StateChanger {
    override fun change(params: Params, state: ChangeState): ChangeState {
        if (params.tokens[state.currentIndex].type != TextToken.TYPE) return state

        val token = params.tokens[state.currentIndex]
        val changeEnd = params.start + params.count
        if (changeEnd <= token.index && params.shift < 0) {
            if (state.currentIndex == 0 && params.shift > 0) {
                return state.withNext(TextToken(0, params.text.substring(0, token.end + params.shift)))
            }

            val preceding = findPrecedingToken(params, state)
            if (preceding == null || preceding.type == TextToken.TYPE) {
                return state.withNext(token.makeShifted(params.shift))
            }
            val newText = params.text.substring(
                token.index + params.shift,
                token.end + params.shift
            )

            return state.withNext(TextToken(token.index + params.shift, newText))
        }

        val end = token.end + params.shift
        if (end <= token.index) return state
        val newText = params.text.substring(token.index, end)
        val newToken = TextToken(token.index, newText)

        return state.withNext(newToken)
    }
}

private object TextPrepender : StateChanger {
    override fun change(params: Params, state: ChangeState): ChangeState {
        if (params.start > 0
            || params.shift <= 0
            || params.tokens[state.currentIndex].type == TextToken.TYPE
            || params.changedTokensRange.first < state.currentIndex
        ) return state

        return state.withNext(TextToken(0, params.text.substring(0, params.count + params.after)))
    }
}


private object TextAppender : StateChanger {
    override fun change(params: Params, state: ChangeState): ChangeState {
        if (params.start == 0
            || params.shift <= 0
            || params.tokens[state.currentIndex].type == TextToken.TYPE
            || params.changedTokensRange.last > state.currentIndex
        ) return state
        val index = params.tokens[state.currentIndex].end
        if (params.start + params.after < index) return state
        val token = TextToken(index, params.text.substring(index))

        return state.withNext(token)
    }
}

package com.connect.club.utils.textprocessing

import android.text.Editable
import android.text.Selection
import android.text.TextWatcher
import android.text.style.ForegroundColorSpan
import android.text.style.UnderlineSpan
import com.connect.club.view.EnhancedTextEdit
import io.intercom.android.sdk.utilities.SimpleTextWatcher

class TextEditor(
        private val parser: TextParser,
        private val spanner: TextEditorSpanner,
        private val delegate: TextWatcher? = null
) : SimpleTextWatcher() {

    val tokens: List<ParseToken>
        get() = textTokens

    var onUrlSelected: ((UrlToken) -> Unit)? = null

    private val textTokens = mutableListOf<ParseToken>()
    private val changedTokensInfo = mutableListOf<Pair<Int, ParseToken>>()
    private var changedStart = -1
    private var changedCount = -1
    private var changedCountAfter = -1
    private var isTextSet = false

    fun setRawText(view: EnhancedTextEdit, text: String) {
        view.removeTextChangedListener(this)
        view.setText("")
        view.addTextChangedListener(this)
        view.onSelectionChangeListener = ::onSelectionChanged
        textTokens.clear()
        textTokens.addAll(parser.parse(text))
        val formatted = textTokens.joinToString(separator = "", transform = {it.text})
        isTextSet = false
        view.setText(formatted)
    }

    fun getRawText(): String {
        return tokens.joinToString(separator = "", transform = {it.sourceText})
    }

    fun findTokenAtIndex(index: Int): ParseToken? {
        return textTokens.firstOrNull { index >= it.index && index < it.end }
    }

    private fun onSelectionChanged(textEdit: EnhancedTextEdit, start: Int, end: Int) {
        if (start == 0 || end - start != 0) return
        val selectedToken = textTokens.firstOrNull {
            start >= it.index && start < it.end
        } ?: return
        if (selectedToken.type != UrlToken.TYPE) return
        if (start == selectedToken.index || end == selectedToken.end) return
        textEdit.setSelection(selectedToken.end)
        textEdit.post {
            Selection.extendSelection(textEdit.text, selectedToken.index)
            onUrlSelected?.invoke(selectedToken.unwrapped())
        }
    }

    private fun shiftTokenIndices(
            tokens: MutableList<ParseToken>,
            immutableTokens: List<ParseToken>,
            tokenPosition: Int,
            shift: Int
    ) {
        if (tokens.isEmpty() || shift == 0) {
            return
        }

        val shiftedRange = if (shift > 0) {
            (tokenPosition until tokens.size)
        } else {
            (tokenPosition until tokens.size).reversed()
        }

        for (index in shiftedRange) {
            val token = tokens[index]

            if (immutableTokens.contains(token)) {
                continue
            }

            tokens.removeAt(index)

            if (token is ShiftedToken) {
                tokens.add(index, ShiftedToken(token.source, shift + token.shift))

            } else {
                tokens.add(index, ShiftedToken(token, shift))
            }
        }
    }

    override fun afterTextChanged(s: Editable) {
        if (changedCount == changedCountAfter) {
            return
        }

        try {
            if (!isTextSet) {
                isTextSet = true
                if (textTokens.isEmpty()) {
                    // add first token/s
                    textTokens.addAll(parser.parse(s.toString()))
                }
                updateSpans(s)
                return
            }
            // handle changes
            val changedTokens = changedTokensInfo.map { it.second }

            // Get original change [start, end)
            val startTokenInfo = changedTokensInfo.minByOrNull { it.second.index }!!
            val positionShift = changedCountAfter - changedCount
            val endTokenInfo = changedTokensInfo.maxByOrNull { (it.second.index + it.second.length) }!!
            // val tokenChangeEnd = endTokenInfo.second.index + endTokenInfo.second.length
            // val changeEnd = tokenChangeEnd + positionShift

            // shift
            shiftTokenIndices(
                textTokens,
                changedTokens,
                startTokenInfo.first,
                positionShift
            )
            val newTokens = TokenChangeHandler.handleChanges(
                textTokens,
                startTokenInfo.first..endTokenInfo.first,
                s.toString(),
                changedStart,
                changedCount,
                changedCountAfter
            )
            // Remove changed tokens
            changedTokensInfo.forEach { textTokens.remove(it.second) }

            // insert updated tokens
            if (positionShift != 0) {
                val startIndex = startTokenInfo.first
                textTokens.addAll(startIndex, newTokens)
            }

            updateSpans(s)

            if (textTokens.isEmpty()) {
                isTextSet = false
            }
        } finally {
            delegate?.afterTextChanged(s)
        }
    }

    override fun beforeTextChanged(s: CharSequence, start: Int, count: Int, after: Int) {
        changedTokensInfo.clear()
        changedStart = start
        changedCount = count
        changedCountAfter = after

        if (textTokens.isEmpty()) {
            delegate?.beforeTextChanged(s, start, count, after)
            return
        }

        for (i in 0 until textTokens.size) {
            if (TokenChangeDetect.isChanged(tokens, i, start, count, after)) {
                changedTokensInfo.add(Pair(i, textTokens[i]))
            }
        }

        check(changedTokensInfo.isNotEmpty()) {
            "unable to recognize changed tokens; start: $start count: $count after: $after"
        }

        delegate?.beforeTextChanged(s, start, count, after)
    }

    override fun onTextChanged(s: CharSequence, start: Int, before: Int, count: Int) {
        delegate?.onTextChanged(s, start, before, count)
    }

    private fun updateSpans(s: Editable) {
        s.getSpans(0, s.length, ForegroundColorSpan::class.java).forEach { s.removeSpan(it) }
        s.getSpans(0, s.length, UnderlineSpan::class.java).forEach { s.removeSpan(it) }

        val spans = spanner.getSpans(textTokens)
        spans.forEach { spanInfo ->
            spanInfo.spans.forEach { span ->
                s.setSpan(span, spanInfo.start, spanInfo.end, spanInfo.inclusiveness)
            }
        }
    }
}

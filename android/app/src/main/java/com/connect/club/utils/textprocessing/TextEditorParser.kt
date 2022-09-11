package com.connect.club.utils.textprocessing

class TextEditorParser : TextParser {

    override fun parse(text: String): List<ParseToken> {
        if (text.isEmpty()) {
            return listOf()
        }

        val result = ArrayList<ParseToken>()
        val tokens = MarkdownLinkParser.parse(text)
        var srcLength = 0
        var dstLength = 0
        var index = 0

        do {
            val token = tokens.getOrNull(index)

            if (token == null) {
                result.add(TextToken(dstLength, text.substring(srcLength)))
                break
            }

            if (token.index > dstLength) {
                val substring = text.substring(srcLength, token.index)
                result.add(TextToken(dstLength, substring))
            }

            result.add(token)

            srcLength = token.index + token.sourceLength
            dstLength = token.index + token.length
            index ++

        } while (srcLength < text.length)

        adjustIndices(result)

        return result
    }

    private fun adjustIndices(tokens: MutableList<ParseToken>) {
        var startIndex = 0
        for (index in tokens.indices) {
            var token = tokens[index]
            if (token.index > startIndex) {
                token = ShiftedToken(token, startIndex - token.index)
            }
            startIndex = token.index + token.length
            tokens[index] = token
        }
    }
}
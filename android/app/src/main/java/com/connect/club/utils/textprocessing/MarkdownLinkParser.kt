package com.connect.club.utils.textprocessing

import java.util.regex.Pattern

object MarkdownLinkParser : TextParser {

    private const val MARKDOWN_URL_FULL_REGEX  = "\\[(?<text>[^]]*)]\\((?<link>[^)]*)\\)"

    private val markdownLinkPattern by lazy(LazyThreadSafetyMode.NONE) {
        Pattern.compile(MARKDOWN_URL_FULL_REGEX)
    }

    override fun parse(text: String): List<ParseToken> {
        if (text.isEmpty()) {
            return emptyList()
        }

        val matcher = markdownLinkPattern.matcher(text)
        var result: ArrayList<ParseToken>? = null
        while (matcher.find()) {
            if (result == null) result = arrayListOf()
            val start = matcher.start()
            val end = matcher.end()
            val linkSourceText = text.substring(start, end)
            val linkName = matcher.group(1)!!
            val linkUrl = matcher.group(2)!!
            result.add(UrlToken(start, linkName, linkSourceText, linkUrl))
        }

        return result ?: emptyList()
    }
}
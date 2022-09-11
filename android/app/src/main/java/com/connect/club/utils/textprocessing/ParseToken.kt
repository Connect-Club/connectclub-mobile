package com.connect.club.utils.textprocessing

interface ParseToken {
    val index: Int
    val text: String

    val type: Int
        get() = -1

    val length: Int
        get() = text.length

    val end: Int
        get() = index + length

    val sourceText: String
        get() = text

    val sourceLength: Int
        get() = sourceText.length
}
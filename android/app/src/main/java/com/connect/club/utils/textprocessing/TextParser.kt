package com.connect.club.utils.textprocessing

interface TextParser {
    fun parse(text: String): List<ParseToken>
}
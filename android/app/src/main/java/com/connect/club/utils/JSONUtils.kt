package com.connect.club.utils

import org.json.JSONArray
import org.json.JSONObject

inline fun JSONArray.forEach(consumer: (JSONObject) -> Unit) {
    var index = 0
    val length = length()
    while (index < length) {
        val state = getJSONObject(index)
        index += 1
        consumer(state)
    }
}

inline fun <T> JSONArray.map(mapper: JSONArray.(index: Int) -> T): List<T> {
    if (length() == 0) return emptyList()
    var index = 0
    val length = length()
    val result = mutableListOf<T>()
    while (index < length) {
        val entry = mapper(this, index)
        index += 1
        result.add(entry)
    }
    return result
}

fun JSONArray.contains(entry: String): Boolean {
    var index = 0
    val length = length()
    while (index < length) {
        val item = get(index).toString()
        if (item == entry) return true
        index += 1
    }
    return false
}
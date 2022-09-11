package com.connect.club.react.bridge.iosLike.ui.go

import android.content.Context
import common.PublicStorage

class GoAsyncStorage(context: Context) : PublicStorage {
    private val storage = context.getSharedPreferences("App", Context.MODE_PRIVATE)

    init {
        _instance = this
    }

    override fun delete(key: String) {
        storage.edit().remove(key).apply()
    }

    override fun getString(key: String): String {
        return storage.getString(key, "")!!
    }

    override fun setString(key: String, value: String?) {
        storage.edit().putString(key, value).apply()
    }

    companion object {
        private var _instance: GoAsyncStorage? = null
        val instance: GoAsyncStorage
            get() {
                return _instance!!
            }
    }
}

package com.connect.club.react.bridge.iosLike.ui.go

import android.os.Build
import com.connect.club.BuildConfig
import com.connect.club.react.bridge.iosLike.debugP
import com.connect.club.react.bridge.iosLike.LogUtil
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import common.Common
import common.PublicHttpClient
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch

private const val AMPLITUDE_SESSION_ID = "amplitudeSessionId"
private const val AMPLITUDE_DEVICE_ID = "amplitudeDeviceId"

class HttpClient(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "HttpClient"

    private val goAsyncStorage: GoAsyncStorage
    private var httpClient: PublicHttpClient? = null

    init {
        goAsyncStorage = GoAsyncStorage(reactContext)
        goAsyncStorage.delete(AMPLITUDE_SESSION_ID)
        goAsyncStorage.delete(AMPLITUDE_DEVICE_ID)
        Common.setStorage(goAsyncStorage)
    }

    @ReactMethod
    fun initialize(endpoint: String, promise: Promise) {
        debugP("HttpClient.initialize")
        httpClient = Common.httpClient(
                endpoint,
                "android",
                BuildConfig.VERSION_NAME,
                BuildConfig.VERSION_CODE.toString(),
                Build.VERSION.SDK_INT.toString()
        )
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.N) {
            Common.insecureHttpTransport()
        }
        promise.resolve(true)
    }

    @ReactMethod
    fun setAmplitudeIds(sessionId: String, deviceId: String) {
        goAsyncStorage.setString(AMPLITUDE_SESSION_ID, sessionId)
        goAsyncStorage.setString(AMPLITUDE_DEVICE_ID, deviceId)
    }

    @ReactMethod
    fun isAuthorized(promise: Promise) {
        promise.resolve(goAsyncStorage.getString("accessToken").isNotEmpty())
    }

    @ReactMethod
    fun queryAuthorize(
        query: String,
        promise: Promise
    ) {
        GlobalScope.launch {
            val response = httpClient!!.authorize(query)
            promise.resolve(response)
        }
    }

    @ReactMethod
    fun request(
            endpoint: String,
            method: String,
            useAuthorizeHeader: Boolean,
            generateJwt: Boolean,
            query: String?,
            body: String?,
            file: String?,
            promise: Promise
    ) {
        GlobalScope.launch {
            val response = httpClient!!.getRequest(endpoint, method, useAuthorizeHeader, generateJwt, query, body, "photo", "photo", file)
            promise.resolve(response)
        }
    }

    @ReactMethod
    fun sendLogFile(body: String, promise: Promise) {
        GlobalScope.launch {
            val logInfo = "${LogUtil.getDeviceInfoBody()}\n${body}"
            val response = httpClient!!.sendLogFileWithBodyText(logInfo)
            promise.resolve(response)
        }
    }

    @ReactMethod
    fun sendPreservedLogFile(body: String, promise: Promise) {
        GlobalScope.launch {
            val logInfo = "(Error) ${LogUtil.getDeviceInfoBody()}\n${body}"
            val response = httpClient!!.sendLogFileWithPath(LogUtil.preservedLogFilePath, logInfo)
            promise.resolve(response)
        }
    }
}

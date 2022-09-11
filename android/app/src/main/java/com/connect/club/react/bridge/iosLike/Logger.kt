package com.connect.club.react.bridge.iosLike

import android.os.Build
import com.bugsnag.android.Event
import com.bugsnag.android.Severity
import com.connect.club.App
import com.connect.club.BuildConfig
import com.connect.club.react.bridge.iosLike.ui.go.GoAsyncStorage
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import common.Common
import common.PublicLogger
import java.io.File
import java.util.*

enum class LogLevel(val level: String) {
    TRACE("trace"),
    DEBUG("debug"),
    INFO("info"),
    WARN("warning"),
    ERROR("error");

    companion object {
        fun fromStringLevel(level: String): LogLevel {
            for (item in LogLevel.values()) {
                if (item.level == level) return item
            }
            if (BuildConfig.DEBUG) {
                throw IllegalArgumentException("unknown log level $level")
            }
            return DEBUG
        }
    }
}

inline fun debugLazy(string: String?, log: () -> String) {
    _goAndroidLogger.debug("$string ${log()} |${Thread.currentThread().name}")
}

fun debugP(string: String?, vararg args: Any?) {
    _goAndroidLogger.debug("$string ${args.joinToString(", ")} |${Thread.currentThread().name}")
}

@Suppress("ObjectPropertyName")
val _goAndroidLogger: PublicLogger by lazy { Common.newLogger("ANDROID") }

@Suppress("ObjectPropertyName")
val _goJsLogger: PublicLogger by lazy { Common.newLogger("JS") }

object LogUtil {
    const val LOG_FILE_NAME = "goLogFile.txt"
    const val PRESERVED_LOG_FILE_NAME = "preserved.log"

    val logsDirPath: String
        get() = App.appContext.filesDir.absolutePath

    val logFilePath: String
        get() = "${logsDirPath}/${LOG_FILE_NAME}"

    val preservedLogFilePath: String
        get() = "${logsDirPath}/${PRESERVED_LOG_FILE_NAME}"

    fun attachLogToBugsnag(event: Event) {
        if (event.severity !== Severity.ERROR) return
        if (event.getMetadata("log") != null) {
            debugP("native attachLogToBugsnagreport already prepared")
            return
        }
        val id = UUID.randomUUID().toString()
        debugP("native attachLogToBugsnag, prepare report, id:", id)
        GoAsyncStorage.instance.setString("bugsnagReportId", id)
        event.addMetadata("log", "id", id)
        Common.preserveLogFile(logsDirPath, PRESERVED_LOG_FILE_NAME)
        debugP("native attachLogToBugsnag preserved log file")
    }

    fun getDeviceInfoBody(): String {
        return "Android ${Build.VERSION.RELEASE} (${Build.VERSION.SDK_INT}) ${Build.BRAND} ${Build.MODEL} ${BuildConfig.VERSION_NAME} (${BuildConfig.VERSION_CODE})"
    }
}

class Logger(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "Logger"

    init {
        Common.initLoggerFile(LogUtil.logsDirPath, LogUtil.LOG_FILE_NAME)
    }

    @ReactMethod
    fun logJS(message: String, level: String) {
        val msg = "$message |${Thread.currentThread().name}"
        when (LogLevel.fromStringLevel(level)) {
            LogLevel.TRACE -> _goJsLogger.trace(msg)
            LogLevel.DEBUG -> _goJsLogger.debug(msg)
            LogLevel.INFO -> _goJsLogger.info(msg)
            LogLevel.WARN -> _goJsLogger.warn(msg)
            LogLevel.ERROR -> _goJsLogger.error(msg)
        }
    }
}

package com.connect.club

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.os.bundleOf
import com.sergeymild.event_dispatcher.EventDispatcher
import kotlinx.coroutines.*

private const val ROOM_SERVICE_CHANNEL_ID = "ROOM_SERVICE_CHANNEL"
private const val ONGOING_NOTIFICATION_ID = 1

class RoomService : Service() {

    companion object {
        var isDisconnectByUser = false

        private const val NOTIFICATION_ACTION_EXTRAS_KEY = "NOTIFICATION_ACTION"
        private const val TAG = "RoomService"

        fun start(context: Context) {
            context.startService(Intent(context, RoomService::class.java))
        }

        fun stop(context: Context) {
            isDisconnectByUser = true
            context.stopService(Intent(context, RoomService::class.java))
        }
    }

    enum class NotificationAction {
        RETURN;
    }

    private var isForegroundStarted: Boolean = false
    private lateinit var scope: CoroutineScope

    override fun onCreate() {
        super.onCreate()
        scope = CoroutineScope(Dispatchers.Main.immediate + SupervisorJob() + CoroutineName("RoomService"))
        EventDispatcher.register(this)
    }

    override fun onDestroy() {
        super.onDestroy()
        scope.cancel()
        if (!isDisconnectByUser) {
            android.os.Process.killProcess(android.os.Process.myPid())
        }
        isDisconnectByUser = false
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        makeForeground()
        return super.onStartCommand(intent, flags, startId)
    }

    private fun makeForeground() = scope.launch {
        if (isForegroundStarted) return@launch

        createChannel()
        val pendingIntent = PendingIntent.getActivity(
            this@RoomService,
            0,
            Intent(this@RoomService, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE,
            bundleOf(NOTIFICATION_ACTION_EXTRAS_KEY to NotificationAction.RETURN.ordinal)
        )
        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this@RoomService, ROOM_SERVICE_CHANNEL_ID)
        } else {
            Notification.Builder(this@RoomService)
        }
        val notification: Notification = builder.setContentTitle(getText(R.string.room_service_notification_title))
            .setContentText(getText(R.string.room_service_notification_message))
            .setSmallIcon(R.drawable.ic_mic_on)
            .setContentIntent(pendingIntent)
            .build()

        startForeground(ONGOING_NOTIFICATION_ID, notification)
        isForegroundStarted = true
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = getString(R.string.service_notifications_channel_name)
            val descriptionText = getString(R.string.service_notifications_channel_description)
            val channel = NotificationChannel(ROOM_SERVICE_CHANNEL_ID, name, NotificationManager.IMPORTANCE_LOW)
            channel.description = descriptionText
            val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }
}

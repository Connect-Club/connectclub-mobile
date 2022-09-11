package com.connect.club.messaging

import android.content.Context
import android.content.Intent
import com.connect.club.react.bridge.iosLike.debugP
import com.google.firebase.messaging.RemoteMessage
import io.intercom.android.sdk.push.IntercomPushClient
import io.invertase.firebase.messaging.ReactNativeFirebaseMessagingReceiver

class AppMessagingReceiver : ReactNativeFirebaseMessagingReceiver() {

    val intercomPushClient = IntercomPushClient()

    override fun onReceive(context: Context, intent: Intent) {
        debugP("AppMessagingReceiver received intent")
        val data = intent.extras
        if (data != null && intercomPushClient.isIntercomPush(data)) return
        super.onReceive(context, intent)
    }
}
package com.connect.club.messaging

import android.util.Log
import com.connect.club.App
import com.connect.club.react.bridge.iosLike.debugP
import com.google.firebase.messaging.RemoteMessage
import io.intercom.android.sdk.push.IntercomPushClient
import io.invertase.firebase.messaging.ReactNativeFirebaseMessagingService

class AppFirebaseMessagingService : ReactNativeFirebaseMessagingService() {

    private val intercomPushClient = IntercomPushClient()

    override fun onNewToken(token: String) {
        debugP("AppFirebaseMessagingService", "onNewToken")
        super.onNewToken(token)
        intercomPushClient.sendTokenToIntercom(App.appContext, token)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        debugP("AppFirebaseMessagingService", "received message")
        if (intercomPushClient.isIntercomPush(remoteMessage.data)) {
            debugP("AppFirebaseMessagingService", "pass message to Intercom")
            intercomPushClient.handlePush(App.appContext, remoteMessage.data)
            return
        }
        debugP("AppFirebaseMessagingService", "handle message")
        super.onMessageReceived(remoteMessage)
    }
}
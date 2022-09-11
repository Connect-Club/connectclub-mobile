package com.connect.club;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.telephony.TelephonyManager;

import com.sergeymild.event_dispatcher.EventDispatcher;

import org.jetbrains.annotations.NotNull;

public class PhoneStateReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, @NotNull Intent intent) {
        String state = intent.getStringExtra(TelephonyManager.EXTRA_STATE);
        if (state.equals(TelephonyManager.EXTRA_STATE_RINGING) || state.equals(TelephonyManager.EXTRA_STATE_OFFHOOK)) {
            EventDispatcher.post("incomingCall");
        }

        if (state.equals(TelephonyManager.EXTRA_STATE_IDLE)) {
            EventDispatcher.post("endCall");
        }
    }
}

package com.connect.club

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.View
import android.view.Window
import android.view.WindowManager
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.core.view.doOnLayout
import com.connect.club.videocommunication.AudioFocusManager
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.ReactRootView
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView
import com.zoontek.rnbootsplash.RNBootSplash
import io.branch.rnbranch.RNBranchModule

class MainActivity : ReactActivity() {
    companion object {
        var instance: MainActivity? = null
            get
            private set
        lateinit var audioFocusManager: AudioFocusManager
            get
            private set
    }

    override fun getMainComponentName(): String {
        return "connectreactive"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(null)
        instance = this
        audioFocusManager = AudioFocusManager(this)
        RNBranchModule.getAutoInstance(this)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            window.statusBarColor = 0
        }
    }

    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return object : ReactActivityDelegate(this, mainComponentName) {
            override fun createRootView(): ReactRootView {
                RNBootSplash.init(this@MainActivity)
                return RNGestureHandlerEnabledRootView(this@MainActivity)
            }
        }
    }

    override fun onStart() {
        super.onStart()
        RNBranchModule.initSession(intent.data, this)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        RNBranchModule.onNewIntent(intent)
    }

    override fun onDestroy() {
//        RoomService.stop(this)
        super.onDestroy()
        instance = null
    }
}

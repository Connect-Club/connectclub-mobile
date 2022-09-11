package com.connect.club.react.bridge.iosLike

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.os.Build

typealias Listener = (isOffline: Bool) -> Unit



class NetworkReachabilityManager: ConnectivityManager.NetworkCallback() {
    var listener: Listener? = null

    fun startListening(context: Context) {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            connectivityManager.registerDefaultNetworkCallback(this)
        } else {
            val request = NetworkRequest.Builder()
                    .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET).build()
            connectivityManager.registerNetworkCallback(request, this)
        }
    }

    fun stop(context: Context) {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        try {
            connectivityManager.unregisterNetworkCallback(this)
        } catch (e: Exception) {
            /* no-op */
        }
    }


    override fun onAvailable(network: Network) {
        listener?.invoke(false)
    }

    override fun onLost(network: Network) {
        listener?.invoke(true)
    }
}

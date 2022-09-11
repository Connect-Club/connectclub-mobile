package com.connect.club.react.bridge.iosLike

import org.webrtc.DataChannel
import java.lang.ref.WeakReference

interface RTCDataChannelDelegate {
    fun dataChannel(dataChannel: RTCDataChannel, buffer: RTCDataBuffer)
}

class AppDataChannelDelegate(
        private val delegate: WeakReference<RTCDataChannelDelegate>,
        private val dataChannel: WeakReference<RTCDataChannel>
) : DataChannel.Observer {


    override fun onBufferedAmountChange(p0: Long) {}
    override fun onStateChange() {}

    override fun onMessage(buffer: DataChannel.Buffer?) {
        val dataChannel = dataChannel.get() ?: return
        val buffer = buffer ?: return
        delegate.get()?.dataChannel(dataChannel, buffer)
    }
}
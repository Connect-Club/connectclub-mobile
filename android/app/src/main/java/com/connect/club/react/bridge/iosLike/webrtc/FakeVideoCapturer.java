package com.connect.club.react.bridge.iosLike.webrtc;

import android.content.Context;
import android.os.SystemClock;

import org.webrtc.CapturerObserver;
import org.webrtc.JavaI420Buffer;
import org.webrtc.SurfaceTextureHelper;
import org.webrtc.VideoCapturer;
import org.webrtc.VideoFrame;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

public class FakeVideoCapturer implements VideoCapturer {

    private final static String TAG = "RTCFileVideoCapturer";
    private CapturerObserver capturerObserver;
    private final ScheduledExecutorService executorService = Executors.newSingleThreadScheduledExecutor();
    private ScheduledFuture<?> tickFuture = null;

    public void tick(int width, int height) {
        VideoFrame videoFrame = new VideoFrame(
                JavaI420Buffer.allocate(width, height),
                0 /* rotation */,
                TimeUnit.MILLISECONDS.toNanos(SystemClock.elapsedRealtime())
        );
        capturerObserver.onFrameCaptured(videoFrame);
        videoFrame.release();
    }

    @Override
    public void initialize(SurfaceTextureHelper surfaceTextureHelper, Context applicationContext,
                           CapturerObserver capturerObserver) {
        this.capturerObserver = capturerObserver;
    }

    @Override
    public void startCapture(int width, int height, int framerate) {
        if (tickFuture == null) {
            tickFuture = executorService.scheduleAtFixedRate(() -> this.tick(width, height), 0, 1000 / framerate, TimeUnit.MILLISECONDS);
        }
    }

    @Override
    public void stopCapture() throws InterruptedException {
        if (tickFuture != null) {
            tickFuture.cancel(false);
            tickFuture = null;
        }
    }

    @Override
    public void changeCaptureFormat(int width, int height, int framerate) {
        // Empty on purpose
    }

    @Override
    public void dispose() {

    }

    @Override
    public boolean isScreencast() {
        return false;
    }
}


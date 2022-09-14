/* eslint-disable @typescript-eslint/no-unused-vars */
import {logJS} from '../../../src/components/screens/room/modules/Logger'

import {appEventEmitter} from '../../../src/appEventEmitter'

interface Meta {
  [userId: string]: {video: string; audio: string}
}

interface JvbusterDelegate {
  initializeRTCPeerConnection(
    userId: string,
    id: string,
    isMain: boolean,
    sdpOffer: string,
  ): Promise<string>
  setLocalRTCPeerConnectionDescription(
    id: string,
    description: string,
  ): Promise<void>
  sendMessageToDataChannel(id: string, message: string): void
  processMetaAdd(meta: Meta): void
  processMetaRemove(meta: Meta): void
  onJvBusterError(error: string): void
}

export interface Cnnct {
  SetJvbusterDelegate(jvbusterDelegate: JvbusterDelegate): void
  JvBusterStart(address: string, token: string, speaker: boolean): void
  SetJitsiConnected(isConnected: boolean): void
  PeerConnectionDidChangeState(id: string, state: number): void
  DataChannelDidReceiveMessageWith(id: string, message: string): void
  DisconnectFromJitsi(): void
  IsThereOtherAdmin(): boolean
  Hands(): string[]
  Admins(): string[]
  UpdateAudioVideoState(data: {
    videoEnabled: boolean
    audioEnabled: boolean
  }): void
  UpdateAudioLevel(level: number): void
}

const stateRawValue: {[state: string]: number} = {
  new: 0,
  connecting: 1,
  connected: 2,
  disconnected: 3,
  failed: 4,
  closed: 5,
}

/**
 * Global cnnct variable is initialized in public/index.html when Go WASM is loaded
 */
declare var cnnct: Cnnct

export class Jvbuster implements JvbusterDelegate {
  private readonly peerConnections: Map<string, RTCPeerConnection> = new Map()
  private videoSender: RTCRtpSender | null = null
  private audioSender: RTCRtpSender | null = null
  private readonly dataChannels: Map<string, RTCDataChannel> = new Map()
  private readonly onStreams: (streams: MediaStream[]) => void
  private readonly streams: Map<string, MediaStream> = new Map()
  private blackSilenceStream: MediaStream | null = null
  private static readonly AUDIO_LEVEL_MAX_VALUE = 32767
  private audioLevelUpdateTimer: number = 0

  constructor(onStreams: (streams: MediaStream[]) => void) {
    cnnct.SetJvbusterDelegate(this)

    this.onStreams = onStreams
  }

  public start(address: string, token: string, speaker: boolean): void {
    cnnct.JvBusterStart(address, token, speaker)

    if (speaker && this.blackSilenceStream === null) {
      this.blackSilenceStream = new MediaStream([black(), silence()])
    }
  }

  stop(): void {
    this.peerConnections.forEach((x) => x.close())
    this.peerConnections.clear()

    this.dataChannels.forEach((x) => x.close())
    this.dataChannels.clear()

    // TODO: stop sending volume
  }

  public async setLocalAudioTrack(
    track: MediaStreamTrack | null,
  ): Promise<void> {
    if (this.audioSender == null) {
      return
    }

    if (track === null) {
      track = this.blackSilenceStream!.getAudioTracks()[0]
    }

    await this.audioSender.replaceTrack(track)
  }

  public async setLocalVideoTrack(
    track: MediaStreamTrack | null,
  ): Promise<void> {
    if (this.videoSender == null) {
      return
    }

    if (track === null) {
      track = this.blackSilenceStream!.getVideoTracks()[0]
    }

    await this.videoSender.replaceTrack(track)
  }

  // JvbusterDelegate
  async initializeRTCPeerConnection(
    userId: string,
    id: string,
    isMain: boolean,
    sdpOffer: string,
  ): Promise<string> {
    if (this.peerConnections.has(id)) {
      const pc = this.peerConnections.get(id)
      await pc?.setRemoteDescription({type: 'offer', sdp: sdpOffer})
      const answer = await pc?.createAnswer()
      return answer?.sdp || ''
    }

    const peerConnection = new RTCPeerConnection()

    if (isMain && this.blackSilenceStream !== null) {
      this.audioSender = peerConnection.addTrack(
        this.blackSilenceStream.getAudioTracks()[0],
        this.blackSilenceStream,
      )

      this.videoSender = peerConnection.addTrack(
        this.blackSilenceStream.getVideoTracks()[0],
        this.blackSilenceStream,
      )

      this.audioLevelUpdateTimer = setInterval(async () => {
        if (this.audioSender === null || this.audioSender.track === null) return
        const stats = await peerConnection.getStats(this.audioSender.track)
        const audioLevel =
          [...stats.values()]
            .filter((stat) => stat.type === 'media-source')
            .map((stat) => stat.audioLevel)[0] || 0
        cnnct.UpdateAudioLevel(audioLevel * Jvbuster.AUDIO_LEVEL_MAX_VALUE)
      }, 1000)
    }

    peerConnection.addEventListener('datachannel', ({channel}) => {
      this.dataChannels.set(id, channel)

      channel.addEventListener('message', ({data}) => {
        cnnct.DataChannelDidReceiveMessageWith(id, data)
      })
    })

    peerConnection.addEventListener('connectionstatechange', () => {
      if (
        peerConnection.connectionState === 'closed' ||
        peerConnection.connectionState === 'failed'
      ) {
        cnnct.SetJitsiConnected(false)
        if (this.audioLevelUpdateTimer > 0) {
          clearInterval(this.audioLevelUpdateTimer)
          this.audioLevelUpdateTimer = 0
        }
      }

      if (peerConnection.connectionState === 'connected') {
        cnnct.SetJitsiConnected(true)
      }

      cnnct.PeerConnectionDidChangeState(
        id,
        stateRawValue[peerConnection.connectionState],
      )
    })

    peerConnection.addEventListener('track', (event) => {
      event.streams.forEach((stream) => this.streams.set(stream.id, stream))
    })

    this.peerConnections.set(id, peerConnection)

    await peerConnection.setRemoteDescription({type: 'offer', sdp: sdpOffer})
    const answer = await peerConnection.createAnswer()
    return answer.sdp || ''
  }

  onJvBusterError(error: string): void {
    if (error === 'expired') {
      appEventEmitter.trigger('finishRoom')
      return
    } else {
      // TODO: investigate types of errors
      // appEventEmitter.trigger('finishRoom')
      // alert('Error!', error, [{text: 'Close', style: 'cancel'}])
    }
  }

  processMetaAdd(meta: Meta): void {
    const streams: MediaStream[] = []
    for (const userId of Object.keys(meta)) {
      const stream = this.streams.get(userId)
      if (stream) {
        streams.push(stream)
      }
    }

    this.onStreams(streams)
  }

  processMetaRemove(meta: Meta): void {}

  sendMessageToDataChannel(id: string, message: string): void {
    const dataChannel = this.dataChannels.get(id)
    dataChannel?.send(message)
  }

  async setLocalRTCPeerConnectionDescription(
    id: string,
    description: string,
  ): Promise<void> {
    const peerConnection = this.peerConnections.get(id)
    await peerConnection?.setLocalDescription({
      type: 'answer',
      sdp: description,
    })
  }
}

let silence = (): MediaStreamTrack => {
  const ctx = new AudioContext(),
    oscillator = ctx.createOscillator()
  const dst = oscillator.connect(ctx.createMediaStreamDestination())
  oscillator.start()
  // @ts-ignore
  return Object.assign(dst.stream.getAudioTracks()[0], {enabled: false})
}

let black = ({width = 640, height = 480} = {}): MediaStreamTrack => {
  const canvas = Object.assign(document.createElement('canvas'), {
    width,
    height,
  })
  // @ts-ignore
  canvas.getContext('2d').fillRect(0, 0, width, height)
  // @ts-ignore
  const stream = canvas.captureStream()
  return Object.assign(stream.getVideoTracks()[0], {enabled: false})
}

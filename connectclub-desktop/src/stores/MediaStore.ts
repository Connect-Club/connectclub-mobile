import {makeAutoObservable, observable, runInAction} from 'mobx'

import {
  LocalMediaState,
  MediaState,
} from '../../../src/components/screens/room/models/localModels'

import {Cnnct, Jvbuster} from '../services/Jvbuster'

declare var cnnct: Cnnct

type UserMediaStreams = {
  [userId: string]: MediaStream
}

interface RoomParams {
  readonly jitsiServerUrl: string
  readonly token: string
  readonly videoWidth: number
  readonly videoHeight: number
}

export const SCREEN_SHARING_STREAM_PREFIX = 'screen-'

export class MediaStore {
  @observable
  streams: UserMediaStreams = {}

  @observable
  screenSharingUserId: string | null = null

  @observable
  currentUserMediaState: LocalMediaState = {
    audio: MediaState.OFF,
    video: MediaState.OFF,
  }

  @observable currentUserStream: MediaStream | null = null

  private readonly jvbuster: Jvbuster
  private roomParams: RoomParams | null = null

  constructor() {
    makeAutoObservable(this)

    this.jvbuster = new Jvbuster(this.onStreams)
  }

  async destroy(): Promise<void> {
    await this.disconnect()

    return new Promise<void>((resolve) => {
      cnnct.DisconnectFromJitsi()

      resolve()
    })
  }

  connect = (params: RoomParams, isSpeaker: boolean): Promise<void> => {
    this.roomParams = params

    const {jitsiServerUrl, token} = params

    return new Promise<void>((resolve) => {
      this.jvbuster.start(jitsiServerUrl, token, isSpeaker)

      resolve()
    })
  }

  disconnect = (): Promise<void> => {
    for (let streamsKey in this.streams) {
      const stream = this.streams[streamsKey]

      this.stopStream(stream)
    }

    this.stopStream(this.currentUserStream)

    runInAction(() => {
      this.streams = {}
      this.currentUserStream = null
    })

    return new Promise<void>((resolve) => {
      this.jvbuster.stop()

      resolve()
    })
  }

  getScreenShareStream = (): MediaStream | null => {
    if (this.screenSharingUserId == null) return null

    const streamName = `${SCREEN_SHARING_STREAM_PREFIX}${this.screenSharingUserId}`
    return this.streams[streamName] ?? null
  }

  switchOffMedia = () => {
    runInAction(() => {
      this.currentUserMediaState = {
        video: MediaState.OFF,
        audio: MediaState.OFF,
      }
    })

    this.sendAudioVideoState(MediaState.OFF, MediaState.OFF)
    this.stopStream(this.currentUserStream)
  }

  toggleAudio = async () => {
    const newState = this.getOppositeMediaState(
      this.currentUserMediaState.audio,
    )

    await this.setAudioState(newState)
  }

  toggleVideo = async () => {
    const newState = this.getOppositeMediaState(
      this.currentUserMediaState.video,
    )

    await this.setVideoState(newState)
  }

  setAudioState = async (newState: MediaState) => {
    runInAction(() => {
      this.currentUserMediaState.audio = MediaState.LOADING
    })

    if (newState === MediaState.ON) {
      const isConnected = await this.enableAudioStream()
      if (!isConnected) {
        newState = MediaState.OFF
      }
    } else {
      await this.stopStream(this.currentUserStream, 'audio')
    }

    runInAction(() => {
      this.currentUserMediaState.audio = newState
    })

    this.sendCurrentAudioVideoState()
  }

  setVideoState = async (newState: MediaState) => {
    runInAction(() => {
      this.currentUserMediaState.video = MediaState.LOADING
    })

    if (newState === MediaState.ON) {
      const isConnected = await this.enableVideoStream()
      if (!isConnected) {
        newState = MediaState.OFF
      }
    } else {
      await this.stopStream(this.currentUserStream, 'video')
    }

    runInAction(() => {
      this.currentUserMediaState.video = newState
    })

    this.sendCurrentAudioVideoState()
  }

  private sendCurrentAudioVideoState = (): void => {
    const {video, audio} = this.currentUserMediaState

    this.sendAudioVideoState(video, audio)
  }

  private sendAudioVideoState = (
    video: MediaState,
    audio: MediaState,
  ): void => {
    const stateToBoolean = (state: MediaState) => state === MediaState.ON

    cnnct.UpdateAudioVideoState({
      videoEnabled: stateToBoolean(video),
      audioEnabled: stateToBoolean(audio),
    })
  }

  private onStreams = (newStreams: MediaStream[]): void => {
    let screenSharingUserId: string | null

    const userMediaStreams: UserMediaStreams = {}
    for (const newStream of newStreams) {
      userMediaStreams[newStream.id] = newStream

      if (newStream.id.startsWith(SCREEN_SHARING_STREAM_PREFIX)) {
        screenSharingUserId = newStream.id.replace('screen-', '')
      }
    }

    runInAction(() => {
      this.streams = userMediaStreams
      this.screenSharingUserId = screenSharingUserId
    })
  }

  private getOppositeMediaState = (state: MediaState): MediaState => {
    return state === MediaState.OFF ? MediaState.ON : MediaState.OFF
  }

  private enableStream = async (
    // eslint-disable-next-line no-undef
    constrains: MediaStreamConstraints,
    setRemoteTrack: (stream: MediaStream) => Promise<MediaStreamTrack>,
  ): Promise<boolean> => {
    let stream: MediaStream

    try {
      stream = await navigator.mediaDevices.getUserMedia(constrains)
    } catch (err) {
      return false
    }

    const track = await setRemoteTrack(stream)

    runInAction(() => {
      if (this.currentUserStream == null) {
        this.currentUserStream = stream
      } else {
        // "The best way is to request the stream from the camera again after stopping it as there is no way to restart the stopped track"
        // https://stackoverflow.com/questions/64030460/webrtc-restart-video-stream-after-calling-stop
        this.currentUserStream.addTrack(track)
      }
    })

    return true
  }

  private enableVideoStream = async (): Promise<boolean> => {
    if (this.roomParams == null) {
      return false
    }

    const {videoWidth, videoHeight} = this.roomParams

    return this.enableStream(
      {
        video: {
          width: videoWidth,
          height: videoHeight,
        },
      },
      async (stream) => {
        const track = stream.getVideoTracks()[0]
        await this.jvbuster.setLocalVideoTrack(track)

        return track
      },
    )
  }

  private enableAudioStream = async (): Promise<boolean> => {
    return this.enableStream(
      {
        audio: true,
      },
      async (stream) => {
        const track = stream.getAudioTracks()[0]
        await this.jvbuster.setLocalAudioTrack(track)

        return track
      },
    )
  }

  private stopStream = (
    stream: MediaStream | null,
    mediaType?: 'audio' | 'video',
  ): void => {
    if (stream == null) return

    const tracks = stream.getTracks().filter((x) => x.readyState === 'live')

    tracks.forEach((track) => {
      if (mediaType == null || track.kind === mediaType) {
        track.stop()

        stream.removeTrack(track)
      }
    })
  }
}

import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from 'react-native'

import {analytics} from '../../../../Analytics'
import {appEventEmitter} from '../../../../appEventEmitter'
import {toastHelper} from '../../../../utils/ToastHelper'
import {alert} from '../../../webSafeImports/webSafeImports'
import {RoomManager} from '../jitsi/RoomManager'
import {SocketMessage, UserRoomMode} from '../models/jsonModels'
import {getCurrentRoomDeps} from '../roomDeps'
import {logJS} from './Logger'

const {AppModule} = NativeModules

export type AppModuleError = 'expired'

export type JvBusterSubscriptionType =
  | 'normalSubscription'
  | 'audioSubscription'
  | 'mixedAudioSubscription'

export type PhoneState = 'foreground' | 'background'

interface AnalyticsEvent {
  readonly name: string
  readonly body: Record<string, string>
}

export interface AppModuleInterface {
  connectToRoom(json: string): Promise<boolean>
  switchCamera(): void

  websocketsSendMessage(message: string): void

  disconnectFromRoom(): Promise<boolean>
  sendAudioVideoState(isVideoEnabled: boolean, isAudioEnabled: boolean): void
  phoneState(state: PhoneState): void
  onChangeRoomMode(mode: UserRoomMode, firstConnection: boolean): void
  setDjMode(enabled: boolean): void
  connectToWebrtc(
    address: string,
    token: string,
    isSpeaker: boolean,
    videoWidth: number,
    videoHeight: number,
    fps: number,
    videoEnabled: boolean,
    audioEnabled: boolean,
  ): Promise<boolean>

  isThereOtherAdmin(): Promise<boolean>
  admins(): Promise<string>
  hands(): Promise<string>
  toggleVideo(enable: boolean): void
  toggleAudio(enable: boolean): void
  jvBusterSetSubscriptionType(type: JvBusterSubscriptionType): void
  switchScreenShotMode(enable: boolean): Promise<void>
  getUniqueDeviceId(): Promise<string>
}

const module = AppModule as AppModuleInterface

export class ConnectClubAppModule implements AppModuleInterface {
  private eventEmitter = new NativeEventEmitter(AppModule)
  private events: Array<EmitterSubscription> = []
  private reconnectingTimeoutID: ReturnType<typeof setTimeout> | null = null
  onWsMessage: (message: SocketMessage) => void = () => {}
  onWebSocketMessage?: EmitterSubscription
  roomManager!: RoomManager

  constructor() {
    this.events.push(
      this.eventEmitter.addListener(
        'onRoomReconnecting',
        this.roomReconnecting,
      ),
      this.eventEmitter.addListener('onError', this.onError),
      this.eventEmitter.addListener('analyticsEvent', this.onAnalyticsEvent),
    )
  }

  jvBusterSetSubscriptionType(type: JvBusterSubscriptionType) {
    module.jvBusterSetSubscriptionType(type)
  }


  roomReconnecting = (isReconnecting: boolean) => {
    logJS('warning', `AppModule websockets isReconnecting:`, isReconnecting)
    if (isReconnecting) {
      if (!this.reconnectingTimeoutID) {
        this.reconnectingTimeoutID = setTimeout(() => toastHelper.showReconnectingToast(), 5000)
      }
    } else {
      if (this.reconnectingTimeoutID) {
        clearTimeout(this.reconnectingTimeoutID)
        this.reconnectingTimeoutID = null
      }
      toastHelper.hideReconnectingToast()
    }
  }

  switchCamera = () => {
    module.switchCamera()
  }

  onChangeRoomMode(mode: UserRoomMode, firstConnection: boolean) {
    this.roomManager.onChangeRoomMode(mode, firstConnection)
  }

  async connectToRoom(json: string): Promise<boolean> {
    this.onWebSocketMessage?.remove()
    //this.isDestroying = false
    const isSuccess = await module.connectToRoom(json)
    logJS('info', 'AppModule connectToRoom result:', isSuccess)

    if (isSuccess) {
      this.onWebSocketMessage = this.eventEmitter.addListener(
        'onWebSocketMessage',
        (message) => {
          this.onWsMessage(JSON.parse(message))
        },
      )
      this.events.push(this.onWebSocketMessage)
      this.events.push(
        this.eventEmitter.addListener('onChangeRoomMode', (event) => {
          this.onChangeRoomMode(event.mode, event.isFirstConnection)
        }),
      )
    }

    return isSuccess
  }

  async isThereOtherAdmin(): Promise<boolean> {
    return module.isThereOtherAdmin()
  }

  async admins(): Promise<string> {
    return module.admins()
  }

  async hands(): Promise<string> {
    return module.hands()
  }

  phoneState(state: PhoneState) {
    //if (this.isDestroying) return
    module.phoneState(state)
  }

  setDjMode(enabled: boolean) {
    console.log('set dj mode!')
    module.setDjMode(enabled)
  }

  sendAudioVideoState(isVideoEnabled: boolean, isAudioEnabled: boolean) {
    //if (this.isDestroying) return
    module.sendAudioVideoState(isVideoEnabled, isAudioEnabled)
  }

  websocketsSendMessage(message: string) {
    //if (this.isDestroying) return
    module.websocketsSendMessage(message)
  }

  disconnectFromRoom(): Promise<boolean> {
    //this.isDestroying = true
    logJS('debug', 'AppModule disconnectFromRoom')
    return module.disconnectFromRoom()
  }

  async destroy() {
    //this.isDestroying = true
    logJS('debug', 'AppModule destroy', this.events.length)
    this.events.forEach((e) => e.remove())
    this.roomReconnecting(false)
    await this.disconnectFromRoom()
  }

  toggleVideo(enable: boolean) {
    module.toggleVideo(enable)
  }

  toggleAudio(enable: boolean) {
    module.toggleAudio(enable)
  }

  async connectToWebrtc(
    address: string,
    token: string,
    isSpeaker: boolean,
    videoWidth: number,
    videoHeight: number,
    fps: number,
    videoEnabled: boolean,
    audioEnabled: boolean,
  ): Promise<boolean> {
    //this.isDestroying = false
    const isConnected = await module.connectToWebrtc(
      address,
      token,
      isSpeaker,
      videoWidth,
      videoHeight,
      fps,
      videoEnabled,
      audioEnabled,
    )
    return isConnected
  }

  onError(error: AppModuleError) {
    logJS('error', `AppModule onError`, error)
    appEventEmitter.trigger('finishRoom')
    if (error !== 'expired') {
      alert('Error!', error)
    }
  }

  onAnalyticsEvent(event: AnalyticsEvent) {
    const roomDeps = getCurrentRoomDeps()
    analytics.sendEvent(event.name, {
      ...event.body,
      roomId: roomDeps.deps?.roomManager?.getCurrentRoomId(),
    })
  }

  async switchScreenShotMode(enable: boolean): Promise<void> {
    if (Platform.OS !== 'android') return
    return module.switchScreenShotMode(enable)
  }

  getUniqueDeviceId(): Promise<string> {
    return module.getUniqueDeviceId()
  }
}

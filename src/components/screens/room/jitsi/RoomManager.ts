import i18n from 'i18next'
import {action, makeAutoObservable, observable, runInAction} from 'mobx'
import {Platform} from 'react-native'

import {api} from '../../../../api/api'
import {
  appEventEmitter,
  clearAllToast,
  EventEmitterListener,
  hideLoading,
  showLoading,
} from '../../../../appEventEmitter'
import {ClubId} from '../../../../models'
import devicePermissionUtils from '../../../../utils/device-permission.utils'
import {getRoomBackground} from '../../../../utils/room-settings.utils'
import {toastHelper} from '../../../../utils/ToastHelper'
import {profileFullName} from '../../../../utils/userHelper'
import {
  EmojiType,
  RoomImageObject,
  RoomObject,
  RoomSettings,
  UserRoomMode,
  WebsocketState,
} from '../models/jsonModels'
import {RadarState, RoomBackground} from '../models/localModels'
import {
  ConnectClubAppModule,
  JvBusterSubscriptionType,
  PhoneState,
} from '../modules/AppModule'
import {logJS} from '../modules/Logger'
import {pixelRatio} from '../Utils'
import UserManager from './UserManager'
import WebSocketManager from './WebSocketManager'
import WsDelegate from './WsDelegate'

export type RoomType = 'networking' | 'broadcasting' | 'multiroom'
export type RoomConnectType =
  | 'failLoadSettings'
  | 'fail'
  | 'paid'
  | 'connected'
  | 'notPermitted'
  | 'nft_required'
type ConnectParams = {
  roomId: string
  roomPass: string
  endpoint: string
}
type RoomConnectResult = {
  type: RoomConnectType
  eventId?: string
}

export class RoomManager {
  private currentSettings: RoomSettings | null = null
  private wsManager: WebSocketManager
  appModule: ConnectClubAppModule
  private shouldSkipCallNativeDisconnect = false
  private cleanupListeners: EventEmitterListener[] = []

  constructor(
    private userManager: UserManager,
    appModule: ConnectClubAppModule,
    onReaction: (
      fromId: string,
      reactionType: EmojiType,
      duration: number,
    ) => void,
  ) {
    this.appModule = appModule
    makeAutoObservable(this)
    const wsDelegate: WsDelegate = {
      onReaction: (fromId, reactionType, duration) => {
        onReaction(fromId, reactionType, duration)
      },
      onState: this.onState,

      onRaiseHandRequested: (id, type, fromId, fromName, fromSurname) => {
        const name = profileFullName(fromName, fromSurname)
        if (type === 'request' || type === 'invite') {
          const callToStage = () => this.callToStage(id)
          const moveToStage = () => this.moveToStage(id)
          const declineCall = () => this.declineStageCall(fromId)

          toastHelper.showHandRequestToast(
            id,
            name,
            type,
            callToStage,
            moveToStage,
            declineCall,
          )
        } else if (type === 'declineInvite') {
          toastHelper.showDeclineStageCallToast(id, name)
        }
      },

      onAdminChange: (id, type) => {
        if (type === 'add') toastHelper.success('toastAddToModerator', true)
        this.userManager.toggleAdmin(id, type)
      },

      onAbsoluteSpeakerChange: (id, type, fromName, fromSurname) => {
        if (id === this.userManager.currentUserId) {
          this.isAbsoluteSpeakerEnabled = type === 'set'
        } else {
          this.isAbsoluteSpeakerAvailable = type === 'clear'
        }
        if (type === 'set') {
          const name = profileFullName(fromName, fromSurname)
          toastHelper.showAbsoluteSpeakerToast(name)
        }
      },

      onSilentModeChange: (isEnabled) => {
        if (isEnabled) {
          toastHelper.showSilentModeOn(
            this.roomMode === 'popup'
              ? 'silentModeOnListenerHint'
              : 'silentModeOnHint',
          )
        } else {
          toastHelper.showSilentModeOff(
            this.roomMode === 'popup'
              ? 'silentModeOffListenerHint'
              : 'silentModeOffHint',
          )
        }
      },
    }
    this.wsManager = new WebSocketManager(appModule, wsDelegate)
    this.cleanupListeners.push(
      appEventEmitter.once('moveFromStage', this.moveFromStage),
      appEventEmitter.once('moveToStage', this.callOrMoveToStage),
      appEventEmitter.once('addToAdmin', this.addAdmin),
      appEventEmitter.once('removeFromAdmin', this.removeAdmin),
    )
  }

  @observable
  isJitsiConnected = false

  @observable
  roomBackground?: RoomBackground
  @observable
  radar: RadarState = {radius: 0, isSubscriber: false}
  @observable
  raisedHandsCount = 0
  @observable
  withSpeakers: boolean = false
  @observable
  isPrivateRoom: boolean = false
  @observable
  isSilentModeEnabled: boolean = false
  @observable
  isAbsoluteSpeakerAvailable: boolean = true
  @observable
  isAbsoluteSpeakerEnabled: boolean = false

  roomSettings?: RoomSettings
  roomMode?: UserRoomMode

  get roomClubId(): ClubId | undefined {
    return this.currentSettings?.params?.clubId
  }

  get roomEventId(): string | undefined {
    return this.currentSettings?.params?.eventScheduleId
  }

  getCurrentRoomId = (): string | undefined => this.currentSettings?.name

  getOwnerId = (): string | undefined =>
    this.currentSettings?.params?.ownerId?.toString()

  getRoomType = (): RoomType => {
    if (this.roomSettings?.draftType === 'multiroom') {
      return 'multiroom'
    }
    return this.withSpeakers ? 'broadcasting' : 'networking'
  }

  isAbsoluteSpeakerSupported = (): boolean => {
    if (!this.roomSettings) return false
    switch (this.roomSettings?.draftType) {
      case 's_networking':
      case 'l_networking':
      case 'gallery':
      case 'multiroom':
        return true
      case 's_broadcasting':
      case 'l_broadcasting':
        return false
      default:
        break
    }
    return false
  }

  get shareScreenPosition(): RoomObject | undefined {
    return this.currentSettings?.uiConfig.shareScreenPosition
  }

  get timeBoxPosition(): RoomObject | undefined {
    return this.currentSettings?.uiConfig?.timeBoxPosition
  }

  get imageObjects(): Array<RoomImageObject> | undefined {
    return this.currentSettings?.uiConfig?.imageObjects
  }

  private onState = async (state: WebsocketState) => {
    //if (!this.isJitsiConnected) return
    const count = state.listenersCount ?? 0
    if (count !== this.userManager.listenersCount) {
      this.userManager.updateListenersCount(count)
    }
    this.userManager.setParticipants(state.room)
    this.userManager.updateCurrentUser(state.current)
    this.raisedHandsCount = state.raisedHandsCount
    this.isSilentModeEnabled = !state.handsAllowed
    if (state.current) {
      this.isAbsoluteSpeakerAvailable =
        !state.absoluteSpeakerPresent || state.current.isAbsoluteSpeaker
    }
    logJS('info', 'RoomManager websockets onState', JSON.stringify(state))
  }

  onChangeDjMode = async () => {
    if (this.roomMode === 'popup') {
      return
    }
    await this.onChangeRoomMode('room', false)
  }

  onChangeRoomMode = async (
    userRoomMode: UserRoomMode,
    firstConnection: boolean,
  ) => {
    logJS(
      'debug',
      `RoomManager.onChangeRoomMode mode firstConnection`,
      userRoomMode,
      firstConnection,
    )
    this.roomMode = userRoomMode
  }

  public async connect(
    connectParams: ConnectParams,
  ): Promise<RoomConnectResult> {
    logJS(
      'debug',
      `RoomManager connect userId:`,
      this.userManager.currentUserId,
      'params:',
      JSON.stringify(connectParams),
    )
    try {
      const result = await api.loadRoomSettings(connectParams)
      if (result.isErr) {
        const errorName = result.error.name
        if (
          errorName.startsWith('room_required_nft_wallet') ||
          errorName.startsWith('room_required_nft_token_in_wallet')
        ) {
          return {
            type: 'nft_required',
            eventId: errorName.substring(errorName.lastIndexOf('_') + 1),
          }
        }
        switch (errorName) {
          case 'v1.video_room.payment_required':
            return {type: 'paid'}
          default:
            return {type: 'fail'}
        }
      }
      const settings = result.unwrap()
      if (settings.params.isDone) {
        logJS('error', `RoomManager load roomSettings error`)
        this.shouldSkipCallNativeDisconnect = true
        return {type: 'failLoadSettings'}
      }
      if (
        this.checkIsNeedRequestAudioPermission(connectParams, settings) &&
        !(await devicePermissionUtils.checkAudioPermissions(i18n.t.bind(i18n)))
      )
        return {type: 'notPermitted'}

      this.roomSettings = settings
      clearAllToast()
      this.setRoomSettings(settings)
      const params = this.currentSettings!.params!
      const isConnected = await this.wsManager.connect({
        isDebug: __DEV__,
        url: settings.params.socketUrl,
        roomId: settings.name,
        roomPass: settings.password,
        roomWidthMul: 1,
        roomHeightMul: 1,
        adaptiveBubbleSize: this.roomBackground?.adaptiveBubbleSize ?? 1,
        devicePixelRatio: pixelRatio,
        roomName: settings.description || '',
        userId: this.userManager.currentUserId,
        address: params.jitsiServer,
        token: params.token,
        videoWidth: params.videoWidth,
        videoHeight: params.videoHeight,
        fps: 24,
        videoEnabled: false,
        audioEnabled: false,
      })
      return {type: isConnected ? 'connected' : 'fail'}
    } catch (e: any) {
      logJS('error', 'RoomManager connect to room error:', JSON.stringify(e))
      return {type: 'fail'}
    }
  }

  public destroy = async () => {
    if (this.shouldSkipCallNativeDisconnect) return
    logJS(
      'debug',
      `RoomManager destroy userId:`,
      this.userManager.currentUserId,
    )
    this.cleanupListeners.forEach((f) => f())
    this.sendEndReaction(this.userManager.currentUserId)
    this.wsManager.destroy()
    this.userManager.destroy()
    await this.appModule.destroy()
    logJS('debug', 'destroy complete')
  }

  private checkIsNeedRequestAudioPermission = (
    connectParams: ConnectParams,
    settings: RoomSettings,
  ) => {
    return (
      Platform.OS === 'android' &&
      (!settings.uiConfig.withSpeakers ||
        settings.params.isAdmin ||
        settings.params.ownerId.toString() === connectParams.endpoint ||
        settings.isSpecialSpeaker)
    )
  }

  @action
  private setRoomSettings = (settings: RoomSettings) => {
    logJS('info', 'setRoomSettings')
    this.currentSettings = settings

    const roomBackground = getRoomBackground(settings)

    runInAction(() => {
      this.roomBackground = roomBackground
      this.radar = {
        radius: (settings.uiConfig.radarSize / 2) * pixelRatio,
        isSubscriber: false,
      }
      this.withSpeakers = settings.uiConfig.withSpeakers
      this.isPrivateRoom = settings.params.isPrivate
    })
  }

  absoluteSpeakerMode = (enable: boolean) => {
    this.wsManager.absoluteSpeakerMode(enable)
  }

  handUp = () => {
    const localUser = this.userManager.currentUserId
    this.userManager.handUp()
    this.wsManager.handUp(localUser)
  }

  handDown = (type: 'admin' | 'user') => {
    const localUser = this.userManager.currentUserId
    this.userManager.handDown()
    this.wsManager.handDown(localUser, type)
  }

  moveToStage = async (id: string) => {
    if (
      Platform.OS === 'android' &&
      !(await devicePermissionUtils.checkAudioPermissions(i18n.t.bind(i18n)))
    )
      return
    logJS('debug', 'RoomManager: move', id, 'to STAGE')
    this.userManager.handDown()
    this.wsManager.moveToStage(id)
    this.sendEndReaction(id)
  }

  moveFromStage = (id: string) => {
    this.wsManager.moveFromStage(id)
    this.sendEndReaction(id)
  }

  callToStage = (id: string) => {
    toastHelper.hideHandRequestToast(id)
    this.wsManager.callToStage(id)
    this.userManager.removeFromRaisedHands(id)
  }

  callOrMoveToStage = (id: string, inviteToast: boolean) => {
    if (inviteToast) {
      this.callToStage(id)
    } else {
      this.moveToStage(id)
    }
  }

  declineStageCall = (userId: string) => {
    this.wsManager.declineStageCall(userId)
  }

  addAdmin = (id: string) => this.wsManager.addAdmin(id)

  removeAdmin = (id: string) => {
    this.wsManager.removeAdmin(id)
    this.userManager.removeFromAdmins(id)
  }

  sendReaction = (type: EmojiType) => {
    this.wsManager.sendReaction(type)
  }

  sendEndReaction = (id: string) => {
    // send end reaction only if it yours reaction
    if (id === this.userManager.currentUserId) {
      this.wsManager.sendReaction(EmojiType.none)
    }
  }

  phoneState(phoneState: PhoneState) {
    this.appModule.phoneState(phoneState)
    switch (phoneState) {
      case 'background':
        const draft = this.roomSettings?.draftType ?? ''
        const mode = this.userManager.user.mode
        const type: JvBusterSubscriptionType =
          mode === 'room'
            ? 'audioSubscription'
            : draft === 'multiroom'
            ? 'audioSubscription'
            : 'mixedAudioSubscription'
        this.appModule.jvBusterSetSubscriptionType(type)
        break
      case 'foreground':
        this.appModule.jvBusterSetSubscriptionType('normalSubscription')
        break
    }
  }

  isThereOtherAdmin = async (): Promise<boolean> => {
    return await this.appModule.isThereOtherAdmin()
  }

  isThereOtherSpeaker = (): string | null => {
    const userId = this.userManager.currentUserId
    const speakers = this.userManager.usersMap.values()
    for (const speaker of speakers) {
      if (userId === speaker.id) continue
      if (speaker.mode !== 'room') continue
      return speaker.id
    }
    return null
  }

  startTimer = (seconds: number, startUserName: string) => {
    logJS('info', 'sendTimer')
    this.wsManager.sendTimer(seconds, startUserName)
  }

  stopTimer = (startUserName: string) => {
    logJS('info', 'sendTimer', 'startUserName', startUserName)
    this.wsManager.sendTimer(-1, startUserName)
  }

  makeRoomPublic = async () => {
    const id = this.getCurrentRoomId()
    if (!id) return
    showLoading()
    const response = await api.makeRoomPrivate(id)
    hideLoading()
    if (response.error) return toastHelper.error(response.error)
    if (response.code === 200)
      runInAction(() => {
        const currentParams = this.currentSettings?.params
        if (currentParams) currentParams.isPrivate = false
        this.isPrivateRoom = false
      })
  }

  makeRoomSilent = (isEnabled: boolean) => {
    this.wsManager.sendRoomSilent(isEnabled)
  }
}

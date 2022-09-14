import {action, makeAutoObservable, observable, runInAction} from 'mobx'
import {Platform} from 'react-native'

import {api} from '../../../src/api/api'

import {
  RoomConnectType,
  RoomType,
} from '../../../src/components/screens/room/jitsi/RoomManager'
import UserManager from '../../../src/components/screens/room/jitsi/UserManager'
import {
  ChangeRoomMode,
  EmojiType,
  PopupUser,
  RoomObject,
  RoomSettings,
} from '../../../src/components/screens/room/models/jsonModels'
import {
  MediaState,
  RadarState,
  RoomBackground,
} from '../../../src/components/screens/room/models/localModels'
import {logJS} from '../../../src/components/screens/room/modules/Logger'
import UserReactionsStore from '../../../src/components/screens/room/store/UserReactionsStore'
import {pixelRatio} from '../../../src/components/screens/room/Utils'

import {getRoomBackground} from '../../../src/utils/room-settings.utils'
import {toastHelper} from '../../../src/utils/ToastHelper'
import {profileFullName} from '../../../src/utils/userHelper'

import {
  appEventEmitter,
  clearAllToast,
  EventEmitterListener,
  hideLoading,
  showLoading,
} from '../../../src/appEventEmitter'

import {ParticipantState} from '../models/ParticipantState'
import DesktopWebSocketManager from '../services/DesktopWebSocketManager'
import ExtendedWsDelegate from '../services/ExtendedWsDelegate'
import {Cnnct} from '../services/Jvbuster'
import {MediaStore} from './MediaStore'

declare var cnnct: Cnnct

interface ConnectParams {
  roomId: string
  roomPass: string
  endpoint: string
}

type ParticipantStates = {
  [userId: string]: ParticipantState
}

export class RoomStore {
  @observable
  roomBackground?: RoomBackground

  @observable
  radar: RadarState = {radius: 0, isSubscriber: false}

  @observable
  raisedHandsCount = 0

  @observable
  isJitsiConnected = false

  @observable
  withSpeakers: boolean = false

  @observable
  isPrivateRoom: boolean = false

  @observable
  participantStates: ParticipantStates = {}

  @observable
  listeners: PopupUser[] = []

  currentSettings: RoomSettings | null = null

  private readonly wsManager: DesktopWebSocketManager
  private shouldSkipCallNativeDisconnect = false
  private cleanupListeners: EventEmitterListener[] = []
  private isVideoHidden = false

  constructor(
    private userManager: UserManager,
    private mediaStore: MediaStore,
    private userReactionsStore: UserReactionsStore,
  ) {
    makeAutoObservable(this)

    const wsDelegate = this.constructDelegate()
    this.wsManager = new DesktopWebSocketManager(wsDelegate)

    this.cleanupListeners.push(
      appEventEmitter.once('moveFromStage', this.moveFromStage),
      appEventEmitter.once('moveToStage', this.callOrMoveToStage),
      appEventEmitter.once('addToAdmin', this.addAdmin),
      appEventEmitter.once('removeFromAdmin', this.removeAdmin),
    )
  }

  destroy(): void {
    if (this.shouldSkipCallNativeDisconnect) return

    this.cleanupListeners.forEach((x) => x())
    this.sendEndReaction(this.userManager.currentUserId)
    this.wsManager.destroy()
    this.userManager.destroy()
    this.mediaStore.destroy()
  }

  async connect(connectParams: ConnectParams): Promise<RoomConnectType> {
    try {
      const result = await api.loadRoomSettings(connectParams)
      if (result.isErr) return 'fail'
      const settings = result.unwrap()

      if (settings.params.isDone) {
        logJS('warning', `RoomStore error load roomSettings`)
        this.shouldSkipCallNativeDisconnect = true
        return 'failLoadSettings'
      }

      clearAllToast()
      this.setRoomSettings(settings)

      const isConnected = await this.connectToWebSocket(
        settings,
        connectParams.roomPass,
      )
      return isConnected ? 'connected' : 'fail'
    } catch (e) {
      logJS('error', JSON.stringify(e), 'RoomStore error on connect')

      return 'fail'
    }
  }

  @action
  private setRoomSettings = (settings: RoomSettings) => {
    logJS('error', 'RoomStore setRoomSettings', JSON.stringify(settings))
    this.currentSettings = settings

    const roomBackground = getRoomBackground(settings)

    runInAction(() => {
      this.roomBackground = roomBackground
      this.radar = {
        radius:
          (settings.uiConfig.radarSize / 2) *
          pixelRatio *
          (Platform.OS === 'web' ? roomBackground.multiplier : 1),
        isSubscriber: false,
      }
      this.withSpeakers = settings.uiConfig.withSpeakers
      this.isPrivateRoom = settings.params.isPrivate
    })
  }

  getCurrentRoomId = (): string | undefined => this.currentSettings?.name

  getOwnerId = (): string | undefined =>
    this.currentSettings?.params?.ownerId?.toString()

  getRoomType = (): RoomType => {
    return this.currentSettings?.uiConfig.withSpeakers === true
      ? 'withSpeakers'
      : 'networking'
  }
  getRoomDescription = (): string => this.currentSettings!.description ?? ''

  get shareScreenPosition(): RoomObject | undefined {
    return this.currentSettings?.uiConfig.shareScreenPosition
  }

  get imageObjects(): Array<RoomObject> | undefined {
    return this.currentSettings?.uiConfig?.imageObjects
  }

  isThereOtherAdmin = async (): Promise<boolean> => {
    return Promise.resolve(cnnct.IsThereOtherAdmin())
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

  addAdmin = (id: string) => this.wsManager.addAdmin(id)
  removeAdmin = (id: string) => {
    this.wsManager.removeAdmin(id)
    this.userManager.removeFromAdmins(id)
  }

  moveToStage = async (id: string) => {
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

  sendReaction = (type: EmojiType) => {
    this.wsManager.sendReaction(type)
  }

  sendEndReaction = (id: string) => {
    // send end reaction only if it yours reaction
    if (id === this.userManager.currentUserId) {
      this.wsManager.sendReaction(EmojiType.none)
    }
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

  hands = (): Promise<string> => {
    return Promise.resolve(JSON.stringify(cnnct.Hands()))
  }

  admins = () => {
    return Promise.resolve(JSON.stringify(cnnct.Admins()))
  }

  moveUser = (x: number, y: number): void => {
    this.wsManager.sendPath({toX: x, toY: y})
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

  hideVideo = async () => {
    logJS('debug', 'RoomStore:', 'hide video requested')
    if (this.mediaStore.currentUserMediaState.video === MediaState.OFF) return
    this.isVideoHidden = true
    await this.mediaStore.toggleVideo()
  }

  restoreVideo = async () => {
    logJS('debug', 'RoomStore:', 'restore video requested')
    if (!this.isVideoHidden) return
    this.isVideoHidden = false
    if (this.mediaStore.currentUserMediaState.video !== MediaState.OFF) return
    await this.mediaStore.toggleVideo()
  }

  private connectToWebSocket(
    roomSettings: RoomSettings,
    roomPassword: string,
  ): Promise<boolean> {
    const {
      name,
      description,
      params: {socketUrl, token},
    } = roomSettings

    const {multiplier, adaptiveBubbleSize} = this.roomBackground!

    let connectionData = {
      isDebug: false,
      url: socketUrl,
      roomId: name,
      roomPass: roomPassword,
      accessToken: token,
      userId: this.userManager.currentUserId,
      roomWidthMul: multiplier ?? 1,
      roomHeightMul: multiplier ?? 1,
      adaptiveBubbleSize: adaptiveBubbleSize ?? 1,
      devicePixelRatio: pixelRatio,
      roomName: description,
    }

    return this.wsManager.connect(connectionData)
  }

  private constructDelegate(): ExtendedWsDelegate {
    return {
      onReaction: (from, type, duration) => {
        logJS('debug', `wsd onReaction: ${from} ${type} ${duration}`)

        this.userReactionsStore.setReaction(from, type, duration)
      },
      onState: (state) => {
        logJS('debug', `wsd onState ${JSON.stringify(state)}`)

        const count = state.listenersCount ?? 0
        if (count !== this.userManager.listenersCount) {
          this.userManager.updateListenersCount(count)
        }

        this.userManager.setParticipants(state.room)
        this.userManager.updateCurrentUser(state.current)

        runInAction(() => {
          this.raisedHandsCount = state.raisedHandsCount
        })
      },
      onRaiseHandRequested: (id, type, fromName, fromSurname) => {
        logJS(
          'debug',
          `wsd onRaiseHandRequested ${id} ${type} ${fromName} ${fromSurname}`,
        )

        const name = profileFullName(fromName, fromSurname)
        if (type === 'request' || type === 'invite') {
          toastHelper.showHandRequestToast(
            id,
            name,
            type,
            () => this.callToStage(id),
            () => this.moveToStage(id),
          )
        }
      },
      onAdminChange: (id, type, fromName, fromSurname) => {
        logJS(
          'debug',
          `wsd onAdminChange ${id} ${type} ${fromName} ${fromSurname}`,
        )

        if (type === 'add') toastHelper.success('toastAddToModerator', true)
        this.userManager!.toggleAdmin(id, type)
      },
      onPath: ({userId, x, y, duration}) => {
        runInAction(() => {
          const state = this.participantStates[userId]
          this.participantStates[userId] = {
            x,
            y,
            duration,
            audioLevel: state?.audioLevel ?? 1,
          }
        })
      },
      onNativeState: (nativeState: any[]) => {
        if (nativeState.length === 0) return

        // 'onNativeState' is used only for receiving initial users positions
        // for all non-initial movements 'onPath' is used because we have to know animation duration
        const newPositions = nativeState.filter(
          ({id}) => this.participantStates[id] === null,
        )
        // update audio levels
        runInAction(() => {
          nativeState.forEach(({id, audioLevel}) => {
            const state = this.participantStates[id]
            if (state !== null) {
              this.participantStates[id] = {...state, audioLevel}
            }
          })
        })

        if (newPositions.length > 0) {
          runInAction(() => {
            for (const entry of newPositions) {
              this.participantStates[entry.id] = {
                x: entry.x,
                y: entry.y,
                audioLevel: entry.audioLevel,
              }
            }
          })
        }
      },
      onPopupUsers: (popupUsers) => {
        const {users} = popupUsers

        runInAction(() => {
          this.listeners = users
        })
      },
      switchOffAudio: async () => {
        await this.mediaStore.setAudioState(MediaState.OFF)
      },
      switchOffVideo: async () => {
        await this.mediaStore.setVideoState(MediaState.OFF)
      },
      onChangeRoomMode: async ({mode}: ChangeRoomMode) => {
        // onChangeRoomMode is called when a user joins a room and when goes from/to stage
        const wasConnected = this.isJitsiConnected
        if (wasConnected) {
          // don't wait when the user will be deleted after 'onNativeState' response
          // to prevent incorrect positioning and strange 'movements' due to lack of coordinates
          this.userManager.usersMap.delete(this.userManager.currentUserId)

          this.mediaStore.switchOffMedia()

          await this.mediaStore.disconnect()

          runInAction(() => {
            this.isJitsiConnected = false
          })
        }

        const {
          params: {jitsiServer, token, videoHeight, videoWidth},
        } = this.currentSettings!

        const isSpeaker = mode === 'room'

        await this.mediaStore.connect(
          {
            jitsiServerUrl: jitsiServer,
            token,
            videoHeight,
            videoWidth,
          },
          isSpeaker,
        )

        runInAction(() => {
          this.isJitsiConnected = true
        })

        this.mediaStore.switchOffMedia()
      },
    }
  }
}

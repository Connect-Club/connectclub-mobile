import i18n from 'i18next'

import {
  ChangeRoomMode,
  PopupUsers,
  SocketMessage,
  WsConnectionData,
} from '../../../src/components/screens/room/models/jsonModels'
import {EmojiType} from '../../../src/components/screens/room/models/jsonModels'
import {logJS} from '../../../src/components/screens/room/modules/Logger'

import {toastHelper} from '../../../src/utils/ToastHelper'
import {profileFullName} from '../../../src/utils/userHelper'

import {
  appEventEmitter,
  startRoundTimer,
  stopRoundTimer,
} from '../../../src/appEventEmitter'

import ExtendedWsDelegate from './ExtendedWsDelegate'
import {WSAdapter} from './WSAdapter'

interface WsConnectionDataWithToken extends WsConnectionData {
  accessToken: string
}

class DesktopWebSocketManager {
  private wsadapter: WSAdapter

  constructor(protected delegate: ExtendedWsDelegate) {
    this.wsadapter = new WSAdapter()

    appEventEmitter.once('updateUserAvatar', this.updateProfile)
    appEventEmitter.once('sendUserMute', this.sendMute)
  }

  public destroy = () => {
    appEventEmitter.off('updateUserAvatar', this.updateProfile)
    appEventEmitter.off('sendUserMute', this.sendMute)

    this.wsadapter.disconnect()
  }

  connect = async (
    connectionData: WsConnectionDataWithToken,
  ): Promise<boolean> => {
    logJS('info', 'DesktopWebSocketManager connects!')
    this.wsadapter.initialize({
      onMessage: this.parseMessage,
      onReaction: (reaction: object) => {
        logJS('info', `ws onReaction: ${JSON.stringify(reaction)}`)
      },
      onReconnect: ({isReconnecting}: any) => {
        logJS('debug', `ws onReconnect: ${JSON.stringify(isReconnecting)}`)

        if (isReconnecting) {
          toastHelper.showReconnectingToast()
        } else {
          toastHelper.hideReconnectingToast()
        }
      },
      onPath: (path: any) => {
        logJS('info', `onPath ${JSON.stringify(path)}`)
        this.delegate.onPath(path)
      },
      onNativeState: (nativeState: any[]) => {
        logJS('info', `ws onNativeState: ${JSON.stringify(nativeState)}`)
        this.delegate.onNativeState(nativeState)
      },
      onRadarVolume: (radarVolume: object) => {
        logJS('debug', `ws onRadarVolume: ${JSON.stringify(radarVolume)}`)
      },
      onConnectionState: (connectionState: object) => {
        logJS(
          'info',
          `ws onConnectionState: ${JSON.stringify(connectionState)}`,
        )
      },
      onPopupUsers: (popupUsers: PopupUsers) => {
        this.delegate.onPopupUsers(popupUsers)
        logJS('info', `ws onPopupUsers: ${JSON.stringify(popupUsers)}`)
      },
      onChangeRoomMode: (roomMode: ChangeRoomMode) => {
        this.delegate.onChangeRoomMode(roomMode)
        logJS('info', `ws onChangeRoomMode: ${JSON.stringify(roomMode)}`)
      },
      didWebsocketsConnect: () => {
        logJS('info', `ws didWebsocketsConnect`)
      },
      onParticipantsVisibilityChanged: (state: object) => {
        logJS(
          'debug',
          `ws onParticipantsVisibilityChanged: ${JSON.stringify(state)}`,
        )
      },
    } as any)

    const res = this.wsadapter.connect(connectionData)
    if (res) {
      logJS('info', 'WS connection successful')
      return Promise.resolve(true)
    }
    return Promise.resolve(false)
  }

  sendPath = (toCoords: any) => {
    return this.wsadapter.sendPath(toCoords)
  }

  disconnect = () => {
    this.wsadapter.disconnect()
  }

  handUp = (id: string) => {
    this.sendToWs({type: 'handUp', payload: {id}})
  }

  handDown = (id: string, type: 'admin' | 'user') => {
    this.sendToWs({type: 'handDown', payload: {id, type}})
  }

  moveToStage = (id: string) => {
    this.sendToWs({type: 'moveToStage', payload: {id}})
  }

  moveFromStage = (id: string) => {
    this.sendToWs({type: 'moveFromStage', payload: {id}})
  }

  callToStage = (id: string) => {
    this.sendToWs({type: 'callToStage', payload: {id}})
  }

  addAdmin = (id: string) => {
    this.sendToWs({type: 'addAdmin', payload: {id}})
  }

  removeAdmin = (id: string) => {
    this.sendToWs({type: 'removeAdmin', payload: {id}})
  }

  sendReaction = (type: EmojiType) => {
    this.sendToWs({
      type: 'broadcast',
      payload: {type: 'nonverbal', message: type, duration: 10},
    })
  }

  sendTimer = (seconds: number, startUserName?: string) => {
    logJS('debug', 'sendTimer', seconds, 'startUserName', startUserName)
    this.sendToWs({
      type: 'broadcast',
      payload: {
        type: 'timer',
        duration: seconds,
        startUserName,
      },
    })
  }

  sendMute = (userId: string, type: string) => {
    this.sendToWs({type: 'mute', payload: {type, id: userId}})
  }

  updateProfile = () => {
    this.sendToWs({type: 'updateProfile', payload: {}})
  }

  private parseMessage = (message: SocketMessage) => {
    const {payload} = message
    switch (message.type) {
      case 'speaker':
        //this.delegate.onSpeaker(payload.id, true)
        break
      case 'reactions':
        this.delegate.onReaction(
          payload.fromId,
          payload.reaction,
          payload.duration,
        )
        break
      case 'timer':
        logJS(
          'debug',
          'timer message',
          payload.duration,
          payload.fromId,
          payload.startUserName,
          '--',
          payload,
        )
        if (payload.duration <= 0) stopRoundTimer(payload.startUserName)
        else startRoundTimer(payload.duration, payload.startUserName)
        break
      case 'state':
        this.delegate.onState(payload)
        break
      case 'serverHandNotify':
        this.delegate.onRaiseHandRequested(
          payload.id,
          payload.type,
          payload.fromName,
          payload.fromSurname,
        )
        break
      case 'serverAdminNotify':
        this.delegate.onAdminChange(
          payload.id,
          payload.type,
          payload.fromName,
          payload.fromSurname,
        )
        break
      case 'ban':
        appEventEmitter.trigger('finishRoom')
        break
      case 'muteRequest':
        switch (payload.type) {
          case 'video':
            toastHelper.success(
              i18n.t('toastDisableVideo', {
                username: profileFullName(
                  payload.fromName,
                  payload.fromSurname,
                ),
              }),
            )

            return this.delegate.switchOffVideo()
          case 'audio':
            toastHelper.success(
              i18n.t('toastDisableAudio', {
                username: profileFullName(
                  payload.fromName,
                  payload.fromSurname,
                ),
              }),
            )

            return this.delegate.switchOffAudio()
          default:
            throw new Error(
              `passed unsupported type to 'muteRequest', type: ${payload.type}`,
            )
        }
      default:
        break
    }
  }

  private sendToWs(message: SocketMessage) {
    logJS('info', `Send to WS: ${JSON.stringify(message)}`)

    this.wsadapter.sendMessage(message)
  }
}

export default DesktopWebSocketManager

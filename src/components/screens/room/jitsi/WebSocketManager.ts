import i18n from 'i18next'
import {makeAutoObservable} from 'mobx'

import {
  appEventEmitter,
  startRoundTimer,
  stopRoundTimer,
} from '../../../../appEventEmitter'
import {toastHelper} from '../../../../utils/ToastHelper'
import {profileFullName} from '../../../../utils/userHelper'
import {EmojiType, SocketMessage, WsConnectionData} from '../models/jsonModels'
import {ConnectClubAppModule} from '../modules/AppModule'
import {logJS} from '../modules/Logger'
import WsDelegate from './WsDelegate'

class WebSocketManager {
  constructor(
    private appModule: ConnectClubAppModule,
    private delegate: WsDelegate,
  ) {
    makeAutoObservable(this)

    appEventEmitter.once('updateUserAvatar', this.updateProfile)
    appEventEmitter.once('sendUserMute', this.sendMute)
  }

  connect = async (connectionData: WsConnectionData): Promise<boolean> => {
    this.appModule.onWsMessage = this.parseMessage
    const isSuccess = await this.appModule.connectToRoom(
      JSON.stringify(connectionData),
    )
    logJS('debug', `WebSocketManager connect result:`, isSuccess)
    return isSuccess
  }

  private parseMessage = (message: SocketMessage) => {
    //logJSON(message)
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
          payload.fromId,
          payload.fromName,
          payload.fromSurname,
        )
        break
      case 'serverAbsoluteSpeakerNotify':
        this.delegate.onAbsoluteSpeakerChange(
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
        return appEventEmitter.trigger('finishRoom')
      case 'serverHandsAllowedNotify':
        this.delegate.onSilentModeChange(payload.type === 'banned')
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
            return this.appModule.toggleVideo(false)
          case 'audio':
            toastHelper.success(
              i18n.t('toastDisableAudio', {
                username: profileFullName(
                  payload.fromName,
                  payload.fromSurname,
                ),
              }),
            )
            return this.appModule.toggleAudio(false)
          default:
            throw new Error(
              `passed unsupported type to 'muteRequest', type: ${payload.type}`,
            )
        }
      default:
        break
    }
  }

  absoluteSpeakerMode = (enable: boolean) => {
    this.sendToWs({type: 'becomeAbsoluteSpeaker', payload: {state: enable}})
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

  declineStageCall = (id: string) => {
    this.sendToWs({type: 'declineCallToStage', payload: {inviterId: id}})
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
    logJS(
      'debug',
      'sendTimer to ws seconds:',
      seconds,
      'startUserName:',
      startUserName,
    )
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

  sendRoomSilent = (isEnabled: boolean) => {
    this.sendToWs({type: 'setHandsAllowed', payload: {value: !isEnabled}})
  }

  updateProfile = () => {
    this.sendToWs({type: 'updateProfile', payload: {}})
  }

  private sendToWs(message: SocketMessage) {
    this.appModule.websocketsSendMessage(JSON.stringify(message))
  }

  public destroy = () => {
    appEventEmitter.off('updateUserAvatar', this.updateProfile)
    appEventEmitter.off('sendUserMute', this.sendMute)
  }
}

export default WebSocketManager

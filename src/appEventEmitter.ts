import {logJS} from './components/screens/room/modules/Logger'
import {ClubParams, LanguageModel, RoomParams} from './models'
import {ProfileScreenProps} from './screens/ProfileScreen'
import {delay} from './utils/date.utils'
import {toastHelper} from './utils/ToastHelper'

export type ChatEvent =
  | 'onAuthorized'
  | 'onUnAuthorized'
  | 'loading'
  | 'error'
  | 'clearAllToast'
  | 'updateUserAvatar'
  | 'onRoomDeeplinkReceived'
  | 'onClubDeeplinkReceived'
  | 'onClubRequestDeeplinkReceived'
  | 'onChangeRoom'
  | 'setActiveRoom'
  | 'joinRoom'
  | 'endRoom'
  | 'finishRoom'
  | 'showEventDialog'
  | 'showUserProfile'
  | 'showUserProfileInModal'
  | 'startRoomFromEvent'
  | 'startRoomForChat'
  | 'startRoundTimer'
  | 'stopRoundTimer'
  | 'appInBackground'
  | 'appInForeground'
  | 'moveFromStage'
  | 'moveToStage'
  | 'addToAdmin'
  | 'removeFromAdmin'
  | 'hideEventDialog'
  | 'sendUserMute'
  | 'refreshMainFeed'
  | 'updateFollowingState'
  | 'updateClubJoinedState'
  | 'openRoom'
  | 'collapseRoom'
  | 'closeRoom'
  | 'roomDestroyed'
  | 'navigate'
  | 'leaveRoom'
  | 'userLanguagesSet'
  | 'clubUpdated'
  | 'clubInterestsSelected'
  | 'userClubRoleChanged'
  | 'eventCreated'
  | 'eventUpdated'
  | 'eventDeleted'

export type EventEmitterListener = (...args: any) => void
export interface UpdateFollowingState {
  readonly userId: string
  readonly state: boolean
}
export interface UpdateClubJoinedState {
  readonly userId: string
  readonly state: boolean
}

export const appEventEmitter = {
  listeners: new Map<ChatEvent, Array<EventEmitterListener>>(),

  trigger(event: ChatEvent, ...args: any) {
    this.listeners.get(event)?.forEach((l) => l(...args))
  },

  on(event: ChatEvent, callback: EventEmitterListener): () => void {
    this.listeners.has(event) || this.listeners.set(event, [])
    this.listeners.get(event)?.push(callback)
    return () => this.off(event, callback)
  },

  once(event: ChatEvent, callback: EventEmitterListener): () => void {
    this.listeners.delete(event)
    this.listeners.has(event) || this.listeners.set(event, [])
    this.listeners.get(event)?.push(callback)
    return () => this.off(event, callback)
  },

  off(event: ChatEvent, callback: EventEmitterListener) {
    const listeners = this.listeners.get(event)
    if (!listeners) return
    if (listeners.length === 0) return
    this.listeners.set(
      event,
      listeners.filter((l) => l !== callback),
    )
  },
}

export const clearAllToast = () => {
  toastHelper.clearAll()
  appEventEmitter.trigger('clearAllToast')
}

export function roomHasEndedForParticipants() {
  setTimeout(() => toastHelper.error('theRoomHasEndedForParticipants'), 1000)
}

export function roomHasEndedFor() {
  setTimeout(() => toastHelper.error('theRoomHasEnded'), 1000)
}

export const updateUserAvatar = () => {
  appEventEmitter.trigger('updateUserAvatar')
}

export const showLoading = () => {
  appEventEmitter.trigger('loading', true)
}

export const hideLoading = () => {
  appEventEmitter.trigger('loading', false)
}

export const sendAuthorized = () => {
  appEventEmitter.trigger('onAuthorized')
}

export const sendUnAuthorized = () => {
  logJS('debug', 'sendUnAuthorized')
  hideLoading()
  appEventEmitter.trigger('onUnAuthorized')
}

export const goToClub = (params: ClubParams) => {
  appEventEmitter.trigger('onClubDeeplinkReceived', params)
}

export const goToClubModerate = (params: ClubParams) => {
  appEventEmitter.trigger('onClubRequestDeeplinkReceived', params)
}

export const goToRoom = async (roomParams: RoomParams) => {
  if (!roomParams.room || !roomParams.pswd) {
    logJS(
      'warning',
      'tried go to room without appropriate credentials',
      JSON.stringify(roomParams),
    )
    return toastHelper.error('somethingWentWrong')
  }
  const changeRoomListenersCount =
    appEventEmitter.listeners.get('onChangeRoom')?.length ?? 0
  if (changeRoomListenersCount > 0) {
    // showLoading()
    // const callback = (allow: boolean, error: any) => {
    //   hideLoading()
    //   if (error) logJS('Error on change room', error)
    //   logJS('goToRoom: 💣 Room-Destroy COMPLETED.')
    //   if (allow) appEventEmitter.trigger('onRoomDeeplinkReceived', roomParams)
    // }
    // const changeRoomParams: OnChangeRoomParams = {
    //   roomId: roomParams.room,
    //   callback,
    // }
    // logJS('goToRoom: 💣 Room-Destroy REQUESTED (before changing of a room)')
    // appEventEmitter.trigger('onChangeRoom', changeRoomParams)
    appEventEmitter.trigger(
      'openRoom',
      roomParams.room,
      roomParams.pswd,
      roomParams.eventId,
    )
  } else {
    appEventEmitter.trigger('onRoomDeeplinkReceived', roomParams)
  }
}

export const requestTriggerEventOnReady = async (
  channel: ChatEvent,
  params: any,
) => {
  for (let i = 0; i < 10; i++) {
    const count = appEventEmitter.listeners.get(channel)?.length ?? 0
    if (count > 0) return appEventEmitter.trigger(channel, params)
    await delay(500)
  }
}

export const showUserProfile = async (
  username?: string,
  userId?: string,
  additionalProps?: ProfileScreenProps,
) => {
  if (!username && !userId) {
    logJS(
      'error',
      'requested to show user profile without username or id speicifed',
    )
    return
  }
  logJS('debug', 'showUserProfile', username, userId, additionalProps)
  const count =
    appEventEmitter.listeners.get('showUserProfileInModal')?.length ?? 0
  if (count > 0) {
    logJS(
      'debug',
      'open user profile in modal',
      username,
      userId,
      additionalProps,
    )
    appEventEmitter.trigger('showUserProfileInModal', {
      username,
      userId,
      additionalProps,
    })
    return
  }
  logJS('debug', 'open user profile', username)
  await requestTriggerEventOnReady('showUserProfile', {
    username,
    userId,
    additionalProps,
  })
}

export const showEventDialog = async (eventId: string) => {
  await requestTriggerEventOnReady('showEventDialog', {id: eventId})
}

export const startRoundTimer = (seconds: number, startUserName: string) => {
  appEventEmitter.trigger('startRoundTimer', seconds, startUserName)
}

export const stopRoundTimer = (startUserName: string) => {
  appEventEmitter.trigger('stopRoundTimer', startUserName)
}

// RoomEvents
export const moveToStage = (userId: string, inviteToast: boolean) => {
  appEventEmitter.trigger('moveToStage', userId, inviteToast)
}

export const moveFromStage = (userId: string) => {
  appEventEmitter.trigger('moveFromStage', userId)
}

export const addToAdmin = (userId: string) => {
  appEventEmitter.trigger('addToAdmin', userId)
}

export const removeFromAdmin = (userId: string) => {
  appEventEmitter.trigger('removeFromAdmin', userId)
}

export const hideUpcomingEventDialog = () => {
  appEventEmitter.trigger('hideEventDialog')
}

export const sendUserMute = (id: string, type: 'video' | 'audio') => {
  appEventEmitter.trigger('sendUserMute', id, type)
}

export const sendUpdateFollowingState = (params: UpdateFollowingState) => {
  appEventEmitter.trigger('updateFollowingState', params)
}

export const sendUpdateClubJoinedState = (params: UpdateClubJoinedState) => {
  appEventEmitter.trigger('updateClubJoinedState', params)
}

export const startRoomFromEvent = (
  id: string,
  title: string,
  language: LanguageModel,
  isPrivate: boolean = false,
) => {
  appEventEmitter.trigger('startRoomFromEvent', id, title, language, isPrivate)
}

import {isWeb} from '../../../../utils/device.utils'
import {pixelRatio} from '../Utils'
import {
  Participant,
  RoomImageObject,
  RoomObject,
  RoomSettings,
  UserRoomMode,
  WsCurrentUser,
} from './jsonModels'

const participantToRoomUser = (participant: Participant): Participant => {
  return {
    ...participant,
    hasRadar: participant.isLocal,
  }
}

export const updateCurrentUserFromWs = (
  newUser: WsCurrentUser,
  current: WsCurrentUser,
) => {
  if (current.mode !== newUser.mode) {
    current.mode = newUser.mode
  }

  if (current.isAdmin !== newUser.isAdmin) {
    current.isAdmin = newUser.isAdmin
  }

  if (current.isHandRaised !== newUser.isHandRaised) {
    current.isHandRaised = newUser.isHandRaised
  }
}

export const updateUserFromWs = (
  participant: Participant,
  user: Participant,
) => {
  if (user.isExpired !== participant.isExpired)
    user.isExpired = participant.isExpired
  if (user.isAdmin !== participant.isAdmin) user.isAdmin = participant.isAdmin
  if (user.mode !== participant.mode) user.mode = participant.mode
  if (user.avatar !== participant.avatar) user.avatar = participant.avatar
  if (user.inRadar !== participant.inRadar) user.inRadar = participant.inRadar
  if (user.video !== participant.video) user.video = participant.video
  if (user.audio !== participant.audio) user.audio = participant.audio
  if (user.phoneCall !== participant.phoneCall)
    user.phoneCall = participant.phoneCall
  if (user.isAbsoluteSpeaker !== participant.isAbsoluteSpeaker)
    user.isAbsoluteSpeaker = participant.isAbsoluteSpeaker
}

const roomSettingsResponseToRoomSettings = (
  responseData: any,
): RoomSettings => {
  let shareScreen: any | undefined
  let timeBox: any | undefined
  const images: Array<RoomImageObject> = []

  for (let key of Object.keys(responseData.config.objects)) {
    const object = responseData.config.objects[key]
    if (object.type === 'time_box') {
      timeBox = object
      continue
    }

    if (object.type === 'share_screen') {
      shareScreen = object
      continue
    }

    if (object.type === 'image') {
      object.data = responseData.config.objectsData[key]?.src
      object.title = responseData.config.objectsData[key]?.title
      object.description = responseData.config.objectsData[key]?.description
      images.push(object)
    }
  }

  return {
    name: responseData.name,
    description: responseData.description,
    password: responseData.password,
    draftType: responseData.draftType,
    isSpecialSpeaker: responseData.isSpecialSpeaker,
    params: {
      jitsiServer: responseData.jitsiServer,
      token: responseData.token,
      ownerId: responseData.ownerId,
      isAdmin: responseData.isAdmin,
      isDone: responseData.isDone,
      open: responseData.open,
      chatRoomName: responseData.chatRoomName,
      socketUrl: responseData.config.dataTrackUrl,
      videoWidth: responseData.config.videoQuality.width,
      videoHeight: responseData.config.videoQuality.height,
      isPrivate: responseData.isPrivate,
      clubId: responseData.club,
      eventScheduleId: responseData.eventScheduleId,
    },
    uiConfig: {
      imageMemoryMultiplier: responseData.config.imageMemoryMultiplier,
      backgroundRoomWidthMultiplier:
        responseData.config.backgroundRoomWidthMultiplier,
      backgroundRoomHeightMultiplier:
        responseData.config.backgroundRoomHeightMultiplier,
      background: {
        originalName: responseData.config.backgroundRoom.originalName,
        processedName: responseData.config.backgroundRoom.processedName,
        width: responseData.config.backgroundRoom.width,
        height: responseData.config.backgroundRoom.height,
        originalUrl: responseData.config.backgroundRoom.originalUrl,
        resizerUrl: responseData.config.backgroundRoom.resizerUrl,
        minZoom: responseData.config.minRoomZoom,
        maxZoom: responseData.config.maxRoomZoom,
        initialZoom: responseData.config.initialRoomScale,
      },
      shareScreenPosition: shareScreen,
      timeBoxPosition: timeBox,
      imageObjects: images,
      bubbleSize: responseData.config.videoBubbleSize,
      radarSize: responseData.config.publisherRadarSize,
      withSpeakers: responseData.config.withSpeakers,
    },
  }
}

export const convertRealRoomObjectToLocal = (
  object: RoomObject,
  multiplier: number = 1,
): RoomObject => {
  if (isWeb) {
    return {
      x: object.x * multiplier,
      y: object.y * multiplier,
      width: object.width * multiplier,
      height: object.height * multiplier,
    }
  }
  return {
    x: object.x * pixelRatio,
    y: object.y * pixelRatio,
    width: object.width * pixelRatio,
    height: object.height * pixelRatio,
  }
}

export type ConnectJitsiMode = 'listener' | 'speaker'
export const convertUserRoomModeToConnectJitsiMode = (
  userRoomMode: UserRoomMode,
): ConnectJitsiMode | undefined => {
  switch (userRoomMode) {
    case 'popup':
      return 'listener'
    case 'room':
      return 'speaker'
    default:
      return
  }
}

export {participantToRoomUser, roomSettingsResponseToRoomSettings}

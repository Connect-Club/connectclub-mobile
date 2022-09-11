import {RasterIconType} from '../../../../assets/rasterIcons'
import {ClubId, ServerDraftType, UserBadge} from '../../../../models'
import {Image} from '../../../webSafeImports/webSafeImports'

export interface RoomCredentials {
  readonly roomId: string
  readonly roomPass: string
}

export interface RoomBackgroundConfig {
  readonly originalName: string
  readonly processedName: string
  readonly width: number
  readonly height: number
  readonly originalUrl: string
  readonly resizerUrl: string
  readonly minZoom: number
  readonly maxZoom: number
  readonly initialZoom: number
}

export interface RoomObject {
  x: number
  y: number
  width: number
  height: number
  data?: any
}

export interface RoomImageObject extends RoomObject {
  title?: string
  description?: string
}

export interface RoomUiConfig {
  readonly imageMemoryMultiplier: number
  readonly backgroundRoomWidthMultiplier: number
  readonly backgroundRoomHeightMultiplier: number
  readonly background: RoomBackgroundConfig
  readonly bubbleSize: number
  readonly radarSize: number
  readonly withSpeakers: boolean
  readonly shareScreenPosition?: RoomObject
  readonly timeBoxPosition?: RoomObject
  readonly imageObjects: Array<RoomImageObject>
}

export class RoomSettingsError implements Error {
  constructor(readonly name: string, readonly eventId?: string) {}
  message: string = ''
  stack: string = ''
}

export interface RoomSettings {
  readonly name: string
  readonly password: string
  readonly description: string
  readonly params: {
    readonly jitsiServer: string
    readonly token: string
    readonly eventScheduleId?: string
    readonly clubId?: ClubId
    readonly ownerId: number
    readonly isAdmin: boolean
    readonly isDone: boolean
    readonly open: boolean
    isPrivate: boolean
    readonly chatRoomName: string
    readonly socketUrl: string
    readonly videoWidth: number
    readonly videoHeight: number
  }
  readonly uiConfig: RoomUiConfig
  readonly draftType: ServerDraftType
  readonly isSpecialSpeaker?: boolean
}

export interface WsConnectionData {
  readonly isDebug: boolean
  readonly url: string
  readonly roomId: string
  readonly roomPass: string
  readonly userId: string
  roomWidthMul: number
  roomHeightMul: number
  adaptiveBubbleSize: number
  devicePixelRatio: number
  roomName: string
  address: string
  token: string
  videoWidth: number
  videoHeight: number
  fps: number
  videoEnabled: boolean
  audioEnabled: boolean
}

export interface SocketMessage {
  readonly type: string
  readonly payload: any
}

export interface Participant {
  readonly size: number
  readonly isLocal: boolean
  readonly hasRadar: boolean
  readonly id: string
  readonly name: string
  readonly surname: string
  inRadar: boolean
  avatar: string
  mode: UserRoomMode
  isAdmin: boolean
  isExpired: boolean
  video: boolean
  audio: boolean
  phoneCall: boolean
  badges?: Array<UserBadge>
  isSpecialGuest?: boolean
  isAbsoluteSpeaker?: boolean
}

export type UserRoomMode = 'popup' | 'room'
export const emojiIcons: Record<string, RasterIconType> = {
  sad: 'icEmojiSad',
  like: 'icEmojiLike',
  surprise: 'icEmojiSurprise',
  wave: 'icEmojiWave',
  heart: 'icEmojiHeart',
  think: 'icEmojiThink',
  dislike: 'icEmojiDisLike',
  laugh: 'icEmojiLaugh',
  hung: 'icEmojiHung',
  raise: 'icEmojiRaise',
}

export enum EmojiType {
  sad = 'sad',
  like = 'like',
  surprise = 'surprise',
  wave = 'wave',
  heart = 'heart',
  think = 'think',
  dislike = 'dislike',
  laugh = 'laugh',
  hung = 'hung',
  raise = 'raise',
  none = 'none',
}

export const emojiIconsMap: Record<EmojiType, string> = {
  [EmojiType.sad]: Image.resolveAssetSource(
    require('../../../../assets/img/reactions/icEmojiSad.png'),
  ).uri,
  [EmojiType.like]: Image.resolveAssetSource(
    require('../../../../assets/img/reactions/icEmojiLike.png'),
  ).uri,
  [EmojiType.surprise]: Image.resolveAssetSource(
    require('../../../../assets/img/reactions/icEmojiSurprise.png'),
  ).uri,
  [EmojiType.wave]: Image.resolveAssetSource(
    require('../../../../assets/img/reactions/icEmojiWave.png'),
  ).uri,
  [EmojiType.heart]: Image.resolveAssetSource(
    require('../../../../assets/img/reactions/icEmojiHeart.png'),
  ).uri,
  [EmojiType.think]: Image.resolveAssetSource(
    require('../../../../assets/img/reactions/icEmojiThink.png'),
  ).uri,
  [EmojiType.dislike]: Image.resolveAssetSource(
    require('../../../../assets/img/reactions/icEmojiDisLike.png'),
  ).uri,
  [EmojiType.laugh]: Image.resolveAssetSource(
    require('../../../../assets/img/reactions/icEmojiLaugh.png'),
  ).uri,
  [EmojiType.hung]: Image.resolveAssetSource(
    require('../../../../assets/img/reactions/icEmojiHung.png'),
  ).uri,
  [EmojiType.raise]: Image.resolveAssetSource(
    require('../../../../assets/img/reactions/icEmojiRaise.png'),
  ).uri,
  [EmojiType.none]: 'none',
}

export type WsCurrentUser = {
  isAdmin: boolean
  mode: UserRoomMode
  isHandRaised: boolean
  isAbsoluteSpeaker: boolean
}
export interface WebsocketState {
  current: WsCurrentUser
  raisedHandsCount: number
  handsAllowed: boolean
  absoluteSpeakerPresent: boolean
  room: Array<Participant>
  listenersCount?: number
}

export interface NotificationContent {
  readonly type: string
  readonly title: string
  readonly largeIcon?: any
  readonly largeImage?: any
  readonly specific_key?: string
}

export interface NotificationVideoRoom extends NotificationContent {
  readonly videoRoomId: string
  readonly videoRoomPassword: string
}

export interface NotificationNewUserAskInvite extends NotificationContent {
  readonly phone: string
}

export interface NotificationEventSchedule extends NotificationContent {
  readonly body: string
  readonly eventScheduleId: string
}

export interface NotificationUserRegisteredByInviteCode
  extends NotificationContent {
  readonly userId: string
  readonly phoneNumber: string
}

export interface NotificationClubJoinRequestApproved
  extends NotificationContent {
  readonly clubId: string
  readonly clubTitle: string
}

export interface NotificationInvitedToClub extends NotificationContent {
  readonly clubId: string
}

export interface DeviceInfoRequestBody {
  locale: string
  type: string
  pushToken: string | undefined
  deviceId: string
  model: string
  timeZone: string
}

export interface PopupUsers {
  name: string
  speakersCount: number
  users: PopupUser[]
}

export interface PopupUser {
  id: string
  avatar: string
  isAdmin: boolean
  name: string
  surname: string
  isLocal: boolean
  isOwner: boolean
  reaction: EmojiType
}

export interface ChangeRoomMode {
  mode: UserRoomMode
  firstConnection: boolean
}

export interface SignatureResponse {
  nonce: boolean
  message: string
}

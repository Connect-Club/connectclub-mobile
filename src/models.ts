import {UserRoomMode} from './components/screens/room/models/jsonModels'

export type SetTimeoutReturnType = ReturnType<typeof setTimeout> | null
export type Translation = (
  key: string,
  options?: {[key: string]: any},
) => string
export type Unknown = undefined | null

export type UserState =
  | 'invited'
  | 'not_invited'
  | 'old'
  | 'verified'
  | 'waiting_list'

export type DraftType =
  | 's_broadcasting'
  | 'l_broadcasting'
  | 'multiroom'
  | 's_networking'
  | 'l_networking'

export type ServerDraftType = DraftType | 'gallery'

export type TokenCheckErrorReason =
  | 'token_not_found'
  | 'wallet_not_registered'
  | 'wallet_checking_error'

export const draftTypes: Record<DraftType, number> = {
  s_broadcasting: require('./assets/img/s_broadcast_background.jpeg'),
  l_broadcasting: require('./assets/img/l_broadcast_background.jpeg'),
  multiroom: require('./assets/img/l_multiroom_background.jpg'),
  s_networking: require('./assets/img/s_networking_background.jpeg'),
  l_networking: require('./assets/img/l_networking_background.jpg'),
}

export const draftPreviewTypes: Record<DraftType, number> = {
  s_broadcasting: require('./assets/img/s_broadcasting.jpeg'),
  l_broadcasting: require('./assets/img/l_broadcasting.jpeg'),
  multiroom: require('./assets/img/l_multiroom.jpg'),
  s_networking: require('./assets/img/s_networking.jpeg'),
  l_networking: require('./assets/img/l_networking.jpeg'),
}

export const draftFeedPreviewTypes: Record<string, number> = {
  private: require('./assets/img/networking_card_background.jpeg'),
  public: require('./assets/img/stage_card_background.jpeg'),
  s_broadcasting: require('./assets/img/s_broadcasting_preview.jpeg'),
  l_broadcasting: require('./assets/img/l_broadcasting_preview.jpeg'),
  multiroom: require('./assets/img/l_multiroom_preview.jpg'),
  s_networking: require('./assets/img/s_networking_preview.jpeg'),
  l_networking: require('./assets/img/l_networking_preview.jpeg'),
  gallery: require('./assets/img/gallert_preview.jpeg'),
}

export const draftIndexType: Record<number, DraftType> = {
  0: 'l_broadcasting',
  1: 'l_networking',
  2: 'multiroom',
  3: 's_networking',
  4: 's_broadcasting',
}

export const draftTitles: Record<DraftType, string> = {
  s_broadcasting: 'Small \nbroadcasting room',
  l_broadcasting: 'Large \nbroadcasting room',
  multiroom: 'Multiroom',
  s_networking: 'Small \nnetworking room',
  l_networking: 'Large \nnetworking room',
}

export const privacyPolicyLink = 'https://connect.club/privacy/onlinemeetup'
export const termsLink = 'https://connect.club/terms'
export const faqLink = 'https://intercom.help/connectclub/en/'
export type UserBadge = 'team' | 'speaker' | 'press' | 'new'

//create_later - запланированное событие принадлежит текущему юзеру, текущее время < запланированное время
//create_room - запланированное событие принадлежит текущему юзеру, текущее время >= запланированное время
//join - как для владельца так и для обычного слушателя показывается, когда комната не завершена
//expired - как для владельца так и для обычного слушателя показывается, если комната завершена
export type EventModelState =
  | 'create_later'
  | 'create_room'
  | 'join'
  | 'expired'

export interface ClubBody {
  readonly description?: string
  readonly imageId?: string
  readonly interests?: Array<InterestModel>
  readonly isPublic?: boolean
}

export interface MyClubsResponse {
  readonly items: Array<ClubInfoModel>
}

export interface CreateInviteCodeResponse {
  readonly code: string
}

export interface ClubId {
  readonly id: string
  readonly slug: string
}

export interface ClubInfoModel extends ClubId {
  readonly title: string
  readonly avatar: string
  readonly clubRole: UserClubRole | Unknown
}

export interface InvitedToClubInfoModel extends ClubInfoModel {
  readonly id: string
  readonly title: string
  readonly avatar: string
  readonly by: ClubUser
  readonly joinedAt: number
}

export interface UserModel {
  about?: string
  readonly online: boolean | Unknown
  avatar: string | Unknown
  readonly id: string
  readonly isSpeaker: boolean | Unknown
  readonly name: string | Unknown
  surname: string | Unknown
  readonly username: string
  isFollows: boolean
  isFollowing: boolean
  readonly displayName: string
  readonly joinedBy?: UserModel
  readonly joinedByClubRole?: UserClubRole
  readonly isOwner: boolean | Unknown
  readonly isSpecialGuest: boolean | Unknown
  readonly isDeleted: boolean
  readonly createdAt: number
  readonly lastSeen?: number
  readonly badges?: Array<UserBadge>
  readonly memberOf?: Array<ClubInfoModel>
  readonly invitedTo?: InvitedToClubInfoModel
  readonly clubRole?: UserClubRole
  readonly twitter?: string
  readonly instagram?: string
  readonly linkedin?: string
  readonly alreadyInvitedToClub?: boolean
}

export interface CurrentUser extends UserModel {
  readonly jabberPassword: string
  readonly jabberServer: string
  readonly name: string | null
  readonly surname: string | null
  readonly state: UserState
  readonly interests: Array<InterestModel>
  readonly industries: Array<IndustryModel>
  readonly skills: Array<SkillModel>
  readonly goals: Array<GoalModel>
  readonly language: LanguageModel
  readonly languages: Array<LanguageModel>
  readonly skipNotificationUntil?: number
  readonly wallet: string | null
  readonly enableDeleteWallet?: boolean
}

export interface FullUserModel extends UserModel {
  readonly followers: number
  readonly following: number
  readonly isFollowing: boolean
  readonly isFollows: boolean
  readonly isBlocked: boolean
  readonly interests: Array<InterestModel>
}

export interface FollowedByShortModel {
  readonly users: Array<UserModel>
  readonly totalCount: number
}

export interface ContactModel {
  readonly id: string
  readonly fullName: string
  readonly phoneNumbers: Array<string>
  readonly thumbnail?: string
}

export interface InterestCategoryModel {
  readonly id: number
  readonly name: string
  readonly interests: Array<Array<InterestModel>>
}

export interface InterestModel {
  readonly id: number
  readonly name: string
  readonly isLanguage?: boolean
}

export interface SkillCategoryModel {
  readonly id: string
  readonly name: string
  readonly skills: Array<Array<SkillModel>>
}

export interface SkillModel {
  readonly id: string
  readonly name: string
}

export interface IndustryModel {
  readonly id: string
  readonly name: string
}

export interface GoalModel {
  readonly id: string
  readonly name: string
}

export interface PhoneFormatModel {
  readonly example: string
  readonly pattern: string
  readonly possibleLength: Array<number>
  readonly examplePattern: string
  readonly regionPrefix: string
}

export type PhoneRegion = {[key: string]: PhoneFormatModel}

export interface PhoneFormatsModel {
  readonly availableRegions: PhoneRegion
  readonly detectRegionCode?: string
}

export interface MainFeedItemModel {
  readonly title: string
  readonly isCoHost: boolean
  readonly participants: Array<UserModel>
  readonly listeners: Array<UserModel>
  readonly interests: Array<InterestModel>
  readonly speakers: Array<UserModel>
  readonly speaking: number
  readonly online: number
  readonly isPrivate: boolean | Unknown
  readonly club: ClubInfoModel | Unknown
  readonly description: string | Unknown
  readonly language: LanguageModel | Unknown
  readonly eventScheduleId: string

  readonly roomId: string
  readonly roomPass: string
  readonly withSpeakers: boolean
  /** public, private are legacy */
  readonly draftType: ServerDraftType | 'public' | 'private'
  readonly isDebug?: boolean
}

export interface EventModel {
  readonly id: string
  readonly date: number
  readonly title: string
  readonly description: string
  readonly participants: Array<UserModel>
  readonly isOwned: boolean
  isSubscribed: boolean
  readonly state: EventModelState
  readonly roomId: string | Unknown
  readonly roomPass: string | Unknown
  readonly interests: Array<InterestModel>
  readonly language: LanguageModel
  readonly club: ClubInfoModel | Unknown
  readonly forMembersOnly: boolean | Unknown
  readonly isOwnerToken: boolean
  readonly tokenReason: TokenCheckErrorReason | Unknown
  readonly tokenLandingUrlInformation: string | Unknown
  readonly tokens: Array<TokenInfo> | Unknown
  readonly withToken?: boolean
  readonly isPrivate: boolean
  readonly needApprove?: boolean
}

export type InviteContactStatus =
  | 'new'
  | 'pending'
  | 'invited'
  | 'unknown'
  | 'send_reminder'

export interface UserPhone {
  readonly phone: string
  readonly status: InviteContactStatus
}

export interface InviteContactModel {
  readonly displayName: string
  readonly phone: string
  readonly phones: Array<string>
  readonly additionalPhones: Array<UserPhone>
  readonly countInAnotherUsers: number
  readonly status: InviteContactStatus
  readonly thumbnail?: string
}

export interface BranchEvent {
  error: string | undefined
  params: any
  uri: string | undefined
}

export interface RoomParams {
  room: string | null
  pswd: string | null
  eventId: string | null
}

export interface ClubParams {
  readonly clubId: string
}

export interface InitialDeeplink {
  readonly roomParams?: RoomParams
  readonly clubParams?: ClubParams
}

export interface OnChangeRoomParams {
  readonly roomId: string | null
  readonly callback: (allow: boolean, error: any) => void
}

export interface ToastParams {
  readonly title?: string
  readonly body?: string
  readonly leftImage?: any
  readonly rightImage?: any
}

export interface EventScheduleToastParams extends ToastParams {
  readonly eventId: string
  readonly eventType?: string
}

export interface AskGoToRoomParams extends ToastParams {
  readonly roomParams: RoomParams
  readonly primaryButtonTitleKey?: string
}

export interface AskInviteParams extends ToastParams {
  readonly phone: string
}

export interface JoinRequestApprovedToastParams {
  readonly title: string
  readonly body: string
  readonly clubId: string
  readonly leftImage?: string
  readonly rightImage?: string
}

export interface InvitedToClubToastParams {
  readonly title: string
  readonly body: string
  readonly clubId: string
  readonly leftImage?: string
  readonly rightImage?: string
}

export interface UserRegisteredWithInviteCodeToastParams {
  readonly title: string
  readonly body: string
  readonly userId: string
  readonly image?: string
}

export interface MyCounters {
  hasNewInvites: boolean
  countNewActivities: number
  countFreeInvites: number
  countPendingInvites: number
  countOnlineFriends: number
  showFestivalBanner: boolean
  checkInRoomId: string
  checkInRoomPass: string
  communityLink: string
  joinDiscordLink: string
}

export interface UserCounters {
  connectingCount: number
  connectedCount: number
  mutualFriendsCount: number
}

export enum ActivityModelType {
  askInvite = 'new-user-ask-invite',
  userScheduleEvent = 'user-schedule-event',
  privateMeetingCreated = 'arranged-private-meeting',
  privateMeetingCancelled = 'cancelled-private-meeting',
  privateMeetingApproved = 'approved-private-meeting',
  privateMeetingChanged = 'changed-private-meeting',
  userClubScheduleEvent = 'user-club-schedule-event',
  registeredAsCoHost = 'registered-as-co-host',
  userClubRegisteredAsCoHost = 'user-club-registered-as-co-host',
  userRegistered = 'user-registered',
  roomStarted = 'video-room-started',
  clubRoomStarted = 'club-video-room-started',
  followBecomeSpeaker = 'follow-become-speaker',
  newFollower = 'new-follower',
  connectYouBack = 'connect-you-back',
  welcomeOnBoardingFriend = 'welcome-on-boarding-friend',
  inviteOnBoarding = 'invite-on-boarding',
  invitePrivateVideoRoom = 'invite-private-video-room',
  joinClubApproved = 'join-request-was-approved',
  newClubRequest = 'new-join-request',
  registeredAsSpeaker = 'registered-as-speaker',
  newUserRegisteredByInviteCode = 'new-user-registered-by-invite-code',
  newClubInvite = 'new-club-invite',
  joinOurDiscord = 'join-discord',
  intro = 'intro',
  custom = 'custom',
}

export interface ActivityModel {
  readonly id: string
  readonly type: ActivityModelType
  readonly title: string
  readonly head: string
  readonly relatedUsers: Array<UserModel>
  readonly new: boolean
  readonly createdAt: number
  readonly firstIcon?: string
  readonly secondIcon?: string
}

export interface ActivityAskInviteModel extends ActivityModel {
  readonly phone: string | Unknown
}
export interface ActivityClubRequestModel extends ActivityModel {
  readonly joinRequestId: string | Unknown
  readonly clubId: string | Unknown
}

export interface ActivityClubInviteModel extends ActivityModel {
  readonly clubId: string | Unknown
}
export interface ActivityUserScheduleEventModel extends ActivityModel {
  readonly eventScheduleId: string
  readonly date: number
}
export interface ActivityUserRegisteredModel extends ActivityModel {}
export interface ActivityVideoRoomStartedModel extends ActivityModel {
  readonly roomId: string
  readonly roomPass: string
}
export interface ActivityIntroModel extends ActivityModel {}
export interface ActivityCustomModel extends ActivityModel {
  readonly body: string
  readonly externalLink: string
}

export interface DraftModel {
  readonly id: string
  readonly type: DraftType
}

export interface PurchaseData {
  readonly publicKey: string
  readonly clientSecret: string
}

export interface CreateEventDraft {
  readonly type: DraftType
  readonly roomName: string
  readonly eventId?: string
  readonly userId?: string
  readonly isPrivate?: boolean
  readonly languageId?: number
}

export interface BottomSheetUserEvent {
  nativeEvent: {user: BottomSheetUser}
}

export interface BottomSheetUser {
  readonly isAdmin: boolean
  readonly isOwner: boolean
  readonly mode: UserRoomMode
  readonly id: string
  readonly isLocal: boolean
}

export interface BottomSheetImage {
  readonly imageUri: string
  readonly title: string
  readonly description: string
}

export interface LanguageModel {
  readonly id: number
  readonly name: string
}

export type InitialLinkProp = {
  initialLink?: string
}

export type JoinRequestStatus = 'moderation' | 'cancelled' | 'approved'

export type UserClubRole =
  | 'join_request_moderation'
  | 'guest'
  | 'member'
  | 'moderator'
  | 'owner'

export interface ClubUser {
  readonly id: number
  readonly avatar: string
  readonly displayName: string
}

export interface ClubModel extends ClubInfoModel {
  readonly description: string
  readonly joinRequestStatus: JoinRequestStatus
  readonly clubRole: UserClubRole | Unknown
  readonly joinRequestId?: string
  readonly countParticipants: number
  readonly owner: ClubUser
  readonly members: Array<ClubUser>
  readonly interests: Array<InterestModel>
  readonly togglePublicModeEnabled?: boolean
  readonly isPublic: boolean
}

export interface JoinClubStatusData {
  readonly clubId: string
  readonly joinRequestStatus: JoinRequestStatus
  readonly role: UserClubRole
  readonly joinRequestId: string
}

export interface TokenInfo {
  readonly id: string
  readonly ethereumTokenId: string
  readonly contractAddress: string
  readonly name: string
  readonly description: string
}

export interface ClubJoinRequestModel {
  readonly joinRequestId: string
  readonly user: UserModel
}

export class UserTag {
  constructor(
    readonly userId: string | undefined,
    readonly username: string | undefined,
  ) {}

  hasId() {
    return !!this.userId
  }

  hasUsername() {
    return !!this.username
  }

  isEmpty() {
    return !this.userId && !this.hasUsername()
  }
}

export type UtmLabels = {
  campaign?: string
  source?: string
  content?: string
}

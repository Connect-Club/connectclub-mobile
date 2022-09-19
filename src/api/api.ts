import {Result} from '@badrap/result'
import {Platform} from 'react-native'
import {getAndroidId, getModel} from 'react-native-device-info'
import {getLocales} from 'react-native-localize'

import buildConfig from '../buildConfig'
import {
  DeviceInfoRequestBody,
  RoomCredentials,
  RoomSettings,
  RoomSettingsError,
  SignatureResponse,
} from '../components/screens/room/models/jsonModels'
import {roomSettingsResponseToRoomSettings} from '../components/screens/room/models/mappers'
import {ConnectClubAppModule} from '../components/screens/room/modules/AppModule'
import {logJS} from '../components/screens/room/modules/Logger'
import {
  ActivityModel,
  ClubBody,
  ClubJoinRequestModel,
  ClubModel,
  ContactModel,
  CreateInviteCodeResponse,
  CurrentUser,
  DraftModel,
  EventModel,
  FollowedByShortModel,
  FullUserModel,
  GoalModel,
  IndustryModel,
  InterestCategoryModel,
  InterestModel,
  InviteContactModel,
  JoinClubStatusData,
  LanguageModel,
  MainFeedItemModel,
  MyClubsResponse,
  MyCounters,
  PhoneFormatsModel,
  SkillCategoryModel,
  SkillModel,
  TokenInfo,
  Unknown,
  UserCounters,
  UserModel,
  UserState,
  UtmLabels,
} from '../models'
import {delay} from '../utils/date.utils'
import {requestNotificationToken} from '../utils/permissions.utils'
import {
  HttpClient,
  httpClient,
  NetworkStateListener,
  Paginated,
  RestResponse,
} from './httpClient'

export interface UpdateProfile {
  readonly about?: string
  readonly username?: string
  readonly name?: string
  readonly surname?: string
  readonly avatar?: number
  readonly interests?: Array<InterestModel>
  readonly industries?: Array<IndustryModel>
  readonly skills?: Array<SkillModel>
  readonly goals?: Array<GoalModel>
  readonly skipNotificationUntil?: number
  readonly languages?: Array<LanguageModel>
  readonly twitter?: string
  readonly instagram?: string
  readonly linkedin?: string
}

export const MUTUAL_SHORT_INFO_USERS_LIMIT = 3

class Api {
  private networkStateListeners = new Set<NetworkStateListener>()

  constructor(private endpoint: string, private client: HttpClient) {
    client.onNetworkStateChanged = (isReachable: boolean) => {
      this.networkStateListeners.forEach((callback) => callback(isReachable))
    }
  }

  addNetworkStateListener = (listener: NetworkStateListener) =>
    this.networkStateListeners.add(listener)

  removeNetworkStateListener = (listener: NetworkStateListener) =>
    this.networkStateListeners.delete(listener)

  start = async () => {
    await this.client.initialize(this.endpoint)
    await this.client.startListenNetwork()
  }

  setAmplitudeIds = (sessionId: string, deviceId: string) => {
    this.client.setAmplitudeIds(sessionId, deviceId)
  }

  recordInstall = async (utm?: string): Promise<RestResponse<any>> => {
    const deviceId = await getDeviceIdInternal()
    const body = JSON.stringify({deviceId, utm, platform: Platform.OS})
    return await this.client.request<any>({
      endpoint: `${this.endpoint}/v1/statistics/installation`,
      method: 'POST',
      useAuthorizeHeader: false,
      body,
    })
  }

  stop = () => {
    this.client.stopListenNetwork()
  }

  isAuthorized = async (): Promise<boolean> => {
    return this.client.isAuthorized()
  }

  isConnectedToNetwork = () => this.client.connectedToNetwork()

  loadRoomSettings = async (
    roomCredentials: RoomCredentials,
  ): Promise<Result<RoomSettings, RoomSettingsError>> => {
    const response = await this.client.request<any>({
      endpoint: `${this.endpoint}/v2/video-room/token/${roomCredentials.roomId}`,
      method: 'POST',
      body: JSON.stringify({password: roomCredentials.roomPass}),
    })
    if (response.error) {
      return Result.err(
        new RoomSettingsError(response.error, response.data?.eventId),
      )
    }
    return Result.ok(roomSettingsResponseToRoomSettings(response.data))
  }

  fetchPhoneNumberFormats = async (): Promise<
    RestResponse<PhoneFormatsModel>
  > => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/location/phone-number-formats`,
      useAuthorizeHeader: false,
    })
  }

  getSMSCode = async (phone: string) => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/sms/verification`,
      method: 'POST',
      body: {phone},
      useAuthorizeHeader: false,
      generateJwt: true,
    })
  }

  fetchTokenBySMSCode = async (
    code: string,
    phone: string,
    clubId?: string,
    inviteCode?: string,
    utmLabels?: UtmLabels,
  ): Promise<RestResponse<any>> => {
    try {
      let response = await this.client.authorize<any>(
        phone,
        code,
        clubId ?? '',
        inviteCode ?? '',
        utmLabels?.campaign ?? '',
        utmLabels?.content ?? '',
        utmLabels?.source ?? '',
      )
      if (response.error) return response
      response = await this.current()
      return response
    } catch (e) {
      logJS('error', 'fetch token error:', JSON.stringify(e))
      return {error: 'errorCode'}
    }
  }

  fetchTokenWithWallet = async (
    message: string,
    address: string,
    signature: string,
    clubId?: string,
    inviteCode?: string,
    utmLabels?: UtmLabels,
  ): Promise<RestResponse<any>> => {
    logJS(
      'debug',
      'Api',
      'fetch token with wallet',
      message,
      address,
      signature,
    )
    const deviceId = await getDeviceIdInternal()
    try {
      let response = await this.client.authorizeWithWallet<any>(
        message,
        address,
        signature,
        deviceId,
        clubId ?? '',
        inviteCode ?? '',
        utmLabels?.campaign ?? '',
        utmLabels?.content ?? '',
        utmLabels?.source ?? '',
      )
      if (response.error) {
        logJS(
          'debug',
          'Api',
          'error fetching token with wallet',
          response.error,
        )
        return response
      }
      logJS('debug', 'fetched token with wallet')
      return await this.current()
    } catch (e) {
      logJS('error', 'fetch token with wallet error:', JSON.stringify(e))
      return {error: JSON.stringify(e)}
    }
  }

  current = async (): Promise<RestResponse<CurrentUser>> => {
    return await this.client.request({endpoint: `${this.endpoint}/v2/account`})
  }

  fetchInterests = async (): Promise<Array<InterestModel>> => {
    const response = await this.client.request<Array<InterestCategoryModel>>({
      endpoint: `${this.endpoint}/v1/interests`,
    })
    return response.data ?? []
  }

  fetchSkills = async (): Promise<RestResponse<Array<SkillCategoryModel>>> => {
    const response = await this.client.request<Array<SkillCategoryModel>>({
      endpoint: `${this.endpoint}/v1/reference/skills`,
      query: ``,
    })
    if (response.error) return {error: response.error}
    return {data: response.data}
  }

  fetchIndustries = async (): Promise<RestResponse<Array<IndustryModel>>> => {
    const response = await this.client.request<Array<IndustryModel>>({
      endpoint: `${this.endpoint}/v1/reference/industries`,
      query: '',
    })
    if (response.error) return {error: response.error}
    return {data: response.data}
  }

  fetchGoals = async (): Promise<RestResponse<Array<GoalModel>>> => {
    const response = await this.client.request<Array<GoalModel>>({
      endpoint: `${this.endpoint}/v1/reference/goals`,
      query: '',
    })
    if (response.error) return {error: response.error}
    return {data: response.data}
  }

  fetchUserProfile = async (
    userId: string,
  ): Promise<RestResponse<FullUserModel>> => {
    const response = await this.client.request<Array<FullUserModel>>({
      endpoint: `${this.endpoint}/v2/users`,
      method: 'POST',
      body: [userId],
    })
    if (response.error) return {error: response.error}
    if (!response.data || response.data.length === 0) {
      return {error: 'userNotFound'}
    }
    return {data: response.data[0]}
  }

  fetchUserInfo = async (
    username: string,
  ): Promise<RestResponse<UserModel>> => {
    return await this.client.request<UserModel>({
      endpoint: `${this.endpoint}/v1/user/${username}/info`,
      method: 'GET',
    })
  }

  updateProfile = async (
    data: UpdateProfile,
  ): Promise<RestResponse<CurrentUser>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v2/account`,
      method: 'PATCH',
      body: data,
    })
  }

  fetchFollowers = async (
    userId: string,
    pendingOnly: boolean,
    mutualOnly: boolean,
    lastValue: string | Unknown = null,
  ): Promise<RestResponse<Paginated<UserModel>>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/follow/${userId}/followers`,
      query: `lastValue=${lastValue}&pendingOnly=${
        pendingOnly ? 1 : 0
      }&mutualOnly=${mutualOnly ? 1 : 0}`,
    })
  }

  fetchFollowing = async (
    userId: string,
    exceptMutual: boolean,
    lastValue: string | Unknown = null,
  ): Promise<RestResponse<Paginated<UserModel>>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/follow/${userId}/following`,
      query: `lastValue=${lastValue}&exceptMutual=${exceptMutual ? 1 : 0}`,
    })
  }

  fetchMutual = async (
    userId: string,
    lastValue: string | Unknown = null,
    limit?: number,
  ): Promise<RestResponse<Paginated<UserModel>>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/follow/${userId}/mutual-friends`,
      query: `lastValue=${lastValue}&limit=${limit}`,
    })
  }

  fetchFollowedByShortInfo = async (
    userId: string,
  ): Promise<RestResponse<FollowedByShortModel>> => {
    const mutualResponse = await this.fetchMutual(
      userId,
      null,
      MUTUAL_SHORT_INFO_USERS_LIMIT,
    )
    return {
      data: {
        users: mutualResponse.data?.items ?? [],
        totalCount: mutualResponse.data?.totalCount ?? 0,
      },
    }
  }

  fetchMainFeed = async (
    lastValue: string | Unknown = null,
  ): Promise<RestResponse<Paginated<MainFeedItemModel>>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/event/online`,
      query: `lastValue=${lastValue}`,
    })
  }

  fetchMainFeedCalendar = async (): Promise<
    RestResponse<Paginated<EventModel>>
  > => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/event-schedule/upcoming`,
      query: `limit=10`,
    })
  }

  fetchUpcomingEvents = async (
    clubId: string | Unknown = null,
    lastValue: string | Unknown = null,
  ): Promise<RestResponse<Paginated<EventModel>>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/event-schedule/upcoming`,
      query: `lastValue=${lastValue}&clubId=${clubId}&isCalendar=true`,
    })
  }

  fetchUpcomingEvent = async (
    id: string,
  ): Promise<RestResponse<EventModel>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/event-schedule/${id}`,
    })
  }

  fetchPersonalUpcomingEvents = async (
    lastValue: string | Unknown = null,
  ): Promise<RestResponse<Paginated<EventModel>>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/event-schedule/personal`,
      query: `lastValue=${lastValue}`,
    })
  }

  uploadClubAvatar = async (
    imageUri: string,
    clubId?: string,
  ): Promise<RestResponse<any>> => {
    logJS('info', 'Api', 'upload club avatar', imageUri)
    const sourceUri = imageUri?.replace('file://', '')

    try {
      const response = await this.client.request<{id: string}>({
        endpoint: `${this.endpoint}/v1/upload`,
        method: 'POST',
        file: sourceUri!,
      })
      if (response.error) return {error: response.error}
      return this.client.request({
        endpoint: `${this.endpoint}/v1/club/${clubId}`,
        method: 'PATCH',
        body: {imageId: response.data!.id},
      })
    } catch (e) {
      logJS('error', 'Api', 'Upload club avatar error:', JSON.stringify(e))
      return {error: 'unknownError'}
    }
  }

  uploadAvatar = async (
    imageUri?: string,
  ): Promise<RestResponse<CurrentUser>> => {
    logJS('info', 'Api.uploadAvatar', imageUri)
    const sourceUri = imageUri?.replace('file://', '')

    try {
      const response = await this.client.request<{id: string}>({
        endpoint: `${this.endpoint}/v1/upload/user-photo`,
        method: 'POST',
        file: sourceUri!,
      })
      if (response.error) return {error: response.error}
      return this.client.request({
        endpoint: `${this.endpoint}/v2/account`,
        method: 'PATCH',
        body: {avatar: response.data!.id},
      })
    } catch (e) {
      logJS('error', 'Upload avatar error:', JSON.stringify(e))
      return {error: 'unknownError'}
    }
  }

  fetchContactRecommendations = async (): Promise<
    RestResponse<Paginated<UserModel>>
  > => {
    let response: RestResponse<Paginated<UserModel>>
    let tryNumber = 1
    do {
      if (tryNumber > 1) await delay(500)
      response = await this.client.request({
        endpoint: `${this.endpoint}/v1/follow/recommended/contacts`,
      })
      // Repeat the request if contacts are processing on backend yet
    } while (response.code === 423 && tryNumber++ < 20)
    return response
  }

  fetchUsers = async (params?: {
    search?: string | null
    lastValue?: string | null
    limit?: number | null
  }): Promise<RestResponse<Paginated<UserModel>>> => {
    const search = params?.search
      ? `!${encodeURIComponent(params.search)}`
      : null
    return this.client.request({
      endpoint: `${this.endpoint}/v1/user/search`,
      query: `search=${search}&lastValue=${params?.lastValue ?? null}&limit=${
        params?.limit ?? null
      }`,
    })
  }

  fetchSimilarRecommendations = async (
    lastValue: string | Unknown = null,
  ): Promise<RestResponse<Paginated<UserModel>>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/follow/recommended`,
      query: `lastValue=${lastValue}`,
    })
  }

  uploadContacts = async (contacts: Array<ContactModel>) => {
    return this.client.request({
      endpoint: `${this.endpoint}/v2/contact-phone`,
      method: 'POST',
      body: {contacts},
    })
  }

  verifyUser = async (state: UserState = 'verified') => {
    return this.client.request({
      endpoint: `${this.endpoint}/v2/account/${state}/state`,
      method: 'PATCH',
    })
  }

  availableToChat = async (
    lastValue: string | Unknown = null,
  ): Promise<RestResponse<Paginated<UserModel>>> => {
    const lastDayWasOnline = true
    return this.client.request({
      endpoint: `${this.endpoint}/v1/follow/friends`,
      query: `lastValue=${lastValue}&lastDayWasOnline=${lastDayWasOnline}`,
    })
  }

  follow = async (ids: Array<string>) => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/follow/subscribe`,
      method: 'POST',
      body: ids,
    })
  }

  unfollow = async (userId: string) => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/follow/${userId}/unsubscribe`,
      method: 'POST',
    })
  }

  toggleFollow = async (userId: string, isFollowing: boolean) => {
    const url = isFollowing
      ? `v1/follow/${userId}/unsubscribe`
      : `v1/follow/subscribe`
    const body = isFollowing ? undefined : [userId]
    return this.client.request({
      endpoint: `${this.endpoint}/${url}`,
      method: 'POST',
      body: body,
    })
  }

  sendDevice = async (pushToken: string | Unknown) => {
    const body = await getDeviceInfoBody(pushToken ?? undefined)
    return this.client.request({
      endpoint: `${this.endpoint}/v1/device`,
      method: 'POST',
      body,
    })
  }

  getInviteContactsList = async (
    lastValue: string | Unknown = null,
    getPending: boolean | Unknown = null,
    search: string | Unknown = null,
  ): Promise<RestResponse<Paginated<InviteContactModel>>> => {
    let query = `lastValue=${lastValue}`
    if (search) query += `&search=${search}`
    let response: RestResponse<Paginated<InviteContactModel>>
    let tryNumber = 1
    do {
      if (tryNumber > 1) await delay(500)
      response = await this.client.request({
        endpoint: `${this.endpoint}/${
          getPending ? 'v1/contact-phone/pending' : 'v2/contact-phone'
        }`,
        method: 'GET',
        query: query,
      })
      // Repeat the request if contacts are processing on backend yet
    } while (response.code === 423 && tryNumber++ < 20)
    return response
  }

  createInvite = async (phone: string) => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/invite`,
      method: 'POST',
      body: {phone},
    })
  }

  createInviteForUser = async (userId: string) => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/invite/${userId}`,
      method: 'POST',
    })
  }

  createInviteCode = async (): Promise<
    RestResponse<CreateInviteCodeResponse>
  > => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/invite/code`,
      method: 'GET',
    })
  }

  fetchFriends = async (params?: {
    search?: string | null
    forPingInVideoRoom?: string | null
    lastValue?: string | null
    forInviteClub?: string | null
  }): Promise<RestResponse<Paginated<UserModel>>> => {
    const search = params?.search
      ? `!${encodeURIComponent(params.search)}`
      : null
    return this.client.request({
      endpoint: `${this.endpoint}/v1/follow/friends`,
      query: `search=${search}&lastValue=${
        params?.lastValue ?? null
      }&forPingInVideoRoom=${
        params?.forPingInVideoRoom ?? null
      }&forInviteClub=${params?.forInviteClub}`,
    })
  }

  createEvent = async (
    unixDate: number,
    name: string,
    description: string,
    moderators: Array<UserModel>,
    specialGuests: Array<UserModel>,
    interests: Array<InterestModel>,
    isPrivate: boolean,
    languageId?: number,
    clubId?: string,
    forMembersOnly?: boolean,
    selectedTokenIds?: Array<string>,
  ): Promise<RestResponse<any>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/event-schedule`,
      method: 'POST',
      body: {
        title: name,
        description: description,
        date: unixDate,
        participants: moderators,
        specialGuests: specialGuests,
        interests,
        language: languageId,
        clubId: clubId,
        forMembersOnly: forMembersOnly,
        tokenIds: selectedTokenIds,
        isPrivate: isPrivate,
      },
    })
  }

  updateEvent = async (
    eventId: string,
    unixDate: number,
    name: string,
    description: string,
    moderators: Array<UserModel>,
    specialGuests: Array<UserModel>,
    interests: Array<InterestModel>,
    isPrivate: boolean,
    languageId?: number,
    clubId?: string,
    forMembersOnly?: boolean,
    selectedTokenIds?: Array<string>,
  ): Promise<RestResponse<any>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/event-schedule/${eventId}`,
      method: 'PATCH',
      body: {
        title: name,
        description: description,
        date: unixDate,
        participants: moderators,
        specialGuests: specialGuests,
        interests,
        language: languageId,
        clubId: clubId,
        forMembersOnly: forMembersOnly,
        tokenIds: selectedTokenIds,
        isPrivate: isPrivate,
      },
    })
  }

  approveEvent = async (id: string) => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/event-schedule/${id}/approve`,
      method: 'POST',
    })
  }

  cancelEvent = async (id: string) => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/event-schedule/${id}/cancel`,
      method: 'POST',
    })
  }

  deleteEvent = async (id: string) => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/event-schedule/${id}`,
      method: 'DELETE',
    })
  }

  fetchListUsers = async (
    ids: Array<string>,
  ): Promise<RestResponse<Array<UserModel>>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v2/users`,
      method: 'POST',
      body: ids,
    })
  }

  myCounters = async (): Promise<RestResponse<MyCounters>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/interface`,
    })
  }

  userCounters = async (
    userId: string,
  ): Promise<RestResponse<UserCounters>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/follow/${userId}/counters`,
    })
  }

  readHasInvites = async (): Promise<RestResponse<MyCounters>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/interface/read-notification-new-invites`,
      method: 'POST',
    })
  }

  fetchActivity = async (
    lastValue: string | Unknown = null,
  ): Promise<RestResponse<Paginated<ActivityModel>>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/activity`,
      method: 'GET',
      query: `lastValue=${lastValue}`,
    })
  }

  deleteActivity = async (id: string) => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/activity/${id}`,
      method: 'DELETE',
    })
  }

  markActivitiesAsReed = async (idOfLatest: string) => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/activity/${idOfLatest}/read`,
      method: 'POST',
    })
  }

  getAvailableRoomDrafts = async (): Promise<
    RestResponse<Array<DraftModel>>
  > => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/event-draft`,
    })
  }

  notificationStatistics = (code: string) => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/notification/statistic/${code}`,
      method: 'POST',
    })
  }

  startRoom = async (
    draftId: string,
    title: string,
    isPrivate: boolean,
    eventId?: string,
    userId?: string,
    languageId?: number,
  ): Promise<RestResponse<MainFeedItemModel>> => {
    let body: any = {}
    if (title.length > 0) body.title = title
    if (eventId) body.eventScheduleId = eventId
    if (userId) body.userId = userId
    if (languageId) body.language = languageId
    body.isPrivate = isPrivate
    return this.client.request({
      endpoint: `${this.endpoint}/v1/event-draft/${draftId}/event`,
      method: 'POST',
      body: body,
    })
  }

  inviteFriendToRoom = async (userId: string, roomId: string) => {
    await this.client.request({
      endpoint: `${this.endpoint}/v2/users/${userId}/${roomId}/ping`,
      method: 'POST',
    })
  }

  closeRoom = async (id: string) => {
    await this.client.request({
      endpoint: `${this.endpoint}/v1/event/${id}/close`,
      method: 'POST',
    })
  }

  makeRoomPrivate = (id: string) => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/event/${id}/public`,
      method: 'POST',
    })
  }

  sendComplain = async (
    userId: string,
    reason: string,
    description: string,
  ) => {
    return this.client.request({
      endpoint: `${this.endpoint}/v2/complaint/${userId}`,
      method: 'POST',
      body: {
        reason,
        description,
      },
    })
  }

  createShareDesktopLink = async (roomId: string) => {
    return this.client.request<any>({
      endpoint: `${this.endpoint}/v1/video-room/${roomId}/sharing`,
      method: 'POST',
    })
  }

  fetchAppVersion = async (platform: string): Promise<RestResponse<any>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/mobile-app-version`,
      query: `platform=${platform.toLowerCase()}&version=2`,
      useAuthorizeHeader: false,
    })
  }

  endRoom = async (roomName: string) => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/event/${roomName}/close`,
      method: 'POST',
    })
  }

  logout = async () => {
    if (!(await this.client.isAuthorized())) return
    const token = await requestNotificationToken()
    const body = await getDeviceInfoBody(token)
    await this.client.request({
      endpoint: `${this.endpoint}/v1/account/logout`,
      method: 'POST',
      body: body,
    })
  }

  subscribeOnEvent = async (eventId: string) => {
    return await this.client.request({
      endpoint: `${this.endpoint}/v1/event-schedule/${eventId}/subscribe`,
      method: 'POST',
    })
  }
  unSubscribeFromEvent = async (eventId: string) => {
    return await this.client.request({
      endpoint: `${this.endpoint}/v1/event-schedule/${eventId}/unsubscribe`,
      method: 'POST',
    })
  }

  ban = async (roomName: string, abuserId: string) => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/video-room/ban/${roomName}/${abuserId}`,
      method: 'POST',
    })
  }

  block = async (userId: string) => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/user/${userId}/block`,
      method: 'POST',
    })
  }

  unblock = async (userId: string) => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/user/${userId}/unblock`,
      method: 'POST',
    })
  }

  getLanguages = async (): Promise<RestResponse<Array<LanguageModel>>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/language`,
      method: 'GET',
    })
  }

  sendDeleteAccountRequest = async (): Promise<RestResponse<any>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v2/users/delete-request`,
      method: 'POST',
    })
  }

  sendLogFile = async (bodyText?: string): Promise<boolean> =>
    this.client.sendLogFile(bodyText ?? '')

  sendPreservedLogFile = async (bodyText?: string): Promise<boolean> =>
    this.client.sendPreservedLogFile(bodyText ?? '')

  fetchMyClubs = async (
    authorized: boolean = false,
  ): Promise<RestResponse<MyClubsResponse>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/club/my`,
      method: 'GET',
      useAuthorizeHeader: authorized,
      query: 'lastValue=0&limit=100',
    })
  }

  addNewClub = async (title: string): Promise<RestResponse<any>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/club`,
      method: 'POST',
      body: {
        title,
      },
    })
  }

  updateClubInfo = async (
    clubId: string,
    {description, imageId, interests, isPublic}: ClubBody,
  ): Promise<RestResponse<any>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/club/${clubId}`,
      method: 'PATCH',
      body: {description, imageId, interests, isPublic},
    })
  }

  updateClubInterests = async (
    clubId: string,
    interests: Array<InterestModel>,
  ): Promise<any> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/club/${clubId}`,
      method: 'PATCH',
      body: {interests},
    })
  }

  createInvitationLink = async (clubId: string): Promise<any> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/club/${clubId}/invitation-code`,
      method: 'POST',
    })
  }

  inviteToClubFromNetwork = async (
    clubId: string,
    userId: string,
  ): Promise<RestResponse<JoinClubStatusData>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/club/${clubId}/${userId}`,
      method: 'POST',
    })
  }

  inviteToClubAllNetwork = async (
    clubId: string,
  ): Promise<RestResponse<any>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/club/${clubId}/all`,
      method: 'POST',
    })
  }

  getClub = async (
    clubId: string,
    authorized: boolean = false,
  ): Promise<RestResponse<ClubModel>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/club/${clubId}`,
      method: 'GET',
      useAuthorizeHeader: authorized,
    })
  }

  fetchClubMembers = async (
    clubId: string,
    lastValue: string | Unknown = null,
    limit?: number,
    search?: string,
  ): Promise<RestResponse<Paginated<UserModel>>> => {
    let query = `lastValue=${lastValue}&limit=${limit}`
    if (search) {
      query += '&search=' + search
    }
    return this.client.request({
      endpoint: `${this.endpoint}/v1/club/${clubId}/members`,
      method: 'GET',
      query,
    })
  }

  joinClub = async (
    clubId: string,
  ): Promise<RestResponse<JoinClubStatusData>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/club/${clubId}/join`,
      method: 'POST',
    })
  }

  leaveClub = async (
    clubId: string,
  ): Promise<RestResponse<JoinClubStatusData>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/club/${clubId}/leave`,
      method: 'POST',
    })
  }

  fetchClubJoinRequests = async (
    clubId: string,
    lastValue: string | Unknown = null,
    limit?: number,
    search?: string,
  ): Promise<RestResponse<Paginated<ClubJoinRequestModel>>> => {
    let query = `lastValue=${lastValue}&limit=${limit}`
    if (search) {
      query += '&search=' + search
    }
    return this.client.request({
      endpoint: `${this.endpoint}/v1/club/${clubId}/join-requests`,
      query,
    })
  }

  fetchMyJoinRequests = async (
    lastValue: string | Unknown = null,
    limit?: number,
  ): Promise<RestResponse<Paginated<JoinClubStatusData>>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/club/join-requests`,
      query: `lastValue=${lastValue}&limit=${limit}`,
    })
  }

  fetchSuggestedClubs = async (
    lastValue: number | string | Unknown = null,
    limit?: number,
  ): Promise<RestResponse<Paginated<ClubModel>>> => {
    return this.client.request({
      endpoint: `${this.endpoint}/v1/club/relevant`,
      query: `lastValue=${lastValue}&limit=${limit}`,
    })
  }

  searchClubs = async (
    search: string | Unknown,
    lastValue: number | string | Unknown = null,
    limit?: number,
  ): Promise<RestResponse<Paginated<ClubModel>>> => {
    let query = ''
    if (search) query += `&search=${search}`
    return this.client.request({
      endpoint: `${this.endpoint}/v1/club/explore`,
      query: `lastValue=${lastValue}&limit=${limit}${query}`,
    })
  }

  acceptClubJoinRequest = async (
    requestId: string,
  ): Promise<RestResponse<ClubModel>> => {
    return this.client.request({
      method: 'POST',
      endpoint: `${this.endpoint}/v1/club/${requestId}/approve`,
    })
  }

  rejectClubJoinRequest = async (
    requestId: string,
  ): Promise<RestResponse<ClubModel>> => {
    return this.client.request({
      method: 'POST',
      endpoint: `${this.endpoint}/v1/club/${requestId}/cancel`,
    })
  }

  getClubTokens = async (
    clubId: string,
  ): Promise<RestResponse<Array<TokenInfo>>> => {
    return this.client.request({
      method: 'GET',
      endpoint: `${this.endpoint}/v1/smart-contract/club/${clubId}/tokens`,
    })
  }

  getUserParticipatedClubs = async (
    userId: string,
    lastValue: string | Unknown = null,
    limit?: number,
  ): Promise<RestResponse<Paginated<ClubModel>>> => {
    let query = ''
    if (lastValue) query += 'lastValue=' + lastValue
    if (limit) query += 'limit=' + limit
    return this.client.request({
      method: 'GET',
      endpoint: `${this.endpoint}/v1/club/${userId}/participant`,
      query,
    })
  }

  makeUserClubModerator = async (
    clubId: string,
    userId: string,
  ): Promise<RestResponse<any>> => {
    return this.client.request({
      method: 'POST',
      endpoint: `${this.endpoint}/v1/club/${clubId}/${userId}/moderator`,
    })
  }

  removeClubModerator = async (
    clubId: string,
    userId: string,
  ): Promise<RestResponse<any>> => {
    return this.client.request({
      method: 'DELETE',
      endpoint: `${this.endpoint}/v1/club/${clubId}/${userId}/moderator`,
    })
  }

  removeClubMember = async (
    clubId: string,
    userId: string,
  ): Promise<RestResponse<any>> => {
    return this.client.request({
      method: 'DELETE',
      endpoint: `${this.endpoint}/v1/club/${clubId}/${userId}`,
    })
  }

  getWalletSignatureWithNonce = async (): Promise<
    RestResponse<SignatureResponse>
  > => {
    return this.client.request({
      method: 'POST',
      endpoint: `${this.endpoint}/v1/user/wallet/signature`,
    })
  }

  getAuthSignatureWithNonce = async (): Promise<
    RestResponse<SignatureResponse>
  > => {
    const deviceId = await getDeviceIdInternal()
    return this.client.request({
      method: 'POST',
      endpoint: `${this.endpoint}/v1/user/wallet/auth-signature`,
      useAuthorizeHeader: false,
      body: {deviceId},
    })
  }

  setWalletWithSignatureAddress = async (
    text: string,
    address: string,
    signature: string,
  ): Promise<RestResponse<Record<string, any>>> => {
    return this.client.request({
      method: 'POST',
      endpoint: `${this.endpoint}/v1/user/wallet`,
      body: {text, address, signature},
    })
  }

  deleteWallet = async (): Promise<RestResponse<Record<string, any>>> => {
    return this.client.request({
      method: 'DELETE',
      endpoint: `${this.endpoint}/v1/user/wallet`,
    })
  }
}

const getDeviceInfoBody = async (
  pushToken?: string,
): Promise<DeviceInfoRequestBody> => {
  let deviceId: string = await getDeviceIdInternal()
  return {
    locale: getLocales()?.[0]?.languageCode,
    type: `${Platform.OS.toLowerCase()}-react`,
    pushToken: pushToken,
    deviceId: deviceId,
    model: getModel(),
    timeZone: new Date().getTimezoneOffset().toString(),
  }
}

const getDeviceIdInternal = async (): Promise<string> => {
  if (Platform.OS === 'ios') {
    const module = new ConnectClubAppModule()
    return await module.getUniqueDeviceId()
  } else {
    return getAndroidId()
  }
}

function getEndpoint(): string {
  switch (buildConfig.releaseStage) {
    case 'testing':
      return 'http://DOCKER_HOST_ADDRESS:8091/api'
    case 'staging':
      return 'https://api.stage.connect.club/api'
    case 'production':
      return 'https://api.connect.club/api'
    default:
      throw `unknown release stage ${buildConfig.releaseStage}`
  }
}

const endpoint = getEndpoint()

export const api = new Api(endpoint, httpClient)

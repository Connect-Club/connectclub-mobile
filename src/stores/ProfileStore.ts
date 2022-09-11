import {
  action,
  computed,
  makeAutoObservable,
  observable,
  runInAction,
} from 'mobx'

import {analytics} from '../Analytics'
import {api} from '../api/api'
import {
  hideLoading,
  sendUpdateClubJoinedState,
  sendUpdateFollowingState,
  showLoading,
} from '../appEventEmitter'
import {logJS} from '../components/screens/room/modules/Logger'
import {
  ActivityModelType,
  FollowedByShortModel,
  FullUserModel,
  UserTag,
} from '../models'
import {storage} from '../storage'
import {runWithLoaderAsync} from '../utils/navigation.utils'
import {toastHelper} from '../utils/ToastHelper'
import {ActivityStore} from './ActivityStore'

export class ProfileStore {
  private userTag: UserTag

  constructor(userTag: UserTag) {
    if (userTag.isEmpty()) throw 'received empty user tag'
    this.userTag = userTag
    logJS('debug', 'ProfileStore', 'init', JSON.stringify(userTag))
    // @ts-ignore
    makeAutoObservable(this, {userTag: false})
  }

  @observable
  user?: FullUserModel

  @observable
  followedByShortInfo?: FollowedByShortModel

  @observable
  isLoading = false

  @observable
  isTogglingFollowing = false

  @observable
  error: any | undefined

  @computed
  get userId(): string {
    return this.user?.id ?? ''
  }

  get username(): string {
    return this.userTag.username ?? ''
  }

  get isCurrentUser(): boolean {
    return this.userId?.toString() === storage.currentUser?.id.toString()
  }

  @action
  fetch = async () => {
    logJS('debug', 'ProfileStore', 'fetch()')
    if (this.isLoading) return
    this.isLoading = true
    this.error = undefined
    if (!this.userTag.hasId()) {
      const userInfo = await api.fetchUserInfo(this.userTag.username!)
      if (userInfo.error) {
        logJS('debug', 'ProfileStore', 'fetch user info error', userInfo.error)
        this.setError(userInfo.error)
        return
      }
      this.userTag = new UserTag(userInfo.data!.id, userInfo.data!.username)
    }
    let fetchFollowedByPromise: Promise<void> | undefined
    if (this.userTag.userId !== storage.currentUser?.id) {
      fetchFollowedByPromise = this.fetchFollowedByShortInfo()
    }

    const response = await api.fetchUserProfile(this.userTag.userId!)
    if (response.error) {
      logJS('debug', 'ProfileStore', 'fetch user error', response.error)
      this.setError(response.error)
      return
    }
    this.userTag = new UserTag(response.data!.id, response.data!.username)
    if (fetchFollowedByPromise) {
      await fetchFollowedByPromise
    }

    runInAction(() => {
      logJS('debug', 'ProfileStore', 'set data')
      this.user = response.data
      this.isLoading = false
    })
  }

  @action
  updateAbout = async (about: string) => {
    if (!this.user) return
    this.user = {...this.user, about}
  }

  @action
  updateAvatar = (avatar: string) => {
    if (!this.user) return
    this.user.avatar = avatar
  }

  @action
  onFollowingStateChanged = (isFollowing: boolean) => {
    if (!this.user) return
    if (isFollowing) {
      analytics.sendEvent('profile_connect_pressed', {})
    }
    let followers = this.user.followers
    followers += isFollowing ? 1 : -1
    this.user = {...this.user, isFollowing: isFollowing, followers}
    sendUpdateFollowingState({
      userId: this.user.id,
      state: isFollowing,
    })
  }

  inviteUser = async (): Promise<Boolean> => {
    logJS('debug', 'ProfileStore', 'invite user', this.userId)
    if (!this.userId) return false

    return await runWithLoaderAsync(async () => {
      const inviteResponse = await api.createInviteForUser(this.userId)
      if (
        inviteResponse.error &&
        inviteResponse.error !== 'v1_invite_already_exists'
      ) {
        toastHelper.error(inviteResponse.error)
        return false
      }
      return true
    })
  }

  skipUserInvitation = async (activityId?: string): Promise<boolean> => {
    logJS(
      'debug',
      'ProfileStore',
      'skip user invitation',
      this.userId,
      activityId,
    )
    if (activityId) {
      logJS('debug', 'ProfileStore', 'delete activity by id')
      return await runWithLoaderAsync(async () => {
        const deleteResponse = await api.deleteActivity(activityId)
        if (deleteResponse.error) {
          logJS(
            'debug',
            'ProfileStore',
            'delete activity response error',
            deleteResponse.error,
          )
          toastHelper.error(deleteResponse.error, false)
          return false
        }
        logJS('debug', 'ProfileStore', 'activity deleted', deleteResponse.error)
        return true
      })
    }
    logJS('debug', 'ProfileStore', 'find and delete activity for user')
    return await runWithLoaderAsync(async () => {
      const activityStore = new ActivityStore()
      await activityStore.fetch()
      if (activityStore.error) {
        logJS('debug', 'ProfileStore', 'failed to fetch activities')
        toastHelper.error(activityStore.error, false)
        return false
      }
      const activityIndex = activityStore.activities.findIndex(
        (item) =>
          item.type === ActivityModelType.newUserRegisteredByInviteCode &&
          item.relatedUsers.length > 0 &&
          item.relatedUsers[0].id === this.userId,
      )
      if (activityIndex > -1) {
        const id = activityStore.activities[activityIndex].id
        logJS('debug', 'ProfileStore', 'found activity', id)
        const deleteResponse = await api.deleteActivity(id)
        if (deleteResponse.error) {
          logJS(
            'debug',
            'ProfileStore',
            'delete activity response error',
            deleteResponse.error,
          )
          toastHelper.error(deleteResponse.error, false)
          return false
        }
      }
      logJS('debug', 'ProfileStore', 'delete activity completed')
      return true
    })
  }

  acceptClubJoinRequest = async (userId: string, requestId: string) => {
    showLoading()
    const response = await api.acceptClubJoinRequest(requestId)
    hideLoading()
    if (response.error) return toastHelper.error(response.error)
    sendUpdateClubJoinedState({userId, state: true})
  }

  rejectClubJoinRequest = async (userId: string, requestId: string) => {
    showLoading()
    const response = await api.rejectClubJoinRequest(requestId)
    hideLoading()
    if (response.error) return toastHelper.error(response.error)
    sendUpdateClubJoinedState({userId, state: false})
  }

  fetchFollowedByShortInfo = async () => {
    if (!this.userTag.hasId()) {
      logJS(
        'warning',
        'ProfileStore',
        'unable to fetch followed without user id',
      )
      return
    }
    logJS('debug', 'ProfileStore', 'fetch followed for', this.userTag.userId)
    const response = await api.fetchFollowedByShortInfo(this.userTag.userId!)
    runInAction(() => {
      this.followedByShortInfo = response.data
    })
  }

  banUser = async (roomName: string, abuserId: string): Promise<boolean> => {
    const response = await api.ban(roomName, abuserId)
    // code 409 is Ban already exists
    return response.code === 200 || response.code === 409
  }

  blockUser = async (): Promise<boolean> => {
    return await runWithLoaderAsync(async () => {
      if (!this.user || this.user.isBlocked) return false
      logJS('debug', 'block user', this.user.id)
      const response = await api.block(this.user.id)
      if (response.error) {
        toastHelper.error(response.error)
        return false
      }
      return response.code === 200 || response.code === 409
    })
  }

  unblockUser = async (): Promise<boolean> => {
    return await runWithLoaderAsync(async () => {
      if (!this.user || !this.user.isBlocked) return false
      logJS('debug', 'unblock user', this.user.id)
      const response = await api.unblock(this.user.id)
      if (response.error) {
        toastHelper.error(response.error)
        return false
      }
      return response.code === 200 || response.code === 409
    })
  }

  private setError = (error: any) =>
    runInAction(() => {
      this.error = error
      this.isLoading = false
    })
}

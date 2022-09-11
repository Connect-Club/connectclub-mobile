import {action, makeAutoObservable, observable, runInAction} from 'mobx'

import {api} from '../api/api'
import {
  hideLoading,
  sendUpdateFollowingState,
  showLoading,
} from '../appEventEmitter'
import {logJS} from '../components/screens/room/modules/Logger'
import {alert} from '../components/webSafeImports/webSafeImports'
import {
  ActivityModel,
  ActivityModelType,
  EventModel,
  Unknown,
  UserModel,
} from '../models'
import {runWithLoaderAsync} from '../utils/navigation.utils'
import {toastHelper} from '../utils/ToastHelper'

const supportedEvents = new Set<string>(Object.values(ActivityModelType))

export class ActivityStore {
  private lastValue: string | Unknown = null
  private isLoadMore = false

  constructor() {
    makeAutoObservable(this)
  }

  @observable
  activities: Array<ActivityModel> = []

  @observable
  isLoading = false

  @observable
  bottomSheetEvent: EventModel | null = null

  @observable
  error?: any

  fetch = async () => {
    if (this.isLoading) return
    this.isLoading = true
    this.error = undefined

    const response = await api.fetchActivity()

    runInAction(() => {
      this.isLoadMore = false
      this.isLoading = false
      if (response.error) {
        this.error = response.error
        this.lastValue = undefined
        return
      }
      if (response.data) {
        const items = response.data.items.filter((i) =>
          supportedEvents.has(i.type),
        )
        this.lastValue = response.data.lastValue
        this.markAsRead(items)
        this.activities = items
        if (__DEV__) {
          const unsupported = response.data.items.filter(
            (i) => !supportedEvents.has(i.type),
          )
          if (unsupported.length === 0) return
          alert('Unsupported', unsupported.map((i) => i.type).join(','))
        }
      }
    })
  }

  fetchMore = async () => {
    if (!this.lastValue) return
    if (this.isLoading) return
    if (this.isLoadMore) return
    this.isLoadMore = true
    const response = await api.fetchActivity(this.lastValue)
    logJS(
      'debug',
      'ActivityStore fetchMore lastValue:',
      this.lastValue,
      'items count:',
      response.data?.items.length,
    )
    runInAction(() => {
      this.isLoadMore = false

      if (!response.data || response.error) {
        this.lastValue = null
      }

      if (response.data) {
        this.lastValue = response.data.lastValue
        this.markAsRead(response.data.items)
        this.activities = this.activities.concat(response.data.items)
      }
    })
  }

  @action
  onFollowingStateChanged = (user: UserModel, isFollowing: boolean) => {
    user.isFollowing = isFollowing
    sendUpdateFollowingState({userId: user.id, state: isFollowing})
  }

  deleteActivity = async (activityId: string) => {
    showLoading()
    const response = await api.deleteActivity(activityId)
    if (response.error) {
      toastHelper.error(response.error)
      return
    }
    runInAction(() => {
      this.activities = this.activities.filter((a) => a.id !== activityId)
      hideLoading()
    })
  }

  inviteUser = async (activityId: string, phone: string | Unknown) => {
    logJS('debug', 'ActivityStore', 'invite user', phone)
    if (!phone) return
    showLoading()
    const response = await api.createInvite(phone)
    if (response.error) {
      toastHelper.error(response.error)
      if (response.error !== 'v1_invite_already_exists') return
    }
    this.deleteActivity(activityId)
  }

  inviteUserById = async (userId: string): Promise<Boolean> => {
    logJS('debug', 'ActivityStore', 'invite user', userId)
    if (!userId) return false

    return await runWithLoaderAsync(async () => {
      const inviteResponse = await api.createInviteForUser(userId)
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

  @action
  showEvent = async (eventId: string) => {
    showLoading()
    const response = await api.fetchUpcomingEvent(eventId)
    hideLoading()
    if (response.error) return toastHelper.error(response.error)
    runInAction(() => {
      this.bottomSheetEvent = response.data!
    })
  }

  @action
  dismissEvent = () => {
    runInAction(() => {
      this.bottomSheetEvent = null
    })
  }

  private markAsRead = (activities: Array<ActivityModel>) => {
    if (activities.length === 0) return
    const idOfLatest = activities[0].id
    api.markActivitiesAsReed(idOfLatest)
  }
}

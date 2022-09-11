import {
  action,
  computed,
  makeAutoObservable,
  observable,
  runInAction,
} from 'mobx'

import {api} from '../api/api'
import {appEventEmitter, hideLoading, showLoading} from '../appEventEmitter'
import {logJS} from '../components/screens/room/modules/Logger'
import {
  ClubBody,
  ClubModel,
  EventModel,
  InterestModel,
  JoinRequestStatus,
  UserClubRole,
} from '../models'
import {storage} from '../storage'
import {isJoinedClub} from '../utils/club.utils'
import {toastHelper} from '../utils/ToastHelper'

type Result = 'ok' | 'error'

class ClubStore {
  @observable
  isLoading = false

  @observable
  isRefreshing = false

  @observable
  isInProgress = false

  @observable
  club: ClubModel | undefined

  @observable
  clubEvents: Array<EventModel> = []

  @observable
  clubId: string | undefined

  @observable
  error: string | undefined

  @observable
  actionError: string | undefined

  @observable
  isInJoinAction: boolean = false

  @computed
  get hasDescription(): boolean {
    if (!this.club) return false
    return this.club.description?.length > 0
  }

  @computed
  get hasInterests(): boolean {
    if (!this.club) return false
    return this.club.interests?.length > 0
  }

  private readonly clubUpdateSubscription?: () => void

  constructor(club?: ClubModel) {
    makeAutoObservable(this)
    this.clubUpdateSubscription = appEventEmitter.on(
      'clubUpdated',
      this.onClubUpdated,
    )
    if (club) this.initializeWithClub(club)
  }

  initializeWithClubId = async (
    clubId?: string,
    globalLoader: boolean = false,
  ) => {
    logJS('debug', 'ClubStore', 'init with club id', clubId)
    runInAction(() => (this.clubId = clubId))
    if (!clubId) return
    runInAction(() => {
      this.error = undefined
      this.isLoading = true
    })
    if (globalLoader) showLoading()
    const hasUser = !!storage.currentUser
    const response = await api.getClub(clubId, hasUser)
    if (globalLoader) hideLoading()
    runInAction(() => (this.isLoading = false))
    if (response.error) {
      this.error = response.error
      return toastHelper.error(response.error, false)
    }
    runInAction(() => {
      this.club = response.data
    })
    if (storage.isAuthorized) {
      await this.fetchEvents()
    }
  }

  initializeWithClub = (club: ClubModel) => {
    logJS('debug', 'ClubStore', 'init with club', club.id)
    runInAction(() => {
      this.isRefreshing = false
      this.clubId = club.id
      this.club = club
    })
  }

  @action
  refresh = async () => {
    if (!this.clubId || this.isRefreshing || this.isLoading) return
    this.isRefreshing = true
    this.error = undefined

    const hasUser = !!storage.currentUser
    const response = await api.getClub(this.clubId, hasUser)
    runInAction(() => {
      if (response.data) {
        this.club = response.data
      }
      this.isRefreshing = false
    })
    if (response.error) {
      this.error = response.error
      return toastHelper.error(response.error, false)
    }
    if (storage.isAuthorized) {
      await this.fetchEvents()
    }
  }

  @action
  joinRequest = async (): Promise<Result> => {
    if (this.isInJoinAction || this.isInProgress) return 'error'
    logJS('debug', 'ClubStore', 'join requested')
    const clubId = this.club?.id
    if (!clubId) {
      logJS('debug', 'ClubStore', 'no club id')
      return 'error'
    }
    this.isInProgress = true
    this.isInJoinAction = true
    this.isLoading = true
    const response = await api.joinClub(clubId)
    runInAction(() => {
      this.isInJoinAction = false
      this.isInProgress = false
      this.isLoading = false
    })
    if (response.error) {
      logJS('debug', 'ClubStore', 'join club error', response.error)
      toastHelper.error(response.error)
      return 'error'
    }
    if (response.data) {
      logJS('debug', 'ClubStore', 'join club successful')
      this.onJoinClubStatusUpdated(response.data.joinRequestStatus)
      const role = response.data.role
      if (role) {
        this.onClubRoleUpdated(role)
      }
      logJS('debug', 'ClubStore', 'trigger event userClubRoleChanged')
      appEventEmitter.trigger('userClubRoleChanged', {clubId: this.club!.id})
    }
    return 'ok'
  }

  @action
  leaveClub = async () => {
    logJS('debug', 'ClubStore', 'leave club requested')
    this.actionError = undefined
    if (!this.clubId) return
    if (!isJoinedClub(this.club?.clubRole)) {
      logJS('debug', 'ClubStore', 'already left')
      return
    }
    this.isInProgress = true
    this.isInJoinAction = true
    const response = await api.leaveClub(this.clubId!)
    runInAction(() => {
      this.isInJoinAction = false
      this.isInProgress = false
    })
    if (response.error) {
      logJS('debug', 'ClubStore', 'error leaving club', response.error)
      runInAction(() => (this.actionError = response.error))
      return
    }
    logJS('debug', 'ClubStore', 'successfully left club')
    this.onClubRoleUpdated(undefined)
    logJS('debug', 'ClubStore', 'trigger event userClubRoleChanged')
    appEventEmitter.trigger('userClubRoleChanged', {clubId: this.club!.id})
  }

  @action
  fetchEvents = async () => {
    logJS('debug', 'ClubStore', 'fetch events for club', this.club?.id)
    if (!this.club) return
    this.error = undefined
    logJS('debug', 'ClubStore', 'fetch events for club actual', this.clubId)
    const eventsResponse = await api.fetchUpcomingEvents(this.clubId)
    if (eventsResponse.error) {
      this.error = eventsResponse.error
      return
    }
    if (!eventsResponse.data?.items) return
    let events = eventsResponse.data.items
    switch (this.club.clubRole) {
      case 'owner':
      case 'moderator':
      case 'member':
        break
      default:
        events = events.filter((e) => !e.forMembersOnly)
    }
    logJS(
      'debug',
      'ClubStore',
      'fetched',
      events.length,
      ' events for club',
      this.clubId,
      'role',
      this.club.clubRole,
    )
    runInAction(() => {
      this.clubEvents = events
    })
  }

  @action
  updateClubInterests = async (interests: Array<InterestModel>) => {
    logJS('debug', 'ClubStore', 'update interests', interests.length)
    if (this.error || this.isLoading) {
      return logJS('debug', 'ClubStore', 'already loading or in error')
    }
    if (!this.clubId) {
      return logJS('debug', 'ClubStore', 'clubId is not defined')
    }
    if (interests.length === 0) {
      return logJS('warning', 'cannot set zero interests')
    }
    const response = await api.updateClubInterests(this.clubId!, interests)
    if (response.error) {
      this.error = response.error
      return
    }
    appEventEmitter.trigger('clubUpdated', this.clubId)
  }

  @action
  updateClubInfo = async (body: ClubBody) => {
    if (!this.clubId || !this.club) return
    logJS('debug', 'ClubStore', 'update club info')
    this.isLoading = true
    this.error = undefined

    const response = await api.updateClubInfo(this.clubId!, body)

    runInAction(() => {
      this.isLoading = false
    })
    if (response.error) {
      runInAction(() => {
        this.isLoading = false
        this.error = response.error
      })
      return
    }
    appEventEmitter.trigger('clubUpdated', this.clubId)
  }

  @action
  updateClubAvatar = async (image: string) => {
    if (!this.club || !this.clubId || this.error) return

    logJS('debug', 'ClubStore', 'upload club avatar')

    this.isInProgress = true

    const response = await api.uploadClubAvatar(image, this.clubId)

    logJS(
      'debug',
      'ClubStore',
      'upload club avatar finished; error?',
      response.error,
    )

    runInAction(() => {
      this.isInProgress = false
    })

    if (response.error) {
      runInAction(() => {
        this.error = response.error
      })
      return
    }
  }

  clear = () => {
    this.clubUpdateSubscription?.()
  }

  @action
  private onJoinClubStatusUpdated = (status: JoinRequestStatus) => {
    logJS('debug', 'ClubStore', 'join status updated', status)
    if (!this.club) {
      logJS('debug', 'ClubStore', 'club is not defined')
      return
    }
    this.club = {...this.club, joinRequestStatus: status}
  }

  @action
  private onClubRoleUpdated = (role?: UserClubRole) => {
    logJS('debug', 'ClubStore', 'club role updated', role)
    if (!this.club) {
      logJS('debug', 'ClubStore', 'club is not defined')
      return
    }
    this.club = {...this.club, clubRole: role}
  }

  private onClubUpdated = (clubId: string) => {
    logJS('debug', 'ClubStore', 'handle on club updated', clubId)
    if (this.clubId === clubId) {
      this.initializeWithClubId(this.clubId)
    }
  }
}

export default ClubStore

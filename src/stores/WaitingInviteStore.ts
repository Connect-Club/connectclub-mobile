import {computed, makeAutoObservable, observable, runInAction} from 'mobx'

import {api} from '../api/api'
import {logJS} from '../components/screens/room/modules/Logger'
import {ClubModel, JoinClubStatusData} from '../models'
import {storage} from '../storage'
import {fetchAll} from '../utils/fetch.utils'
import {toastHelper} from '../utils/ToastHelper'
import ClubStore from './ClubStore'

type WaitingStatus =
  | 'waiting_list'
  | 'waiting_club'
  | 'invited_to_club'
  | 'invited'

class WaitingInviteStore {
  constructor() {
    this.clubStore = new ClubStore()
    makeAutoObservable(this)
  }

  private readonly clubStore: ClubStore
  private isInitializing: boolean = false
  private isInitialized: boolean = false

  @observable
  userRequests?: Array<JoinClubStatusData>

  @observable
  waitingStatus?: WaitingStatus

  @computed
  get isLoading(): boolean {
    return this.isInitializing || this.clubStore.isLoading
  }

  @computed
  get club(): ClubModel | undefined {
    return this.clubStore.club
  }

  initialize = async (clubId?: string) => {
    logJS('debug', 'WaitingInviteStore', 'initialize')
    if (this.isInitializing || this.isInitialized) {
      logJS(
        'debug',
        'WaitingInviteStore',
        'already initializing:',
        this.isInitializing,
        'initialized:',
        this.isInitialized,
      )
      return
    }
    if (this.club) {
      logJS('debug', 'WaitingInviteStore', 'club already loaded')
      return
    }
    runInAction(() => (this.isInitializing = true))
    try {
      await this.initializeInternal(clubId)
      logJS(
        'info',
        'WaitingInviteStore initialized; clubId:',
        clubId,
        'status:',
        this.waitingStatus,
        'join requests',
        this.userRequests?.length,
      )
    } catch (e: any) {
      toastHelper.error(JSON.stringify(e))
    } finally {
      runInAction(() => (this.isInitializing = false))
    }
  }

  updateStatus = async () => {
    if (this.clubStore.clubId) {
      await this.initializeWithClubId(this.clubStore.clubId)
    } else await this.updateWaitingStatus()
  }

  requestJoinClub = async (): Promise<boolean> => {
    if (!this.isInitialized || !this.club) return false
    if (this.club.clubRole && this.club.clubRole !== 'guest') return true
    const result = await this.clubStore.joinRequest()
    return result === 'ok'
  }

  private initializeInternal = async (clubId?: string) => {
    if (clubId) return this.initializeWithClubId(clubId)

    const fetchAllResult = await fetchAll<JoinClubStatusData>(
      api.fetchMyJoinRequests,
    )

    if (fetchAllResult.error) throw fetchAllResult.error

    const approvedRequest = fetchAllResult.data!.find(
      (value) => value.joinRequestStatus === 'approved',
    )
    if (approvedRequest) {
      logJS('debug', 'WaitingInviteStore found approved request')
      return this.initializeWithClubId(approvedRequest.clubId)
    }
    const firstRequest = fetchAllResult.data!.find(
      (value) => value.joinRequestStatus === 'moderation',
    )
    if (!firstRequest) {
      logJS('debug', "WaitingInviteStore didn't find moderation request")
      return await this.updateWaitingStatus()
    }

    logJS('debug', 'WaitingInviteStore found moderation request')
    await this.initializeWithClubId(firstRequest.clubId)
  }

  private initializeWithClubId = async (clubId: string) => {
    logJS('info', 'WaitingInviteStore init with club', clubId)
    await this.clubStore.initializeWithClubId(clubId)
    const requestStatus = this.clubStore.club?.joinRequestStatus
    logJS(
      'debug',
      'WaitingInviteStore join status',
      requestStatus ?? '<unknown>',
    )
    let status: WaitingStatus
    switch (requestStatus) {
      case 'moderation':
        status = 'waiting_club'
        break
      case 'approved':
        status = 'invited_to_club'
        break
      default:
        status = 'waiting_list'
        break
    }
    const response = await api.current()
    if (response.error) return toastHelper.error(response.error, false)
    await storage.saveUser(response.data!)
    const userStatus = response.data!.state

    await runInAction(async () => {
      if (userStatus === 'invited' && status !== 'invited_to_club') {
        this.waitingStatus = 'invited'
      } else {
        this.waitingStatus = status
      }
    })

    this.isInitialized = this.isInitialized || !!this.clubStore.club
  }

  private updateWaitingStatus = async (): Promise<
    WaitingStatus | undefined
  > => {
    logJS('info', 'WaitingInviteStore update invited')
    const status = this.waitingStatus
    if (status === 'invited' || status === 'invited_to_club') {
      logJS('debug', 'WaitingInviteStore already', status)
      return
    }
    const response = await api.current()
    if (response.error) {
      toastHelper.error(response.error, false)
      return
    }
    await storage.saveUser(response.data!)
    const userState = response.data!.state
    if (userState === 'invited' || userState === 'verified') {
      logJS('debug', 'WaitingInviteStore user has general invitation')
      runInAction(() => (this.waitingStatus = 'invited'))
      return 'invited'
    }
    logJS('debug', 'WaitingInviteStore user has no invitation')
    if (this.waitingStatus !== 'waiting_club') {
      runInAction(() => (this.waitingStatus = 'waiting_list'))
    }
    return
  }

  clear() {
    this.userRequests = undefined
  }
}

export default WaitingInviteStore

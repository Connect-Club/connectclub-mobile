import {action, makeAutoObservable, observable, runInAction} from 'mobx'

import {api} from '../api/api'
import {appEventEmitter} from '../appEventEmitter'
import {logJS} from '../components/screens/room/modules/Logger'
import {ClubModel} from '../models'
import {createListStore} from './BaseListStore'

class ClubListScreenStore {
  readonly listStore = createListStore(
    () => api.getUserParticipatedClubs(this.userId),
    (lastValue) => api.getUserParticipatedClubs(this.userId, lastValue),
    true,
  )

  @observable
  isActionInProgress: boolean = false

  @observable
  actionError: any

  @observable
  joinActionClubId?: string

  private disposable?: () => void

  constructor(readonly userId: string) {
    makeAutoObservable(this)
    this.disposable = appEventEmitter.on('userClubRoleChanged', (params) =>
      this.onUserClubRoleChanged(params.clubId),
    )
  }

  @action
  onJoinClub = async (clubId: string) => {
    if (this.isActionInProgress || this.joinActionClubId) return
    logJS('debug', 'ClubListScreenStore', 'join club requested', clubId)
    const index = this.listStore.list.findIndex((item) => item.id === clubId)
    if (index < 0) return
    logJS('debug', 'ClubListScreenStore', 'found club', index)
    this.actionError = undefined
    this.isActionInProgress = true
    this.joinActionClubId = clubId
    const response = await api.joinClub(clubId)
    runInAction(() => {
      this.joinActionClubId = undefined
      this.isActionInProgress = false
    })
    if (response.error) {
      logJS('debug', 'ClubListScreenStore', 'join club error', response.error)
      runInAction(() => {
        this.actionError = response.error
      })
      return
    }
    logJS('debug', 'ClubListScreenStore', 'refresh club item')
    const club: ClubModel = {
      ...this.listStore.list[index],
      clubRole: 'join_request_moderation',
    }
    this.listStore.mutateItem(index, club)
  }

  @action
  onLeaveClub = async (clubId: string) => {
    if (this.isActionInProgress || this.joinActionClubId) return
    logJS('debug', 'ClubListScreenStore', 'leave club requested', clubId)
    const index = this.listStore.list.findIndex((item) => item.id === clubId)
    if (index < 0) return
    logJS('debug', 'ClubListScreenStore', 'found club', index)
    this.actionError = undefined
    this.isActionInProgress = true
    this.joinActionClubId = clubId
    const response = await api.leaveClub(clubId)
    runInAction(() => {
      this.joinActionClubId = undefined
      this.isActionInProgress = false
    })
    if (response.error) {
      logJS('debug', 'ClubListScreenStore', 'leave club error', response.error)
      runInAction(() => {
        this.actionError = response.error
      })
      return
    }
    logJS('debug', 'ClubListScreenStore', 'remove club item from list')
    this.listStore.removeItem(index)
  }

  private onUserClubRoleChanged = (clubId: string) => {
    logJS(
      'debug',
      'ClubListScreenStore',
      'user club role changed in; will refresh',
      clubId,
    )
    this.listStore.refresh()
  }

  clear() {
    this.disposable?.()
    this.listStore.clear()
  }
}

export default ClubListScreenStore

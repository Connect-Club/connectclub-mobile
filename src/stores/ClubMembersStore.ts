import {
  action,
  computed,
  makeAutoObservable,
  observable,
  runInAction,
} from 'mobx'

import {api} from '../api/api'
import {logJS} from '../components/screens/room/modules/Logger'
import {UserModel} from '../models'
import {isAtLeastClubModerator} from '../utils/club.utils'
import {runWithLoaderAsync} from '../utils/navigation.utils'
import {SimpleListFetcher} from './BaseListStore'
import SearchListStore from './SearchListStore'

export class ClubMembersStore {
  readonly internalStore: SearchListStore<UserModel>

  @observable
  actionError?: string

  @computed
  get error(): any {
    return this.internalStore.error
  }

  @computed
  get list(): Array<UserModel> {
    return this.internalStore.list
  }

  @computed
  get isRefreshing(): boolean {
    return this.internalStore.isRefreshing
  }

  @computed
  get isLoading(): boolean {
    return this.internalStore.isLoading
  }

  @computed
  get isSearchMode(): boolean {
    return this.internalStore.isSearchMode
  }

  isLoaded: boolean = false

  constructor(readonly clubId: string) {
    const fetcherProvider = () =>
      new SimpleListFetcher(
        (query) => api.fetchClubMembers(clubId, undefined, undefined, query),
        (lastValue, query) =>
          api.fetchClubMembers(clubId, lastValue, undefined, query),
        true,
      )
    this.internalStore = new SearchListStore<UserModel>(fetcherProvider)
    makeAutoObservable(this)
  }

  @action
  setSearchMode(mode: boolean) {
    this.internalStore.setSearchMode(mode)
  }

  @action
  search(query: string) {
    this.internalStore.search(query)
  }

  @action
  load = async () => {
    this.isLoaded = false
    await this.internalStore.load()
    if (!this.internalStore.error) {
      this.isLoaded = true
    }
  }

  loadMore = async () => this.internalStore.loadMore()

  refresh = async () => this.internalStore.refresh()

  @action
  removeModerator = async (userId: string) => {
    logJS('debug', 'ClubMembersStore', 'remove moderator', userId)
    this.actionError = undefined
    const index = this.internalStore.list.findIndex(
      (value) => value.id === userId,
    )
    if (index < 0) {
      return logJS('debug', 'ClubMembersStore', 'cant find user', userId)
    }
    const user = this.internalStore.list[index]
    if (!isAtLeastClubModerator(user.clubRole)) {
      return logJS('debug', 'ClubMembersStore', 'user is not moderator', userId)
    }
    logJS('debug', 'ClubMembersStore', 'do remove moderator', userId)
    await runWithLoaderAsync(async () => {
      const response = await api.removeClubModerator(this.clubId, userId)
      if (response.error) {
        logJS(
          'debug',
          'ClubMembersStore',
          'remove moderator error',
          response.error,
        )
        runInAction(() => {
          this.actionError = response.error
        })
        return
      }
      logJS('debug', 'ClubMembersStore', 'remove moderator successful', userId)
      runInAction(() => {
        this.internalStore.mutateItem(index, {...user, clubRole: 'member'})
      })
    })
  }

  @action
  removeClubMember = async (userId: string) => {
    logJS('debug', 'ClubMembersStore', 'remove club member', userId)
    this.actionError = undefined
    const index = this.internalStore.list.findIndex(
      (value) => value.id === userId,
    )
    if (index < 0) {
      return logJS('debug', 'ClubMembersStore', 'cant find user', userId)
    }
    logJS('debug', 'ClubMembersStore', 'do remove club member', userId)
    await runWithLoaderAsync(async () => {
      const response = await api.removeClubMember(this.clubId, userId)
      if (response.error) {
        logJS(
          'debug',
          'ClubMembersStore',
          'remove club member error',
          response.error,
        )
        runInAction(() => {
          this.actionError = response.error
        })
        return
      }
      logJS(
        'debug',
        'ClubMembersStore',
        'remove club member successful',
        userId,
      )
      runInAction(() => {
        this.internalStore.removeItem(index)
      })
    })
  }

  @action
  promoteToModerator = async (userId: string) => {
    logJS('debug', 'ClubMembersStore', 'promote to moderator', userId)
    this.actionError = undefined
    const index = this.internalStore.list.findIndex(
      (value) => value.id === userId,
    )
    if (index < 0) {
      return logJS('debug', 'ClubMembersStore', 'cant find user', userId)
    }
    const user = this.internalStore.list[index]
    if (isAtLeastClubModerator(user.clubRole)) {
      return logJS(
        'debug',
        'ClubMembersStore',
        'user is already moderator',
        userId,
      )
    }
    logJS('debug', 'ClubMembersStore', 'do promote user to moderator', userId)
    await runWithLoaderAsync(async () => {
      const response = await api.makeUserClubModerator(this.clubId, userId)
      if (response.error) {
        logJS(
          'debug',
          'ClubMembersStore',
          'promote user to moderator error',
          response.error,
        )
        runInAction(() => {
          this.actionError = response.error
        })
        return
      }
      logJS(
        'debug',
        'ClubMembersStore',
        'promote user to moderator successful',
        userId,
      )
      runInAction(() => {
        this.internalStore.mutateItem(index, {...user, clubRole: 'moderator'})
      })
    })
  }

  clear() {
    this.internalStore.clear()
  }
}

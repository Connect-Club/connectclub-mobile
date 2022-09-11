import {
  action,
  computed,
  makeAutoObservable,
  observable,
  runInAction,
} from 'mobx'

import {api} from '../api/api'
import {
  appEventEmitter,
  sendUpdateFollowingState,
  UpdateFollowingState,
} from '../appEventEmitter'
import {UserModel} from '../models'
import BaseListStore, {IListStore, SimpleListFetcher} from './BaseListStore'
import SearchUsersStore from './SearchUsersStore'

class InternalUsersStore extends BaseListStore<UserModel> {
  private readonly eventDisposable: (() => void) | null = null
  loadMoreCount?: number

  constructor() {
    super(
      new SimpleListFetcher(
        async () => api.fetchUsers({limit: this.loadMoreCount ?? 10}),
        async (lastValue: string) => {
          return api.fetchUsers({lastValue, limit: this.loadMoreCount})
        },
        true,
      ),
    )
  }

  clear() {
    this.eventDisposable?.()
    super.clear()
  }
}

export class RecommendedPeopleStore implements IListStore<UserModel> {
  readonly usersStore = new InternalUsersStore()
  readonly searchStore = new SearchUsersStore()

  constructor() {
    makeAutoObservable(this)
    appEventEmitter.on('updateFollowingState', this.onUpdateFollowingState)
  }

  private onUpdateFollowingState = (params: UpdateFollowingState) => {
    this.updateFollowingState(params, this.usersStore)
    this.updateFollowingState(params, this.searchStore)
  }

  private updateFollowingState = (
    params: UpdateFollowingState,
    store: IListStore<UserModel>,
  ) => {
    const userIndex = store.list.findIndex((u) => `${u.id}` === params.userId)
    if (userIndex < 0) return
    const update: UserModel = {
      ...store.list[userIndex],
      isFollowing: params.state,
    }
    store.mutateItem(userIndex, update)
  }

  @observable
  isToggling = new Map<string, boolean>()

  @observable
  searchMode: boolean = false

  private get activeStore(): BaseListStore<UserModel> {
    return this.searchMode ? this.searchStore : this.usersStore
  }

  @computed
  get error(): any {
    return this.activeStore.error
  }

  @computed
  get isInProgress(): boolean {
    return this.activeStore.isInProgress
  }

  @computed
  get isLoading(): boolean {
    return this.activeStore.isLoading
  }

  @computed
  get isRetrying(): boolean {
    return this.activeStore.isRetrying
  }

  @computed
  get list(): Array<UserModel> {
    return this.activeStore.list
  }

  @computed
  get isRefreshing() {
    return this.activeStore.isRefreshing
  }

  @action
  toggleFollowing = async (userId: string, index: number) => {
    this.isToggling.set(userId, true)
    const store = this.searchMode ? this.searchStore : this.usersStore
    const user = store.list[index]
    await api.toggleFollow(userId, user.isFollowing)
    runInAction(() => {
      const newState = !user.isFollowing
      store.list[index].isFollowing = newState
      this.isToggling.set(userId, false)
      sendUpdateFollowingState({userId: user.id, state: newState})
    })
  }

  @action
  onFollowingStateChanged = (isFollowing: boolean, index: number) => {
    const user = this.activeStore.list[index]
    if (!user) return
    user.isFollowing = isFollowing
    sendUpdateFollowingState({userId: user.id, state: isFollowing})
  }

  @computed
  get isLoadAll(): boolean {
    return this.searchMode ? false : this.usersStore.isLoadAll ?? false
  }

  @computed
  get isLoadingMore(): boolean {
    return this.activeStore.isLoadingMore
  }

  @action
  setSearchMode = (enabled: boolean) => {
    this.searchMode = enabled
    if (!enabled) {
      this.searchStore.query = null
      this.searchStore.clear()
    }
  }

  search = (query: string | null) => {
    if (query === this.searchStore.query) return
    this.searchStore.query = query
    if (!query) {
      this.searchStore.clear()
    } else {
      this.searchStore.refresh()
    }
  }

  refresh = async () => {
    await this.activeStore.refresh()
  }

  load = async () => {
    await this.activeStore.load(true)
  }

  loadMore = async (count?: number) => {
    this.usersStore.loadMoreCount = count ?? 25
    await this.activeStore.loadMore()
  }

  mutateItems(items: Array<UserModel>): void {
    console.log('mutate list of people store')
    this.usersStore.mutateItems(items)
    this.searchStore.mutateItems(items)
  }

  mutateItem(index: number, item: UserModel): void {
    this.usersStore.mutateItem(index, item)
    this.searchStore.mutateItem(index, item)
  }

  removeItem(index: number): void {
    throw `unsupported/${index}`
  }

  clear() {
    appEventEmitter.off('updateFollowingState', this.onUpdateFollowingState)
    this.searchStore.query = null
    this.usersStore.clear()
    this.searchStore.clear()
  }
}

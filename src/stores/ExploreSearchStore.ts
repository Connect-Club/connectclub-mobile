import {
  action,
  computed,
  makeAutoObservable,
  makeObservable,
  observable,
  reaction,
  runInAction,
} from 'mobx'

import {api} from '../api/api'
import {logJS} from '../components/screens/room/modules/Logger'
import {ClubModel, UserModel} from '../models'
import BaseListStore, {
  createListStore,
  IListStore,
  ListStoreDelegate,
} from './BaseListStore'
import {RecommendedPeopleStore} from './RecommendedPeopleStore'

export type ExploreSearchMode = 'people' | 'clubs'

export class RecommendedClubsStore implements IListStore<ClubModel> {
  constructor() {
    makeAutoObservable(this)
  }

  private _query: string | null = null
  private loadMoreCount?: number

  get query(): string | null {
    return this._query
  }

  private clubListStore = createListStore<ClubModel>(
    () => api.searchClubs(null, null, this.loadMoreCount),
    (lastValue) => api.searchClubs(null, lastValue, this.loadMoreCount),
    true,
  )
  private searchClubsStore = createListStore<ClubModel>(
    () => api.searchClubs(this._query, null, this.loadMoreCount),
    (lastValue) => api.searchClubs(this._query, lastValue, this.loadMoreCount),
    true,
  )

  @observable
  searchMode: boolean = false

  private get activeStore(): BaseListStore<ClubModel> {
    return this.searchMode ? this.searchClubsStore : this.clubListStore
  }

  @computed
  get isLoading(): boolean {
    return this.clubListStore.isLoading || this.searchClubsStore.isLoading
  }

  @computed
  get isRetrying(): boolean {
    return this.clubListStore.isRetrying || this.searchClubsStore.isRetrying
  }

  @computed
  get isLoadingMore(): boolean {
    return (
      this.clubListStore.isLoadingMore || this.searchClubsStore.isLoadingMore
    )
  }

  @computed
  get isLoadAll(): boolean {
    return this.searchMode ? false : this.clubListStore.isLoadAll
  }

  @computed
  get isInProgress(): any {
    return this.clubListStore.isInProgress || this.searchClubsStore.isInProgress
  }

  @computed
  get error(): any {
    return this.clubListStore.error || this.searchClubsStore.error
  }

  @computed
  get list(): Array<ClubModel> {
    return this.activeStore.list
  }

  @computed
  get isRefreshing(): boolean {
    return this.activeStore.isRefreshing
  }

  load = async () => {
    await this.activeStore.load(true)
  }

  loadMore = async (count?: number) => {
    logJS(
      'debug',
      'RecommendedClubsStore: load more (',
      count ?? 'default',
      ')',
    )
    this.loadMoreCount = count ?? 20
    await this.activeStore.loadMore()
  }

  refresh = async () => {
    await this.activeStore.refresh()
  }

  @action
  setSearchMode = (enabled: boolean) => {
    this.searchMode = enabled
    if (!enabled) {
      this._query = null
      this.searchClubsStore.clear()
    }
  }

  search = (query: string | null) => {
    if (query === this._query) return
    this._query = query
    if (!query) {
      this.searchClubsStore.clear()
    } else {
      this.searchClubsStore.refresh()
    }
  }

  mutateItems(items: Array<ClubModel>): void {
    this.activeStore.mutateItems(items)
  }

  mutateItem(index: number, item: ClubModel) {
    this.activeStore.mutateItem(index, item)
  }

  removeItem(index: number): void {
    throw `unsupported/${index}`
  }

  clear() {
    this._query = null
    this.searchClubsStore.clear()
    this.clubListStore.clear()
  }
}

class ExploreStore<T> extends ListStoreDelegate<T> {
  private disposables: Array<() => void> = []
  requestedCount: number = 0
  exploredCount: number = 0
  exploredList: Array<T> = []

  get isLoadAll(): boolean {
    return super.isLoadAll && this.exploredCount === super.list.length
  }

  constructor(
    delegate: IListStore<T>,
    maxInitialExploredCount: number = 3,
    private exploreLimit: number = 10,
  ) {
    super(delegate)
    if (this.exploreLimit < 1) throw 'explore limit < 1'
    makeObservable(this, {
      exploredList: observable,
      requestedCount: observable,
    })
    this.requestedCount = maxInitialExploredCount
    this.disposables.push(
      reaction(
        () => this.requestedCount,
        () => {
          this.exploredList = this.computeExploredList()
        },
      ),
    )
    this.disposables.push(
      reaction(
        () => this.list,
        () => {
          this.exploredList = this.computeExploredList()
        },
      ),
    )
  }

  private computeExploredList(): Array<T> {
    this.exploredCount = Math.min(
      this.requestedCount,
      this.delegate.list.length,
    )
    if (this.exploredCount === 0) return []

    return this.delegate.list.slice(0, this.exploredCount)
  }

  loadMore = async () => {
    runInAction(() => {
      this.requestedCount += this.exploreLimit
      if (this.requestedCount <= this.list.length) return
      return super.loadMore()
    })
  }

  clear() {
    this.disposables.forEach((disposable) => disposable())
    super.clear()
  }
}

class ExploreSearchStore {
  readonly peopleExploreStore: ExploreStore<UserModel>
  readonly clubsExploreStore: ExploreStore<ClubModel>
  readonly peopleStore: RecommendedPeopleStore
  readonly clubsStore: RecommendedClubsStore

  constructor() {
    this.peopleStore = new RecommendedPeopleStore()
    this.clubsStore = new RecommendedClubsStore()
    this.peopleExploreStore = new ExploreStore(this.peopleStore, 3, 10)
    this.clubsExploreStore = new ExploreStore(this.clubsStore, 3, 10)
    makeAutoObservable(this)
  }

  private _mode: ExploreSearchMode = 'people'
  private _searchQuery: string = ''

  @observable
  get mode() {
    return this._mode
  }

  @computed
  get isLoading() {
    return (
      this.peopleStore.searchStore.isLoading ||
      this.peopleStore.usersStore.isLoading ||
      this.clubsStore.isLoading
    )
  }

  @computed
  get isRetrying() {
    return (
      this.peopleStore.searchStore.isRetrying ||
      this.peopleStore.usersStore.isRetrying ||
      this.clubsStore.isRetrying
    )
  }

  @computed
  get isInProgress() {
    return (
      this.peopleStore.searchStore.isInProgress ||
      this.peopleStore.usersStore.isInProgress ||
      this.clubsStore.isInProgress
    )
  }

  @computed
  get error() {
    return (
      this.peopleStore.searchStore.error ??
      this.peopleStore.usersStore.error ??
      this.clubsStore.error
    )
  }

  @computed
  get searchMode() {
    return this.peopleStore.searchMode
  }

  @action
  setMode = (mode: ExploreSearchMode) => {
    if (this._mode === mode) return
    logJS('debug', 'ExploreSearchStore', 'set mode', mode)
    this._mode = mode
    this.performSearch()
  }

  setSearchMode = (enabled: boolean) => {
    logJS('debug', 'ExploreSearchStore', 'set search mode', enabled)
    this.peopleStore.setSearchMode(enabled)
    this.clubsStore.setSearchMode(enabled)
  }

  onLoad = async () => {
    this.setSearchMode(false)
    this.peopleStore.usersStore.load(true)
    this.clubsStore.load()
  }

  onSearchTextChange = (text: string) => {
    const trimmed = text.trim()
    if (trimmed === this._searchQuery) return
    logJS('debug', 'ExploreSearchStore', 'search text change', trimmed)
    this._searchQuery = trimmed
    this.performSearch()
  }

  clear = () => {
    this._searchQuery = ''
    this.peopleStore.clear()
    this.clubsStore.clear()
  }

  private performSearch = () => {
    logJS(
      'debug',
      'ExploreSearchStore',
      'perform search on query',
      this._searchQuery,
      'mode',
      this._mode,
    )
    switch (this._mode) {
      case 'people':
        this.peopleStore.search(this._searchQuery)
        break
      case 'clubs':
        this.clubsStore.search(this._searchQuery)
        break
      default:
        logJS('error', 'ExploreSearchStore', 'unknown mode', this._mode)
    }
  }
}

export default ExploreSearchStore

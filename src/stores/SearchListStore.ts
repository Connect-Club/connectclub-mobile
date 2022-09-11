import {action, computed, makeAutoObservable, observable} from 'mobx'

import {logJS} from '../components/screens/room/modules/Logger'
import BaseListStore, {IListStore, QueryListFetcher} from './BaseListStore'

class SearchListStore<T> implements IListStore<T> {
  @computed
  get error(): any {
    return this.currentStore.error
  }

  @computed
  get isInProgress(): boolean {
    return this.currentStore.isInProgress
  }

  @computed
  get isLoadAll(): boolean {
    return this.currentStore.isLoadAll
  }

  @computed
  get isLoading(): boolean {
    return this.currentStore.isLoading
  }

  @computed
  get isLoadingMore(): boolean {
    return this.currentStore.isLoadingMore
  }

  @computed
  get isRefreshing(): boolean {
    return this.currentStore.isRefreshing
  }

  @computed
  get isRetrying(): boolean {
    return this.currentStore.isRetrying
  }

  @computed
  get list(): Array<T> {
    return this.currentStore.list
  }

  @computed
  get totalCount(): number | undefined {
    return this.currentStore.totalCount
  }

  @observable
  isSearchMode: boolean = false

  @observable
  currentStore: BaseListStore<T>

  private readonly queryFetcher: QueryListFetcher<T>
  readonly contentStore: BaseListStore<T>
  readonly searchStore: BaseListStore<T>

  constructor(fetcherProvider: () => QueryListFetcher<T>) {
    this.queryFetcher = fetcherProvider()
    this.contentStore = new BaseListStore(fetcherProvider())
    this.searchStore = new BaseListStore(this.queryFetcher)
    this.currentStore = this.contentStore
    makeAutoObservable(this)
  }

  @action
  setSearchMode(mode: boolean) {
    if (this.isSearchMode === mode) return
    logJS('debug', 'SearchListStore', 'set search mode', mode)
    this.queryFetcher.setQuery(undefined)
    if (mode) {
      this.searchStore.clear()
      this.currentStore = this.searchStore
    } else {
      this.currentStore = this.contentStore
    }
    this.isSearchMode = mode
  }

  @action
  search = async (query: string) => {
    if (!this.isSearchMode) return
    if (query === this.queryFetcher.query) return
    this.queryFetcher.setQuery(query)
    await this.searchStore.load()
  }

  clear(): void {
    logJS('debug', 'SearchListStore', 'clear')
    this.contentStore.clear()
    this.searchStore.clear()
  }

  load(): Promise<void> {
    return this.currentStore.load(true)
  }

  loadMore(): Promise<void> {
    return this.currentStore.loadMore()
  }

  mutateItem(index: number, item: T): void {
    this.currentStore.mutateItem(index, item)
  }

  mutateItems(items: Array<T>): void {
    this.currentStore.mutateItems(items)
  }

  refresh(): Promise<void> {
    return this.currentStore.refresh()
  }

  removeItem(index: number): void {
    this.currentStore.removeItem(index)
  }
}

export default SearchListStore

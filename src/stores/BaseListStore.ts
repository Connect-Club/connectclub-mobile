import {action, computed, makeObservable, observable, runInAction} from 'mobx'

import {Paginated, RestResponse} from '../api/httpClient'
import {hideLoading, showLoading} from '../appEventEmitter'
import {logJS} from '../components/screens/room/modules/Logger'
import {Unknown} from '../models'
import {toastHelper} from '../utils/ToastHelper'

export interface ListState<T> {
  isLoading: boolean
  isRetrying: boolean
  isLoadingMore: boolean
  isRefreshing: boolean
  items: Array<T>
  lastValue?: string | Unknown
  isFirstLoading?: boolean
  isLoadAll: boolean
  error?: any
  totalCount?: number
}

export type DataUpdate<T> = {
  items: Array<T>
  lastValue: string | Unknown
  totalCount?: number
}

export interface ListFetcher<T> {
  fetchData(refresh: boolean): Promise<DataUpdate<T> | 'cancelled'>
  fetchMore(lastValue: string): Promise<DataUpdate<T> | 'cancelled'>
}

export interface QueryListFetcher<T> extends ListFetcher<T> {
  readonly query: string | undefined

  setQuery(query?: string): void
}

export class SimpleListFetcher<T> implements QueryListFetcher<T> {
  private readonly load: (
    refresh: boolean,
  ) => Promise<RestResponse<Paginated<T>> | 'cancelled'>
  private readonly loadMore: (
    lastValue: string,
  ) => Promise<RestResponse<Paginated<T>> | 'cancelled'>
  private _query: string | undefined

  get query(): string | undefined {
    return this._query
  }

  constructor(
    load: (query?: string) => Promise<RestResponse<Paginated<T>> | 'cancelled'>,
    loadMore: (
      lastValue: string,
      query?: string,
    ) => Promise<RestResponse<Paginated<T>> | 'cancelled'>,
    private quiet = false,
  ) {
    this.load = () => load(this.query)
    this.loadMore = (lastValue) => loadMore(lastValue, this.query)
  }

  async fetchData(refresh: boolean): Promise<DataUpdate<T> | 'cancelled'> {
    if (!refresh && !this.quiet) showLoading()
    const response = await this.load(refresh)
    if (!refresh && !this.quiet) hideLoading()
    if (response === 'cancelled') return 'cancelled'
    if (!response.data || response.error) throw response.error ?? 'no data'

    return {
      items: response.data.items,
      lastValue: response.data.lastValue,
      totalCount: response.data.totalCount,
    }
  }

  async fetchMore(lastValue: string): Promise<DataUpdate<T> | 'cancelled'> {
    const response = await this.loadMore(lastValue)
    if (response === 'cancelled') return 'cancelled'
    if (!response.data || response.error) throw response.error ?? 'no data'

    return {
      items: [...response.data.items],
      lastValue: response.data.lastValue,
      totalCount: response.data.totalCount,
    }
  }

  setQuery(query?: string): void {
    this._query = query
  }
}

export interface IListStoreBase<T> {
  list: Array<T>
}

export interface IListStoreStatus {
  isInProgress: boolean
  isLoading: boolean
  isRetrying: boolean
  isLoadingMore: boolean
  isRefreshing: boolean
  isFirstLoading?: boolean
  isLoadAll: boolean
  error: any | undefined
}

export interface IListStore<T> extends IListStoreBase<T>, IListStoreStatus {
  load(): Promise<void>
  loadMore(): Promise<void>
  refresh(): Promise<void>
  mutateItems(items: Array<T>): void
  mutateItem(index: number, item: T): void
  removeItem(index: number): void
  clear(): void
}

export default class BaseListStore<T> implements IListStore<T> {
  @observable
  protected listState: ListState<T> = {
    isFirstLoading: true,
    isLoading: false,
    isRetrying: false,
    isLoadingMore: false,
    isRefreshing: false,
    isLoadAll: false,
    totalCount: undefined,
    items: [],
  }
  private readonly fetcher: ListFetcher<T>

  constructor(fetcher: ListFetcher<T>, private parallelFetch: boolean = false) {
    this.fetcher = fetcher
    makeObservable<BaseListStore<T>>(this)
  }

  @computed
  get isInProgress() {
    return (
      this.listState.isLoading ||
      this.listState.isLoadingMore ||
      this.listState.isRefreshing
    )
  }

  @computed
  get isLoading() {
    return this.listState.isLoading
  }

  @computed
  get isRetrying() {
    return this.listState.isRetrying
  }

  @computed
  get isLoadingMore() {
    return this.listState.isLoadingMore
  }

  @computed
  get isRefreshing() {
    return this.listState.isRefreshing
  }

  @computed
  get isFirstLoading() {
    return this.listState.isFirstLoading
  }

  @computed
  get isLoadAll() {
    return this.listState.isLoadAll || this.listState.lastValue === null
  }

  @computed
  get totalCount() {
    return this.listState.totalCount
  }

  @computed
  get list() {
    return this.listState.items
  }

  @computed
  get error(): any | undefined {
    return this.listState.error
  }

  @action
  load = async (quiet: boolean = false) => {
    if (!this.parallelFetch && this.isInProgress) return
    if (this.listState.error) {
      this.listState.isRetrying = true
    }
    this.listState.error = undefined
    this.listState.isLoading = true

    try {
      const data = await this.fetcher.fetchData(false)
      if (data === 'cancelled') return this.resetProgress()
      this.updateState(data)
    } catch (e) {
      if (!quiet) {
        toastHelper.error(JSON.stringify(e), false)
      } else {
        logJS('warning', 'BaseListStore', 'load error:', e)
      }
      runInAction(() => {
        this.listState.error = e
        this.resetProgress()
      })
    }
  }

  @action
  loadMore = async (resultValidator?: () => boolean) => {
    if ((!this.parallelFetch && this.isInProgress) || !this.listState.lastValue)
      return
    this.listState.error = undefined
    this.listState.isLoadingMore = true

    try {
      const data = await this.fetcher.fetchMore(this.listState.lastValue)
      if (data === 'cancelled') return this.resetProgress()
      if (resultValidator?.() ?? true) this.updateState(data, true)
    } catch (e) {
      toastHelper.error(JSON.stringify(e), false)
      logJS('warning', 'BaseListStore', 'load more error:', e)
      runInAction(() => {
        this.listState.error = e
        this.resetProgress()
      })
    }
  }

  refresh = async () => {
    if (!this.parallelFetch && this.isInProgress) return
    runInAction(() => {
      this.listState.error = undefined
      this.listState.isLoadingMore = true
      this.listState.isRefreshing = true
    })

    try {
      const data = await this.fetcher.fetchData(true)
      if (data === 'cancelled') return this.resetProgress()
      this.updateState(data)
    } catch (e) {
      toastHelper.error(JSON.stringify(e), false)
      runInAction(() => {
        this.listState.error = e
        this.resetProgress()
      })
    }
  }

  @action
  mutateItems = (items: Array<T>) => {
    this.listState.items = items
  }

  @action
  mutateItem = (index: number, item: T) => {
    const update = [...this.listState.items]
    update[index] = item
    this.listState.items = update
  }

  @action
  removeItem(index: number) {
    this.listState.items.splice(index, 1)
  }

  @action
  clear() {
    this.resetProgress()
    this.listState.isFirstLoading = true
    this.listState.lastValue = null
    this.listState.items = []
    this.listState.error = undefined
    this.listState.isLoadAll = false
  }

  @action
  private updateState = (
    update: DataUpdate<T> | Unknown,
    doAppend: boolean = false,
  ) => {
    this.resetProgress()
    this.listState.isFirstLoading = false
    this.listState.error = undefined
    this.listState.totalCount = undefined
    if (!update) return
    if (doAppend) {
      this.listState.isLoadAll =
        update.lastValue === null || update.items.length === 0
      this.listState.items = this.listState.items.concat(update.items)
    } else {
      this.listState.items = update.items
    }
    this.listState.lastValue = update.lastValue
    this.listState.totalCount = update?.totalCount
  }

  @action
  private resetProgress = () => {
    this.listState.isRefreshing = false
    this.listState.isLoading = false
    this.listState.isRetrying = false
    this.listState.isLoadingMore = false
  }
}

export class ListStoreDelegate<T> implements IListStore<T> {
  constructor(protected delegate: IListStore<T>) {}

  @computed
  get isFirstLoading(): boolean | undefined {
    return this.delegate.isFirstLoading
  }

  @computed
  get error(): any {
    return this.delegate.error
  }

  @computed
  get isInProgress(): boolean {
    return this.delegate.isInProgress
  }

  @computed
  get isLoadAll(): boolean {
    return this.delegate.isLoadAll
  }

  @computed
  get isLoading(): boolean {
    return this.delegate.isLoading
  }

  @computed
  get isLoadingMore(): boolean {
    return this.delegate.isLoadingMore
  }

  @computed
  get isRefreshing(): boolean {
    return this.delegate.isRefreshing
  }

  @computed
  get isRetrying(): boolean {
    return this.delegate.isRetrying
  }

  @computed
  get list(): Array<T> {
    return this.delegate.list
  }

  clear(): void {
    this.delegate.clear()
  }

  load(): Promise<void> {
    return this.delegate.load()
  }

  loadMore(): Promise<void> {
    return this.delegate.loadMore()
  }

  mutateItems(items: Array<T>): void {
    this.delegate.mutateItems(items)
  }

  mutateItem(index: number, item: T) {
    this.delegate.mutateItem(index, item)
  }

  removeItem(index: number) {
    this.delegate.removeItem(index)
  }

  refresh(): Promise<void> {
    return this.delegate.refresh()
  }
}

export const createListStore = <T>(
  fetchData: () => Promise<RestResponse<Paginated<T>> | 'cancelled'>,
  fetchMore: (
    lastValue: string,
  ) => Promise<RestResponse<Paginated<T>> | 'cancelled'>,
  quiet: boolean = false,
) => {
  return new BaseListStore(
    new SimpleListFetcher<T>(fetchData, fetchMore, quiet),
  )
}

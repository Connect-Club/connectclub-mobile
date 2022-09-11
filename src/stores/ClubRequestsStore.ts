import {
  action,
  computed,
  makeAutoObservable,
  observable,
  runInAction,
} from 'mobx'

import {api} from '../api/api'
import {appEventEmitter, UpdateClubJoinedState} from '../appEventEmitter'
import {logJS} from '../components/screens/room/modules/Logger'
import {ClubJoinRequestModel} from '../models'
import {runWithLoaderAsync} from '../utils/navigation.utils'
import {toastHelper} from '../utils/ToastHelper'
import {SimpleListFetcher} from './BaseListStore'
import SearchListStore from './SearchListStore'

export class ClubRequestsStore {
  readonly internalStore: SearchListStore<ClubJoinRequestModel>
  readonly updateClubJoinedStateDisposable: () => void

  constructor(clubId: string) {
    const fetcherProvider = () =>
      new SimpleListFetcher(
        (query) =>
          api.fetchClubJoinRequests(clubId, undefined, undefined, query),
        (lastValue, query) =>
          api.fetchClubJoinRequests(clubId, lastValue, undefined, query),
        true,
      )
    this.internalStore = new SearchListStore(fetcherProvider)
    this.updateClubJoinedStateDisposable = appEventEmitter.on(
      'updateClubJoinedState',
      (params: UpdateClubJoinedState) => {
        this.internalStore.mutateItems(
          this.internalStore.list.filter(
            (request) => request.user.id !== params.userId,
          ),
        )
      },
    )
    makeAutoObservable(this)
  }

  @computed
  get requestsCount(): number {
    return this.internalStore.contentStore.list.length
  }

  @computed
  get isLoading(): boolean {
    return this.internalStore.isLoading
  }

  @computed
  get error(): any {
    return this.internalStore.error
  }

  @computed
  get list(): Array<ClubJoinRequestModel> {
    return this.internalStore.list
  }

  @action
  setSearchMode(mode: boolean) {
    this.internalStore.setSearchMode(mode)
  }

  @action
  search(query: string) {
    this.internalStore.search(query)
  }

  @computed
  get isRefreshing(): boolean {
    return this.internalStore.isRefreshing
  }

  @observable
  actionRequestId?: string

  acceptRequest = async (userId: string, requestId: string) => {
    logJS(
      'debug',
      'ClubRequestsStore',
      'accept requset for user',
      userId,
      'req.id',
      requestId,
    )
    runInAction(() => (this.actionRequestId = requestId))
    await runWithLoaderAsync(async () => {
      const response = await api.acceptClubJoinRequest(requestId)
      runInAction(() => (this.actionRequestId = undefined))
      if (response.error) return toastHelper.error(response.error)
      runInAction(() => {
        const index = this.internalStore.list.findIndex(
          (item) => item.joinRequestId === requestId,
        )
        if (index > -1) {
          const item = this.internalStore.list[index]
          this.internalStore.mutateItem(index, {
            joinRequestId: item.joinRequestId,
            user: {...item.user, clubRole: 'member'},
          })
        }
      })
    })
  }

  load = async () => this.internalStore.load()

  loadMore = async () => this.internalStore.loadMore()

  refresh = async () => this.internalStore.refresh()

  clear() {
    this.updateClubJoinedStateDisposable()
    this.internalStore.clear()
  }
}

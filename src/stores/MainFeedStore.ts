import {makeAutoObservable, observable, runInAction} from 'mobx'

import {api} from '../api/api'
import {hideLoading} from '../appEventEmitter'
import {CreateEventDraft, MainFeedItemModel, Unknown} from '../models'
import {toastHelper} from '../utils/ToastHelper'

export class MainFeedStore {
  onlineLastValue: string | Unknown = null
  eventsLastValue: string | Unknown = null
  isReachedEnd = false

  constructor() {
    makeAutoObservable(this)
  }

  @observable
  isLoading = false

  @observable
  isEventLoadingMore = false

  @observable
  isFirstLoading = true

  @observable
  feed: Array<MainFeedItemModel> = []

  @observable
  error?: string

  fetch = () => {
    return new Promise<void>(async (resolve) => {
      this.isLoading = true
      const response = await api.fetchMainFeed()

      runInAction(() => {
        this.isReachedEnd = false
        this.isFirstLoading = false
        this.feed = response.data?.items ?? []
        this.eventsLastValue = response.data?.lastValue
        this.error = response.error
        this.isLoading = false
        resolve()
      })
    })
  }

  fetchEventsMore = async () => {
    if (!this.eventsLastValue) return
    if (this.isReachedEnd) return
    if (this.isEventLoadingMore) return
    this.isEventLoadingMore = true
    const response = await api.fetchMainFeed(this.eventsLastValue)
    runInAction(() => {
      if (response.error) {
        this.eventsLastValue = null
        this.isReachedEnd = true
        return toastHelper.error(response.error)
      }

      this.isReachedEnd = true

      this.feed = this.feed.concat(response.data?.items ?? [])
      this.eventsLastValue = response.data?.lastValue
      this.isEventLoadingMore = false
    })
  }

  startNewRoom = async (
    createEventDraft: CreateEventDraft,
  ): Promise<MainFeedItemModel | undefined> => {
    let response = await api.getAvailableRoomDrafts()
    if (response.error) {
      toastHelper.error(response.error)
      return undefined
    }

    const draft = response.data!.find((d) => d.type === createEventDraft.type)!
    const startRoomResponse = await api.startRoom(
      draft.id,
      createEventDraft.roomName.trim(),
      createEventDraft.isPrivate === true,
      createEventDraft.eventId,
      createEventDraft.userId,
      createEventDraft.languageId,
    )
    if (startRoomResponse.error) {
      toastHelper.error(startRoomResponse.error)
      return undefined
    }

    hideLoading()
    return startRoomResponse.data
  }
}

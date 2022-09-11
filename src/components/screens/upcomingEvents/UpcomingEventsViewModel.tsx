import {makeAutoObservable} from 'mobx'
import {useContext} from 'react'

import {api} from '../../../api/api'
import {appEventEmitter} from '../../../appEventEmitter'
import {EventModel} from '../../../models'
import {createListStore} from '../../../stores/BaseListStore'
import UpcomingEventsStoreContext, {
  UpcomingEventsStore,
} from '../../../stores/UpcomingEventsStore'
import {useViewModel} from '../../../utils/useViewModel'

class UpcomingEventsViewModel {
  readonly upcomingEventsStore: UpcomingEventsStore
  readonly personalEventsStore = createListStore(
    api.fetchPersonalUpcomingEvents,
    (lastValue) => api.fetchPersonalUpcomingEvents(lastValue),
    true,
  )
  private cleaner?: () => void

  constructor(store: UpcomingEventsStore) {
    this.upcomingEventsStore = store
    makeAutoObservable(this)
    const clearUpdates = appEventEmitter.on(
      'eventUpdated',
      (event: EventModel | undefined) => {
        if (!event) {
          this.personalEventsStore.refresh()
          return
        }
        const itemIndex = this.personalEventsStore.list.findIndex(
          (item) => item.id === event.id,
        )
        if (itemIndex > -1)
          this.personalEventsStore.mutateItem(itemIndex, event)
      },
    )
    const clearCreations = appEventEmitter.on(
      'eventCreated',
      this.personalEventsStore.refresh,
    )
    const clearDeletions = appEventEmitter.on(
      'eventDeleted',
      (event: EventModel) => {
        const itemIndex = this.personalEventsStore.list.findIndex(
          (item) => item.id === event.id,
        )
        if (itemIndex > -1) {
          this.personalEventsStore.removeItem(itemIndex)
        }
      },
    )
    this.cleaner = () => {
      clearUpdates()
      clearCreations()
      clearDeletions()
    }
  }

  get isLoading(): boolean {
    return (
      this.upcomingEventsStore.isLoading || this.personalEventsStore.isLoading
    )
  }

  get error(): any {
    return this.upcomingEventsStore.error || this.personalEventsStore.error
  }

  load = () => {
    this.personalEventsStore.load(true)
    this.upcomingEventsStore.load(true)
  }

  clear = () => {
    this.cleaner?.()
    this.upcomingEventsStore.clear()
    this.personalEventsStore.clear()
  }
}

export function useUpcomingEventsViewModel() {
  const store = useContext(UpcomingEventsStoreContext)!
  return useViewModel(() => new UpcomingEventsViewModel(store))
}

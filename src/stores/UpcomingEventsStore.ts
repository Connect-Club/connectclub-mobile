import {action, observable, runInAction} from 'mobx'
import {createContext} from 'react'

import {api} from '../api/api'
import {appEventEmitter, hideLoading, showLoading} from '../appEventEmitter'
import {EventModel} from '../models'
import {toastHelper} from '../utils/ToastHelper'
import BaseListStore, {SimpleListFetcher} from './BaseListStore'

export class UpcomingEventsStore extends BaseListStore<EventModel> {
  constructor() {
    super(
      new SimpleListFetcher(
        async () => api.fetchUpcomingEvents(),
        async (lastValue: string) => api.fetchUpcomingEvents(null, lastValue),
        true,
      ),
    )
  }

  @observable
  upcomingEvents: Array<EventModel> = []

  fetchUpcomingEvents = () => {
    return new Promise<void>(async (resolve) => {
      const response = await api.fetchMainFeedCalendar()
      runInAction(() => {
        this.upcomingEvents = response.data?.items ?? []
        resolve()
      })
    })
  }

  subscribeOnEvent = async (event: EventModel): Promise<boolean> => {
    const response = await api.subscribeOnEvent(event.id)
    if (response.error) {
      toastHelper.error(response.error)
      return false
    }

    runInAction(() => {
      let update: EventModel | undefined
      const ue = this.upcomingEvents.find((e) => e.id === event.id)
      if (ue) ue.isSubscribed = true
      const events = this.list.map((e) => {
        if (e.id !== event.id) return e
        update = {...e, isSubscribed: true}
        return update
      })
      this.mutateItems(events)
      if (update) appEventEmitter.trigger('eventUpdated', update)
    })
    return true
  }

  unSubscribeFromEvent = async (event: EventModel): Promise<boolean> => {
    let update: EventModel | undefined
    const response = await api.unSubscribeFromEvent(event.id)
    if (response.error) {
      toastHelper.error(response.error)
      return false
    }

    runInAction(() => {
      const ue = this.upcomingEvents.find((e) => e.id === event.id)
      if (ue) ue.isSubscribed = false
      const events = this.list.map((e) => {
        if (e.id !== event.id) return e
        update = {...e, isSubscribed: false}
        return update
      })
      this.mutateItems(events)
      appEventEmitter.trigger('eventUpdated')
      if (update) appEventEmitter.trigger('eventUpdated', update)
    })
    return true
  }

  @action
  approveEvent = async (id: string) => {
    showLoading()
    const response = await api.approveEvent(id)
    runInAction(() => {
      hideLoading()
      if (response.error) return toastHelper.error(response.error)
      const eventIndex = this.list.findIndex((item) => item.id === id)
      if (eventIndex) {
        appEventEmitter.trigger('eventUpdated', this.list[eventIndex])
      }
    })
  }

  @action
  cancelEvent = async (id: string) => {
    showLoading()
    const response = await api.cancelEvent(id)
    runInAction(() => {
      hideLoading()
      if (response.error) return toastHelper.error(response.error)
      const eventIndex = this.list.findIndex((item) => item.id === id)
      if (eventIndex) {
        appEventEmitter.trigger('eventUpdated', this.list[eventIndex])
      }
    })
  }

  @action
  deleteEvent = async (id: string) => {
    showLoading()
    const response = await api.deleteEvent(id)
    runInAction(() => {
      hideLoading()
      if (response.error) return toastHelper.error(response.error)
      const eventIndex = this.list.findIndex((item) => item.id === id)
      if (eventIndex > -1) {
        const event = this.list[eventIndex]
        this.removeItem(eventIndex)
        appEventEmitter.trigger('eventDeleted', event)
      }
    })
  }

  reset = () => {
    this.clear()
  }
}

export default createContext(new UpcomingEventsStore())

import {makeAutoObservable, observable, runInAction} from 'mobx'

import {api} from '../api/api'
import {logJS} from '../components/screens/room/modules/Logger'
import {EventModel} from '../models'

class UpcomingEventStore {
  @observable
  event?: EventModel

  @observable
  isInProgress = false

  @observable
  isInitializing = false

  @observable
  error?: any

  @observable
  isAllowStart = false

  @observable
  isAllowJoin = false

  @observable
  isJoinEnabled = false

  @observable
  isReset = false

  constructor() {
    makeAutoObservable(this)
  }

  init = async (eventId: string, reset?: boolean) => {
    logJS('debug', 'UpcomingEventStore', 'init')
    this.error = undefined
    this.isInitializing = true
    this.isInProgress = true
    if (reset) this.event = undefined
    const response = await api.fetchUpcomingEvent(eventId)
    runInAction(() => {
      this.isInProgress = false
      this.isInitializing = false
      if (response.error) {
        logJS('debug', 'UpcomingEventStore', 'error', response.error)
        this.error = response.error
        return
      }
      this.isReset = !!reset
      this.takeEvent(response.data!)
    })
  }

  initWithEvent = (event: EventModel) => {
    logJS('debug', 'UpcomingEventStore', 'init with event')
    this.error = undefined
    this.takeEvent(event)
  }

  private takeEvent(event: EventModel) {
    logJS('debug', 'UpcomingEventStore', 'take event')
    runInAction(() => {
      this.isAllowStart = event.isOwned && event.state === 'create_room'
      logJS(
        'debug',
        'UpcomingEventStore',
        'allowed to start?',
        this.isAllowStart,
      )
      this.isAllowJoin = event.state === 'join'
      logJS('debug', 'UpcomingEventStore', 'allowed to join?', this.isAllowJoin)
      this.isJoinEnabled = !event.withToken || event.isOwnerToken
      this.event = event
    })
  }
}

export default UpcomingEventStore

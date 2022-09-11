import {action, makeObservable, observable, runInAction} from 'mobx'

import {logJS} from '../components/screens/room/modules/Logger'
import {UserTag} from '../models'
import {ProfileStore} from './ProfileStore'
import UserCountersStore from './UserCountersStore'

export class ProfileScreenStore {
  readonly profileStore: ProfileStore
  readonly countersStore: UserCountersStore
  private readonly userTag: UserTag
  isLoading = false

  constructor(userTag: UserTag) {
    this.profileStore = new ProfileStore(userTag)
    this.countersStore = new UserCountersStore()
    this.userTag = userTag
    makeObservable(this, {isLoading: observable, fetch: action})
  }

  fetch = async () => {
    if (this.isLoading) return
    this.isLoading = true
    logJS('debug', 'ProfileScreenStore', 'fetch profile')
    let countersPromise: Promise<void> | undefined
    if (this.userTag.hasId()) {
      countersPromise = this.countersStore.updateCounters(this.userTag.userId!)
    }
    await this.profileStore.fetch()
    if (this.profileStore.error) {
      this.resetLoading()
      return
    }
    logJS('debug', 'ProfileScreenStore', 'fetch counters')
    if (countersPromise) {
      await countersPromise
    } else {
      await this.countersStore.updateCounters(this.profileStore.userId)
    }
    this.resetLoading()
  }

  clear = () => {
    this.isLoading = false
  }

  private resetLoading = () =>
    runInAction(() => {
      this.isLoading = false
    })
}

import {action, makeAutoObservable, observable, runInAction} from 'mobx'

import {api} from '../api/api'
import {UserCounters} from '../models'

export class UserCountersStore {
  constructor() {
    makeAutoObservable(this)
  }

  @observable
  counters?: UserCounters

  updateCounters = async (userId: string) => {
    const response = await api.userCounters(userId)
    runInAction(() => {
      if (response.data) this.counters = response.data
    })
  }

  @action
  incConnected = () => this.counters && (this.counters.connectedCount += 1)
  @action
  decConnected = () => this.counters && (this.counters.connectedCount -= 1)
  @action
  incConnecting = () => this.counters && (this.counters.connectingCount += 1)
  @action
  decConnecting = () => this.counters && (this.counters.connectingCount -= 1)
  @action
  incMutualFriends = () =>
    this.counters && (this.counters.mutualFriendsCount += 1)
  @action
  decMutualFriends = () =>
    this.counters && (this.counters.mutualFriendsCount -= 1)
}

export default UserCountersStore

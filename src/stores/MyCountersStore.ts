import {makeAutoObservable, observable, runInAction} from 'mobx'
import {createContext} from 'react'

import {api} from '../api/api'
import {MyCounters} from '../models'

export class MyCountersStore {
  constructor() {
    makeAutoObservable(this)
  }

  @observable
  counters: MyCounters = {
    countFreeInvites: 0,
    countNewActivities: 0,
    countOnlineFriends: 0,
    countPendingInvites: 0,
    hasNewInvites: false,
    showFestivalBanner: false,
    checkInRoomId: '',
    checkInRoomPass: '',
    communityLink: '',
    joinDiscordLink: '',
  }

  updateCounters = async () => {
    const response = await api.myCounters()
    runInAction(() => {
      if (response.data) this.counters = response.data
    })
  }

  async readHasInvites() {
    await api.readHasInvites()
    await this.updateCounters()
  }
}

export default createContext(new MyCountersStore())

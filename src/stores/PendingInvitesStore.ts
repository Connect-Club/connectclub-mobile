import {action, makeAutoObservable, observable, runInAction} from 'mobx'
import {createContext} from 'react'

import {api} from '../api/api'
import {hideLoading, showLoading} from '../appEventEmitter'
import {InviteContactModel, Unknown} from '../models'
import {openInviteSms} from '../utils/sms.utils'
import {toastHelper} from '../utils/ToastHelper'

class PendingInvitesStore {
  private lastValue: string | Unknown
  private isLoadMore = false

  constructor() {
    makeAutoObservable(this)
  }

  @observable
  pending: Array<InviteContactModel> = []

  initialize = async () => {
    showLoading()

    const response = await api.getInviteContactsList(this.lastValue, true)

    if (response.error) {
      hideLoading()
      return toastHelper.error(response.error)
    }
    this.lastValue = response.data?.lastValue
    runInAction(() => {
      this.clear()
      this.pending = response.data?.items ?? []
      hideLoading()
    })
  }

  @action
  loadMore = async () => {
    if (!this.lastValue) return
    if (this.isLoadMore) return
    this.isLoadMore = true

    const response = await api.getInviteContactsList(this.lastValue, true)
    if (response.error) {
      this.lastValue = null
      this.isLoadMore = false
      return toastHelper.error(response.error)
    }
    this.lastValue = response.data?.lastValue ?? null
    const newItems = response.data?.items ?? []
    runInAction(() => {
      this.pending = [...this.pending, ...newItems]
      this.isLoadMore = false
    })
  }

  @action
  sendReminder = (displayName: string, phone: string) => {
    openInviteSms(phone, displayName)
  }

  @action
  clear = () => {
    this.pending = []
  }
}

export default createContext(new PendingInvitesStore())

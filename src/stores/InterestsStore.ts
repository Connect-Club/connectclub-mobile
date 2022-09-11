import {action, makeAutoObservable, observable, runInAction} from 'mobx'
import {createContext} from 'react'

import {AnalyticsSender} from '../Analytics'
import {api} from '../api/api'
import {hideLoading, showLoading} from '../appEventEmitter'
import {logJS} from '../components/screens/room/modules/Logger'
import {CurrentUser, InterestCategoryModel, InterestModel} from '../models'
import {isWeb} from '../utils/device.utils'
import {toastHelper} from '../utils/ToastHelper'

export const INTERESTS_LIMIT = 5
export type InterestsSelectResult = 'limit' | 'ok'

class InterestsStore {
  analyticsSender: AnalyticsSender | undefined

  @observable
  interests: Array<InterestModel> = []

  @observable
  selected = new Map<number, InterestModel>()

  @observable
  merged: Array<InterestCategoryModel> = []

  @observable
  isLoading = false

  constructor() {
    makeAutoObservable(this)
  }

  fetch = async (globalLoader: boolean = true) => {
    logJS('debug', 'InterestsStore', 'fetch')
    this.isLoading = true
    if (this.merged.length > 0) {
      logJS('debug', 'InterestsStore', 'clear merged')
      this.merged = []
      return
    }
    if (globalLoader) showLoading()
    logJS('debug', 'InterestsStore', 'do request')
    const response = await api.fetchInterests()
    logJS('debug', 'InterestsStore', 'got response')
    runInAction(() => {
      this.interests = response

      this.merged = [{id: 0, name: '', interests: [response]}]
      this.isLoading = false
      logJS('debug', 'InterestsStore', 'complete loading')
      if (globalLoader && isWeb) hideLoading()
    })
  }

  onToggleSelect = (interest: InterestModel): Promise<InterestsSelectResult> =>
    new Promise<InterestsSelectResult>((resolve) => {
      runInAction(() => {
        if (this.selected.has(interest.id)) {
          this.analyticsSender?.sendEvent('interests_remove')
          this.selected.delete(interest.id)
        } else {
          if (this.selected.size >= INTERESTS_LIMIT) return resolve('limit')
          this.analyticsSender?.sendEvent('interests_select')
          this.selected.set(interest.id, interest)
        }
        resolve('ok')
      })
    })

  @action
  addSelected = (interests: Array<InterestModel>) => {
    interests.map((i) => this.selected.set(i.id, i))
  }

  @action
  resetSelection = () => {
    this.selected.clear()
  }

  updateUserInterests = async (): Promise<CurrentUser | undefined> => {
    const response = await api.updateProfile({
      interests: Array.from(this.selected.values()),
    })
    if (response.data) return response.data
    toastHelper.error(response?.error ?? 'errorNetworkTitle')
    return
  }

  @action
  cleanup() {
    this.merged = []
    this.interests = []
  }
}

export default createContext(new InterestsStore())

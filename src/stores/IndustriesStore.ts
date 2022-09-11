import {action, makeAutoObservable, observable, runInAction} from 'mobx'
import {createContext} from 'react'

import {AnalyticsSender} from '../Analytics'
import {api} from '../api/api'
import {hideLoading, showLoading} from '../appEventEmitter'
import {IndustryModel} from '../models'
import {toastHelper} from '../utils/ToastHelper'

class IndustriesStore {
  analyticsSender: AnalyticsSender | undefined

  @observable
  industries: Array<IndustryModel> = []

  @observable
  selected = new Map<string, IndustryModel>()

  @observable
  isLoading = false

  constructor() {
    makeAutoObservable(this)
  }

  fetch = async () => {
    this.isLoading = true
    showLoading()
    const response = await api.fetchIndustries()
    if (response.error) return toastHelper.error(response.error)
    runInAction(() => {
      this.industries = response.data!

      // Delete industries weren't received from api
      const receivedIds = new Set(
        response.data!.map((ind) => {
          return ind.id
        }),
      )
      this.removeNotPresentedIndustries(receivedIds)

      this.isLoading = false
      hideLoading()
    })
  }

  onToggleSelect = (industry: IndustryModel): Promise<void> =>
    new Promise<void>((resolve) => {
      runInAction(() => {
        if (this.selected.has(industry.id)) {
          this.analyticsSender?.sendEvent('industry_remove')
          this.selected.delete(industry.id)
        } else {
          this.analyticsSender?.sendEvent('industry_select')
          this.selected.set(industry.id, industry)
        }
        resolve()
      })
    })

  @action
  addSelected = (industries: Array<IndustryModel>) => {
    industries.map((i) => this.selected.set(i.id, i))
  }

  @action
  resetSelection = () => {
    this.selected.clear()
  }

  updateUserIndustries = async () => {
    const response = await api.updateProfile({
      industries: Array.from(this.selected.values()),
    })
    if (response.error) return toastHelper.error(response.error)
  }

  @action
  cleanup() {
    this.industries = []
  }

  @action
  private removeNotPresentedIndustries = (industries: Set<string>) => {
    Array.from(this.selected.keys()).forEach((value) => {
      if (!industries.has(value)) this.selected.delete(value)
    })
  }
}

export default createContext(new IndustriesStore())

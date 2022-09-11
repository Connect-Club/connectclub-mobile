import {action, makeAutoObservable, observable, runInAction} from 'mobx'
import {createContext} from 'react'

import {AnalyticsSender} from '../Analytics'
import {api} from '../api/api'
import {hideLoading, showLoading} from '../appEventEmitter'
import {GoalModel} from '../models'
import {toastHelper} from '../utils/ToastHelper'

class GoalsStore {
  analyticsSender: AnalyticsSender | undefined

  @observable
  goals: Array<GoalModel> = []

  @observable
  selected = new Map<string, GoalModel>()

  @observable
  isLoading = false

  constructor() {
    makeAutoObservable(this)
  }

  fetch = async () => {
    this.isLoading = true
    showLoading()
    const response = await api.fetchGoals()
    if (response.error) return toastHelper.error(response.error)
    runInAction(() => {
      const data = response.data!
      this.goals = data

      // Delete goals weren't received from api
      const receivedIds = new Set(
        data.map((ind) => {
          return ind.id
        }),
      )
      this.removeNotPresentedGoals(receivedIds)

      this.isLoading = false
      hideLoading()
    })
  }

  onToggleSelect = (goal: GoalModel): Promise<void> =>
    new Promise<void>((resolve) => {
      runInAction(() => {
        if (this.selected.has(goal.id)) {
          this.analyticsSender?.sendEvent('goals_remove')
          this.selected.delete(goal.id)
        } else {
          this.analyticsSender?.sendEvent('goals_select')
          this.selected.set(goal.id, goal)
        }
        resolve()
      })
    })

  @action
  addSelected = (goals: Array<GoalModel>) => {
    goals.map((i) => this.selected.set(i.id, i))
  }

  @action
  resetSelection = () => {
    this.selected.clear()
  }

  updateUserGoals = async () => {
    const response = await api.updateProfile({
      goals: Array.from(this.selected.values()),
    })
    if (response.error) return toastHelper.error(response.error)
  }

  @action
  cleanup() {
    this.goals = []
  }

  @action
  private removeNotPresentedGoals = (goals: Set<string>) => {
    Array.from(this.selected.keys()).forEach((value) => {
      if (!goals.has(value)) this.selected.delete(value)
    })
  }
}

export default createContext(new GoalsStore())

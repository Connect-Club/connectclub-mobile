import {action, makeAutoObservable, observable, runInAction} from 'mobx'
import {createContext} from 'react'

import {AnalyticsSender} from '../Analytics'
import {api} from '../api/api'
import {hideLoading, showLoading} from '../appEventEmitter'
import {SkillCategoryModel, SkillModel} from '../models'
import {isWeb} from '../utils/device.utils'
import {toastHelper} from '../utils/ToastHelper'

class SkillsStore {
  analyticsSender: AnalyticsSender | undefined

  @observable
  skills: Array<SkillCategoryModel> = []

  @observable
  selected = new Map<string, SkillModel>()

  @observable
  merged: Array<SkillCategoryModel> = []

  @observable
  isLoading = false

  constructor() {
    makeAutoObservable(this)
  }

  fetch = async () => {
    this.isLoading = true
    if (this.merged.length > 0) {
      this.merged = []
      return
    }
    showLoading()
    const response = await api.fetchSkills()
    if (response.error) return toastHelper.error(response.error)
    runInAction(() => {
      const data = response.data!
      this.skills = data

      const receivedIds = this.flattenSkillIds(data)
      this.removeNotPresentedSkills(receivedIds)

      this.merged = data.map((r) => ({
        ...r,
        skills: [r.skills.flat()],
      }))
      this.isLoading = false
      if (isWeb) hideLoading()
    })
  }

  onToggleSelect = (skill: SkillModel): Promise<void> =>
    new Promise<void>((resolve) => {
      runInAction(() => {
        if (this.selected.has(skill.id)) {
          this.analyticsSender?.sendEvent('skills_remove')
          this.selected.delete(skill.id)
        } else {
          this.analyticsSender?.sendEvent('skills_select')
          this.selected.set(skill.id, skill)
        }
        resolve()
      })
    })

  @action
  addSelected = (skills: Array<SkillModel>) => {
    skills.map((i) => this.selected.set(i.id, i))
  }

  @action
  resetSelection = () => {
    this.selected.clear()
  }

  updateUserSkills = async () => {
    const response = await api.updateProfile({
      skills: Array.from(this.selected.values()),
    })
    if (response.error) return toastHelper.error(response.error)
  }

  @action
  cleanup() {
    this.merged = []
    this.skills = []
  }

  private flattenSkillIds = (categories: Array<SkillCategoryModel>) =>
    new Set<string>(
      categories.flatMap((cat) => cat.skills.flat().map((skill) => skill.id)),
    )

  @action
  private removeNotPresentedSkills = (skills: Set<string>) => {
    Array.from(this.selected.keys()).forEach((value) => {
      if (!skills.has(value)) this.selected.delete(value)
    })
  }
}

export default createContext(new SkillsStore())

import {action, makeAutoObservable, observable, runInAction} from 'mobx'

import {api} from '../api/api'
import {hideLoading, showLoading} from '../appEventEmitter'
import {logJS} from '../components/screens/room/modules/Logger'
import {LanguageModel} from '../models'
import {storage} from '../storage'
import {runWithLoaderAsync} from '../utils/navigation.utils'
import {toastHelper} from '../utils/ToastHelper'

export default class LanguageSelectorStore {
  constructor(private mode: 'single' | 'multiple' = 'single') {
    makeAutoObservable(this)
  }

  @observable
  items: Array<LanguageModel> = []

  @observable
  selectedLanguages: Array<LanguageModel> = []

  @observable
  selectedLanguageIds: Set<number> = new Set<number>()

  fetch = async () => {
    showLoading()
    const response = await api.getLanguages()
    hideLoading()
    if (response.error) return toastHelper.error(response.error)
    runInAction(() => {
      this.items = response.data ?? []
    })
  }

  isSelected(langId: number): boolean {
    return this.selectedLanguageIds.has(langId)
  }

  toggleAll = (langs: Array<LanguageModel>) => {
    langs.forEach((lang) => this.toggle(lang))
  }

  @action
  toggle = (lang?: LanguageModel) => {
    logJS('info', 'toggle selected language', JSON.stringify(lang))

    if (this.mode === 'single') {
      this.selectedLanguages = lang ? [lang] : []
      this.selectedLanguageIds.clear()
      if (lang) {
        this.selectedLanguageIds.add(lang.id)
      }
      return
    }

    if (!lang) return
    const current = this.selectedLanguages.findIndex((i) => i.id === lang.id)
    if (current >= 0) {
      this.selectedLanguageIds.delete(lang.id)
      this.selectedLanguages.splice(current, 1)
    } else {
      this.selectedLanguageIds.add(lang.id)
      this.selectedLanguages.push(lang)
    }
  }

  @action
  saveToProfile = async () => {
    return await runWithLoaderAsync(async () => {
      const response = await api.updateProfile({
        languages: this.selectedLanguages,
      })
      if (response.error) return toastHelper.error(response.error)
      await storage.saveUser(response.data!)
      await storage.setLanguageChosen()
      return true
    })
  }

  @action
  clear = () => (this.selectedLanguages = [])
}

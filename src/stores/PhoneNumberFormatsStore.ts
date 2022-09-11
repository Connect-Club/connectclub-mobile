import {
  action,
  computed,
  makeAutoObservable,
  observable,
  runInAction,
} from 'mobx'
import {createContext} from 'react'

import {analytics} from '../Analytics'
import {api} from '../api/api'
import {hideLoading, showLoading} from '../appEventEmitter'
import {PhoneFormatsModel} from '../models'
import {replaceAll} from '../utils/stringHelpers'

class PhoneNumberFormatsStore {
  constructor() {
    makeAutoObservable(this)
  }

  @observable
  isLoading = false

  @observable
  formats?: PhoneFormatsModel

  @observable
  selectedCode?: string

  @observable
  error?: string

  get selectedPrefix(): string {
    const code = this.selectedCode
    if (!code) return ''
    return this.formats?.availableRegions?.[code].regionPrefix ?? ''
  }

  get selectedExample(): string {
    const code = this.selectedCode
    if (!code) return ''
    return this.formats?.availableRegions?.[code].example ?? ''
  }

  @computed
  get selectedPattern(): string | undefined {
    const code = this.selectedCode
    if (!code) return ''
    let pattern = replaceAll(
      this.formats?.availableRegions?.[code].examplePattern ?? '',
      '-',
      '',
    )
    pattern = replaceAll(pattern, ' ', '')
    return pattern
  }

  get selectedRegExp(): string | undefined {
    const code = this.selectedCode
    if (!code) return ''
    return this.formats?.availableRegions?.[code].pattern
  }

  get availableLength(): Array<number> {
    const code = this.selectedCode
    const patternLength = this.selectedPattern?.length ?? 100
    if (!code) return [patternLength]
    const arr = this.formats?.availableRegions?.[code].possibleLength
    if (!arr || arr.length === 0) return [patternLength]
    return arr
  }

  get maxLength(): number {
    const code = this.selectedCode
    if (!code) return -1
    let values = this.availableLength
    let max = values[0]
    for (let i = 1; i < values.length; ++i) {
      if (values[i] > max) {
        max = values[i]
      }
    }
    return max
  }

  @action
  selectCode = (code: string) => {
    this.selectedCode = code
  }

  @action
  fetch = async (quiet?: boolean) => {
    this.error = undefined
    if (this.formats) return
    if (this.isLoading) return
    this.isLoading = true
    if (!quiet) showLoading()
    const response = await api.fetchPhoneNumberFormats()
    runInAction(() => {
      if (response.error) {
        if (!quiet) {
          this.error = response.error
          analytics.sendEvent('phone_fail', {error: response.error})
        }
      } else {
        this.formats = response.data
      }
      this.selectedCode = this.formats?.detectRegionCode
      this.isLoading = false
      if (!quiet) hideLoading()
    })
  }
}

export default createContext(new PhoneNumberFormatsStore())

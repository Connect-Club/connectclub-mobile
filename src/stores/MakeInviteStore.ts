import {action, makeAutoObservable, observable, runInAction} from 'mobx'

import {api} from '../api/api'
import {logJS} from '../components/screens/room/modules/Logger'
import {toastHelper} from '../utils/ToastHelper'

class MakeInviteStore {
  @observable
  isInProgress = false

  @observable
  error?: string

  @observable
  inviteCode?: string

  constructor() {
    makeAutoObservable(this)
  }

  @action
  createInviteCode = async () => {
    logJS('debug', 'MakeInviteStore', 'create invite code requested')
    if (this.isInProgress) return
    logJS('debug', 'MakeInviteStore', 'start create invite code')
    this.isInProgress = true
    this.inviteCode = undefined

    const response = await api.createInviteCode()
    await runInAction(() => {
      this.isInProgress = false
      if (response.error) {
        logJS(
          'debug',
          'MakeInviteStore',
          'create invite code error',
          response.error,
        )
        this.error = response.error
        return
      }
      this.inviteCode = response.data?.code
      if (!this.inviteCode) {
        logJS(
          'debug',
          'MakeInviteStore',
          'create invite code: no invite code received',
          JSON.stringify(response),
        )
        toastHelper.error('somethingWentWrong')
        return
      }
      logJS(
        'debug',
        'MakeInviteStore',
        'create invite code success',
        response.error,
      )
    })
  }
}

export default MakeInviteStore

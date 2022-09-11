import {Platform} from 'react-native'

import {analytics} from '../Analytics'
import {api, UpdateProfile} from '../api/api'
import {hideLoading, sendAuthorized, showLoading} from '../appEventEmitter'
import {logJS} from '../components/screens/room/modules/Logger'
import {LanguageModel} from '../models'
import {storage} from '../storage'
import {requestNotificationToken} from './permissions.utils'
import {toastHelper} from './ToastHelper'

export const makeUserVerified = async (): Promise<boolean> => {
  logJS('info', 'makeUserVerified')
  showLoading()
  if (storage.currentUser?.state !== 'verified') {
    const verifyResponse = await api.verifyUser()
    if (verifyResponse.error) {
      toastHelper.error(verifyResponse.error)
      hideLoading()
      return false
    }
  }
  if (Platform.OS !== 'web') {
    requestNotificationToken(analytics).then((token) => {
      if (!token) {
        logJS('error', 'notification get token error')
      }
      api.sendDevice(token)
    })
  }
  hideLoading()
  sendAuthorized()
  return true
}

export const updateNativeLang = async (lang: LanguageModel): Promise<boolean> =>
  new Promise(async (resolve) => {
    showLoading()
    const response = await api.updateProfile({languages: [lang]})
    if (response.error) {
      hideLoading()
      toastHelper.error(response.error)
      return resolve(false)
    }
    const updatedProfile = response.data
    if (updatedProfile) await storage.saveUser(updatedProfile)
    await analytics.updateUserParams([
      'languageApp',
      updatedProfile?.language?.name,
    ])
    hideLoading()
    resolve(true)
  })

export const updateProfileData = async (
  data: UpdateProfile,
): Promise<boolean> => {
  if (!storage.currentUser) return false
  showLoading()
  const response = await api.updateProfile(data)
  hideLoading()
  if (response.error) {
    toastHelper.error(response.error)
    return false
  }
  if (!response.data) return false
  await storage.saveUser(response.data)
  return true
}

export const putNewUserToWaitlist = async (): Promise<boolean> => {
  logJS('info', 'setUserWaitingStatus')
  const currentUser = await api.current()
  if (!currentUser.data) {
    toastHelper.error(currentUser.error ?? 'errorNetworkTitle')
    return false
  }
  await storage.saveUser(currentUser.data)
  const state = currentUser.data.state

  if (state === 'not_invited' || state === 'old') {
    const response = await api.verifyUser('waiting_list')
    if (response.error) {
      toastHelper.error(response.error)
      return false
    }
  }
  return true
}

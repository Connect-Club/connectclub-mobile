import {useCallback, useEffect} from 'react'
import {getVersion} from 'react-native-device-info'
import semver from 'semver-compare'

import {appEventEmitter} from '../appEventEmitter'
import {logJS} from '../components/screens/room/modules/Logger'
import {storage} from '../storage'
import {toastHelper} from './ToastHelper'

const checkNeedsReleaseNotes = async () => {
  if (!storage.isAuthorized) return false
  const version = storage.lastAppVersionInstalled
  const currentVersion = await getVersion()
  if (version.length === 0 && storage.isAuthorized) {
    // authorized user is expected to use older version previously
    return true
  }
  return semver(currentVersion, version) > 0
}

const useReleaseNotes = () => {
  const showIfNeeded = useCallback(async () => {
    logJS('debug', 'useReleaseNotes', 'show if needed')
    const needToShow = await checkNeedsReleaseNotes()
    if (!needToShow) {
      logJS('debug', 'useReleaseNotes', 'no need to show')
      return
    }
    const version = await getVersion()
    logJS('debug', 'useReleaseNotes', 'show')
    toastHelper.showReleaseNotesToast()
    await storage.setLastAppVersionInstalled(version)
  }, [])

  const onAuthorized = useCallback(() => {
    logJS('debug', 'useReleaseNotes', 'onAuthorized')
    showIfNeeded()
  }, [showIfNeeded])

  useEffect(() => {
    logJS('debug', 'useReleaseNotes', 'init')
    return appEventEmitter.on('onAuthorized', onAuthorized)
  }, [onAuthorized])

  return showIfNeeded
}

export default useReleaseNotes

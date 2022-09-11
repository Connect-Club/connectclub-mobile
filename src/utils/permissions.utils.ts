import {Platform} from 'react-native'
import {hasGms} from 'react-native-device-info'

import {AnalyticsSender} from '../Analytics'
import {logJS} from '../components/screens/room/modules/Logger'
import {messaging} from '../components/webSafeImports/webSafeImports'

export const hasNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'android' && !(await hasGms())) return true
  const authStatus = await messaging().hasPermission()
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  )
}

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'android') return true
  const authStatus = await messaging().requestPermission()
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  )
}

export const requestNotificationToken = async (
  analytics?: AnalyticsSender,
): Promise<string | undefined> => {
  try {
    if (Platform.OS === 'android' && !(await hasGms())) {
      logJS(
        'error',
        'Push notification token is not available. Device has no Google Mobile Services',
      )
      return
    }

    const hasPermissions = await hasNotificationPermissions()

    if (!hasPermissions) {
      analytics?.sendEvent('notifications_access_open')
      const enabled = await requestNotificationPermissions()

      if (!enabled) {
        analytics?.sendEvent('notifications_access_cancel')
        return undefined
      }
      analytics?.sendEvent('notifications_access_ok')
    }

    let tokenTimeout: number | null = setTimeout(() => {
      logJS('error', 'notification get token timeout')
      clearTimeout(tokenTimeout!)
      tokenTimeout = null
      return undefined
    }, 20 * 1000)

    return messaging()
      .getToken()
      .then((token) => {
        if (tokenTimeout) {
          clearTimeout(tokenTimeout)
        }
        return token
      })
  } catch (e) {
    logJS('error', 'Permission access:', JSON.stringify(e))
    analytics?.sendEvent('notifications_access_fail', {error: e})
    return undefined
  }
}

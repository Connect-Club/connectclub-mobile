import {Linking, Platform} from 'react-native'
import semver from 'semver-compare'

import {api} from '../api/api'
import {alert, getAppVersion} from '../components/webSafeImports/webSafeImports'

export const checkAppVersion = async (i18n: any, platform: string): Promise<boolean> => {
  const response = await api.fetchAppVersion(platform)
  if (response.error) return true
  const serverVersion = response.data.version
  const status = semver(serverVersion, getAppVersion())
  const link = Platform.select({
    ios: 'https://apps.apple.com/us/app/connect-club/id1500718006',
    android: 'market://details?id=com.connect.club',
    web: 'https://connect.club',
  })
  if (!link) return true
  if (status === 1) {
    alert(
      i18n.t('newAppVersionAlertTitle'),
      i18n.t('newAppVersionAlertMessage', {version: serverVersion}),
      [{text: 'Download', onPress: () => Linking.openURL(link)}],
      {cancelable: false},
    )
    return false
  }
  return true
}

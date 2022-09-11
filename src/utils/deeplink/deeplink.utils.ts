import {useCallback} from 'react'
import {Linking} from 'react-native'

import {logJS} from '../../components/screens/room/modules/Logger'
import {useAppsflyer} from '../useAppsflyer'

export function useOpenUrl() {
  const appsflyer = useAppsflyer()

  return useCallback(
    (url?: string) => {
      logJS('debug', 'open url', url)
      if (!url) return

      if (appsflyer.handleFlyerLinkInternal(url)) return

      logJS('debug', 'open url with linkin', url)

      Linking.canOpenURL(url).then((supported) => {
        if (
          supported ||
          url.startsWith('https://') ||
          url.startsWith('cnnctvp://')
        ) {
          Linking.openURL(url)
        }
      })
    },
    [appsflyer],
  )
}

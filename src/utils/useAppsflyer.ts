import {NavigationContainerRef} from '@react-navigation/native'
import {RefObject, useCallback} from 'react'
import {Platform} from 'react-native'
import appsFlyer, {
  ConversionData,
  UnifiedDeepLinkData,
} from 'react-native-appsflyer'

import {analytics} from '../Analytics'
import {api} from '../api/api'
import {logJS} from '../components/screens/room/modules/Logger'
import {storage} from '../storage'
import {
  getParameterValueFromUri,
  getUtmLabelsFromDeepLinkValue,
} from './stringHelpers'
import {useDeepLinkNavigation} from './useDeepLinkNaivgation'
import {useDisposables} from './useDisposables'

const recordInstallIfNeeded = async (utmCampaign?: string) => {
  logJS('debug', 'recordInstallIfNeeded()')
  if (storage.isDirtyInstallRegistered) {
    return logJS('debug', 'installation record already done')
  }
  logJS('debug', 'record install, utmCampaign:', utmCampaign)
  api.recordInstall(utmCampaign)
  storage.setIsDirtyInstallRegistered()
  analytics.sendEvent('dirty_first_install')
}

export const useAppsflyer = (
  navigationRef?: RefObject<NavigationContainerRef | undefined>,
) => {
  const disposables = useDisposables()
  const {handleDeepLink} = useDeepLinkNavigation(navigationRef)

  const handleAppsFlyerLinkData = useCallback(
    (data: Record<string, any>) => {
      logJS(
        'debug',
        'AppsFlyer',
        'got appsflyer data',
        ' params:',
        JSON.stringify(data),
      )
      const deepLinkValue: string = data.deep_link_value
      if (!deepLinkValue) {
        return
      }
      if (!storage.isFirstLaunch) {
        analytics.sendEvent('appsflyer_deeplink_open', {link: deepLinkValue})
      }
      const utmLabels = getUtmLabelsFromDeepLinkValue(data.deep_link_sub1)
      if (utmLabels) {
        analytics.setUtmLabels(utmLabels)
      }

      handleDeepLink(
        `connect-club.onelink.me?deep_link_value=${data.deep_link_value}`,
      )
    },
    [handleDeepLink],
  )

  const handleAppsFlyerLink = (res: UnifiedDeepLinkData) => {
    // fixed expected type from ConversionData to UnifiedDeepLinkData as per the originating call
    handleAppsFlyerLinkData(res.data)
  }

  const handleOnInstallConversionData = async (res: ConversionData) => {
    const isAppsFlyerLink =
      res.data?.deep_link_value?.length > 0 ||
      res.data?.deep_link_sub1?.length > 0
    if (!isAppsFlyerLink) {
      logJS('debug', 'AppsFlyer', 'consider non-appsflyer link')
      recordInstallIfNeeded()
      return
    }
    logJS('debug', 'AppsFlyer', 'consider appsflyer link', JSON.stringify(res))
    const utmLabels = getUtmLabelsFromDeepLinkValue(res.data.deep_link_sub1)
    if (!utmLabels) {
      logJS(
        'debug',
        'AppsFlyer',
        'looks like incorrect appsflyer link',
        JSON.stringify(res),
      )
      return
    }
    logJS('debug', 'AppsFlyer', 'landing device id', utmLabels.landingDeviceId)
    analytics.init(storage.currentUser, utmLabels.landingDeviceId).then(() => {
      analytics.setLandingDeviceIdIfNeeded(utmLabels.landingDeviceId)
    })
    logJS('debug', 'AppsFlyer', 'utm labels', utmLabels)
    recordInstallIfNeeded(utmLabels?.campaign)

    if (res.data.af_status === 'Non-organic') {
      logJS('info', 'AppsFlyer Non-Organic Install')
    } else if (res.data.af_status === 'Organic') {
      logJS('info', 'AppsFlyer Organic Install')
    }
    logJS('info', 'AppsFlyer utm campaign: ', utmLabels)
    if (utmLabels) {
      analytics.setUtmLabels(utmLabels)
      analytics.sendEvent(
        storage.isAuthorized
          ? 'appflyer_campaign_source_authorized'
          : 'appflyer_campaign_source_unauthorized',
      )
    }
    if (res.data.is_first_launch) {
      analytics.sendEvent('appsflyer_deeplink_install', {
        link: res.data?.deep_link_value,
      })
    }
  }

  const handleFlyerLinkInternal = useCallback(
    (url?: string): boolean => {
      logJS('debug', 'useAppsflyer', 'handleFlyerLinkInternal', url)
      if (!url) return false
      logJS('debug', 'useAppsflyer', 'check if has supported scheme')
      if (!url.startsWith('cnnctvp')) {
        if (!url.startsWith('https') || url.indexOf('app.connect.club') < 0) {
          logJS('debug', 'useAppsflyer', 'link is not internal')
          return false
        }
      }
      logJS('debug', 'useAppsflyer', 'consider internal link')
      const deepLinkValue = getParameterValueFromUri(url, 'deep_link_value')
      const deepLinkSub1 = getParameterValueFromUri(url, 'deep_link_value')
      if (!deepLinkValue || !deepLinkSub1) {
        logJS('debug', 'useAppsflyer', 'mandatory params are absent')
        return false
      }
      logJS('debug', 'useAppsflyer', 'has mandatory params, will handle link')
      handleAppsFlyerLinkData({
        deep_link_sub1: deepLinkSub1,
        deep_link_value: deepLinkValue,
      })
      return true
    },
    [handleAppsFlyerLinkData],
  )

  const init = () => {
    appsFlyer.initSdk(
      {
        devKey:
          Platform.OS === 'android'
            ? 'ZM2MvjDcqWY24VK8Psd6MC'
            : 'qiJSus6nWnY3UWiqDo8bgd',
        onDeepLinkListener: true,
        isDebug: true,
        appId: Platform.OS === 'android' ? 'com.connect.club' : '1500718006',
      },
      (result) => {
        logJS('debug', 'AppsFlyer init SDK', JSON.stringify(result))
      },
      (error) => {
        logJS('error', 'AppsFlyer init SDK:', JSON.stringify(error))
      },
    )

    disposables.add(
      appsFlyer.onInstallConversionData((res) => {
        logJS(
          'info',
          'AppsFlyer onInstallConversionData()',
          JSON.stringify(res),
        )
        try {
          handleOnInstallConversionData(res)
        } catch (err: any) {
          logJS('error', 'AppsFlyer onInstallConversionData:', err)
        }
      }),
    )

    disposables.add(
      appsFlyer.onDeepLink((res) => {
        logJS('debug', 'AppsFlyer direct deep link called', JSON.stringify(res))
        handleAppsFlyerLink(res)
      }),
    )
  }

  return {
    init: () => {
      logJS('debug', 'AppsFlyer init')
      init()
      logJS('debug', 'AppsFlyer init done')
    },
    handleFlyerLinkInternal,
  }
}

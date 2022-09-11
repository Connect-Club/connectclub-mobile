import {NavigationContainerRef} from '@react-navigation/native'
import {RefObject} from 'react'
// @ts-ignore
import branch, {BranchEvent} from 'react-native-branch'

import {analytics} from '../Analytics'
import {logJS} from '../components/screens/room/modules/Logger'
import {UtmLabels} from '../models'
import {storage} from '../storage'
import {getUtmLabelsFromUri} from './stringHelpers'
import {useDeepLinkNavigation} from './useDeepLinkNaivgation'
import {useDisposables} from './useDisposables'

export const useBranch = (
  navigationRef: RefObject<NavigationContainerRef | undefined>,
) => {
  const disposables = useDisposables()
  const {handleDeepLink} = useDeepLinkNavigation(navigationRef)

  const onBranchEvent = (event: BranchEvent) => {
    logJS('info', 'onBranchEvent', JSON.stringify(onBranchEvent))
    if (event.error) {
      logJS('error', 'error from Branch:', event.error)
      return
    }
    let labels: UtmLabels | undefined = {
      campaign: event.params.utm_campaign,
      source: event.params.utm_source,
      content: event.params.utm_content,
    }
    if (!labels.campaign && !labels.source && !labels.content) {
      labels = getUtmLabelsFromUri(event.uri)
    }
    if (labels) {
      analytics.setUtmLabels(labels)
      analytics.sendEvent(
        storage.isAuthorized
          ? 'branch_utm_source_authorized'
          : 'branch_utm_source_unauthorized',
      )
    }
    logJS(
      'debug',
      'got branch event, uri:',
      event.uri,
      'params:',
      JSON.stringify(event.params),
    )
    const landingDeviceId = event.params.landingAmplitudeDeviceId
    if (event.params.landingAmplitudeDeviceId) {
      logJS('debug', 'Branch got landing device id', landingDeviceId)
    }
    analytics.init(storage.currentUser, landingDeviceId).then(() => {
      analytics.setLandingDeviceIdIfNeeded(landingDeviceId)
    })
    const clickedBranchLink = event.params['+clicked_branch_link']

    if (clickedBranchLink === true) {
      logJS('debug', 'Branch: consider branch link')
      if (storage.isFirstLaunch && event.params['+is_first_session']) {
        analytics.sendEvent('branch_deeplink_install')
      } else if (event.uri) {
        analytics.sendEvent('branch_deeplink_open')
      }
    } else {
      logJS('debug', 'Branch: consider non-branch link')
    }

    if (event.params.room && event.params.pswd) {
      const params = {
        roomParams: {
          room: event.params.room,
          pswd: event.params.pswd,
          eventId: event.params.eventId,
        },
      }
      handleDeepLink(event.uri, params)
    } else if (event.params.clubId) {
      const params = {
        clubParams: {
          clubId: event.params.clubId,
        },
      }
      handleDeepLink(event.uri, params)
    }
  }

  return {
    init: () => {
      disposables.add(branch.subscribe(onBranchEvent))
      logJS('debug', 'subscribed to branch events')
    },
  }
}

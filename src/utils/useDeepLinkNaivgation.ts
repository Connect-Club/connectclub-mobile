import {NavigationContainerRef} from '@react-navigation/native'
import React, {RefObject, useCallback, useContext, useMemo} from 'react'

import {logJS} from '../components/screens/room/modules/Logger'
import {InitialDeeplink} from '../models'
import DeepLinkNavigationStore from '../stores/DeepLinkNavigationStore'
import {dispatchDeepLink} from './deeplink/dispatchDeepLink'

type NavigationHandler = {
  handleDeepLink: (link: string, params?: InitialDeeplink) => Promise<void>
  onMainNavigationReady: () => void
  onWelcomeNavigationReady: () => void
  reset: () => void
  getCurrentUrl: () => string | undefined
}

const context = React.createContext<DeepLinkNavigationStore>(
  new DeepLinkNavigationStore(),
)

export const useDeepLinkNavigation = (
  navigationRef?: RefObject<NavigationContainerRef | undefined>,
): NavigationHandler => {
  const store = useContext(context)

  if (navigationRef) {
    store.setNavigationRef(navigationRef)
  }

  const _reset = useCallback(() => {
    logJS('debug', 'useDeepLinkNavigation', 'reset store')
    store.reset()
  }, [store])

  const _handleDeepLink = useCallback(
    async (link: string, params: InitialDeeplink | undefined) => {
      logJS(
        'debug',
        'useDeepLinkNavigation',
        'handle',
        link,
        JSON.stringify(params),
      )
      store.setUrl(link, params)
      logJS('debug', 'useDeepLinkNavigation', 'dispatch deep link')
      await dispatchDeepLink(store)
    },
    [store],
  )

  const _onMainNavigationReady = useCallback(() => {
    if (store.isMainNavigationReady) {
      logJS(
        'debug',
        'useDeepLinkNavigation',
        'main navigation ready (already registered)',
        JSON.stringify(store.state),
      )
      return
    }
    logJS('debug', 'useDeepLinkNavigation', 'main navigation ready')
    store.setMainNavigationReady(true)
    if (store.isPostponed && store.url) {
      logJS('debug', 'useDeepLinkNavigation', 'run postponed dispatch deepLink')
      dispatchDeepLink(store)
      return
    }
  }, [store])

  const _onWelcomeNavigationReady = useCallback(() => {
    if (store.isWelcomeNavigationReady) {
      logJS(
        'debug',
        'useDeepLinkNavigation',
        'welcome navigation ready (already registered)',
        JSON.stringify(store.state),
      )
      return
    }
    logJS('debug', 'useDeepLinkNavigation', 'welcome navigation ready')
    store.setWelcomeNavigationReady(true)
    if (store.isPostponed && store.url) {
      logJS('debug', 'useDeepLinkNavigation', 'run postponed dispatch deepLink')
      dispatchDeepLink(store)
      return
    }
  }, [store])

  return useMemo(() => {
    return {
      getCurrentUrl: () => store.url,
      handleDeepLink: _handleDeepLink,
      onMainNavigationReady: _onMainNavigationReady,
      onWelcomeNavigationReady: _onWelcomeNavigationReady,
      reset: _reset,
    }
  }, [
    _handleDeepLink,
    _onMainNavigationReady,
    _onWelcomeNavigationReady,
    _reset,
    store.url,
  ])
}

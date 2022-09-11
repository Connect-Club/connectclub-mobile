/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import 'react-native-gesture-handler'

import BugsnagPluginReactNavigation from '@bugsnag/plugin-react-navigation'
import Bugsnag from '@bugsnag/react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  NavigationContainer,
  NavigationContainerRef,
} from '@react-navigation/native'
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack'
import {withWalletConnect} from '@walletconnect/react-native-dapp'
import React, {useEffect, useRef, useState} from 'react'
import {
  ActivityIndicator,
  AppState,
  AppStateStatus,
  Linking,
  LogBox,
  NativeModules,
  Platform,
  StatusBar,
  StyleSheet,
} from 'react-native'
import RNBootSplash from 'react-native-bootsplash'
import {gestureHandlerRootHOC} from 'react-native-gesture-handler'
import {NotifierRoot} from 'react-native-notifier'
import {SafeAreaProvider} from 'react-native-safe-area-view'

import {analytics} from './Analytics'
import {api} from './api/api'
import {appEventEmitter} from './appEventEmitter'
import buildConfig from './buildConfig'
import AppFullWindowLoading from './components/common/AppFullWindowLoading'
import AppProviders from './components/common/AppProviders'
import {setNavigationBarColor} from './components/common/DecorConfigModule'
import {
  intercomLoginUser,
  intercomLogoutUser,
  intercomRegisterUnidentifiedUser,
  setIntercomLauncherVisible,
} from './components/screens/room/modules/IntercomModule'
import {logJS} from './components/screens/room/modules/Logger'
import i18n from './i18n/index'
import {Unknown} from './models'
import {storage} from './storage'
import {PRIMARY_BACKGROUND, ThemeProvider} from './theme/appTheme'
import {AppNavigationTheme} from './theme/navigationTheme'
import {alertNoNetworkConnection} from './utils/alerts'
import {checkAppVersion} from './utils/checkAppVersion.utils'
import {initializeMomentLocale} from './utils/date.utils'
import {attachLogToBugsnag} from './utils/debug.utils'
import {getInitialScreen} from './utils/navigation.utils'
import {requestNotificationToken} from './utils/permissions.utils'
import {linkCode} from './utils/sms.utils'
import {getRoomParamsFromUri, getUtmLabelsFromUri} from './utils/stringHelpers'
import {useAppsflyer} from './utils/useAppsflyer'
import {useBranch} from './utils/useBranch'
import {useDeepLinkNavigation} from './utils/useDeepLinkNaivgation'

//TODO remove after fix
LogBox.ignoreLogs([
  '[mobx] Out of bounds read',
  'VirtualizedLists should never be nested inside plain ScrollViews',
  'RNReactNativeHapticFeedback is not available',
])

Bugsnag.start({
  plugins: [new BugsnagPluginReactNavigation()],
  onError: attachLogToBugsnag,
})
const ErrorBoundary = Bugsnag.getPlugin('react').createErrorBoundary(React)

// @ts-ignore
const {createNavigationContainer} = Bugsnag.getPlugin('reactNavigation')
const BugsnagNavigationContainer =
  createNavigationContainer(NavigationContainer)
const Stack = createStackNavigator()

const App: () => React.ReactNode = () => {
  const [isReady, setReady] = useState(false)
  const [isAuthorized, setAuthorized] = useState(false)
  const appState = useRef(AppState.currentState)
  const navigationRef = useRef<NavigationContainerRef>()
  const initialLink = useRef<string>('')
  const deepLinkNavigation = useDeepLinkNavigation(navigationRef)
  const branch = useBranch(navigationRef)
  const appsflyer = useAppsflyer(navigationRef)

  useEffect(() => {
    initialize()
    const navigateCleaner = appEventEmitter.once(
      'navigate',
      (screenName, params: any) => {
        console.log('====---', screenName, params)
        navigationRef.current?.navigate(screenName, params)
      },
    )

    const onAuthorized = async () => {
      await storage.setSMSVerified()
      await storage.setUserStateVerified()
      intercomLoginUser(storage.currentUser?.username!)
      setAuthorized(storage.isAuthorized)
    }
    const onUnAuthorized = async () => {
      initialLink.current = ''
      deepLinkNavigation.reset()
      api.logout()
      storage.logout()
      analytics.setUserId(null)
      intercomLogoutUser()
      setAuthorized(false)
    }

    const onUrl = (event: {url: string | Unknown}) => {
      if (!event.url) return
      initialLink.current = event.url
      logJS('debug', 'App got url:', event.url)
      if (event.url === 'cnnctVP://') return
      if (
        event.url.startsWith('cnnctvp://af?') ||
        event.url.startsWith('https://connect-club.onelink.me') ||
        event.url.startsWith('cnnctvp://cnnctvp')
      ) {
        // AppsFlyer iOS deep link workaround for urls opened with uri scheme or with universal link.
        // we have a handler registered in native code that executes both AppsFlyer link handling
        // and generic universal link or uri scheme
        return
      }
      if (event.url.indexOf(linkCode) > -1) {
        // appsflyer deep link will be handled from it's callback
        return
      }
      const params = getRoomParamsFromUri(event.url)
      const labels = getUtmLabelsFromUri(event.url)
      if (labels) {
        analytics.setUtmLabels(labels)
      }
      logJS(
        'debug',
        'App got url:',
        event.url,
        'withParams:',
        JSON.stringify(params),
      )
      deepLinkNavigation.handleDeepLink(event.url, params)
    }

    const onAppStateChange = (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (appState.current !== nextAppState) {
          analytics.sendEvent('app_foreground')
        }
        appEventEmitter.trigger('appInForeground')
      } else if (appState.current === 'active') {
        if (appState.current !== nextAppState) {
          analytics.sendEvent('app_background')
        }
        appEventEmitter.trigger('appInBackground')
      }
      appState.current = nextAppState
    }

    initializeLinking(onUrl)
    appEventEmitter.on('onAuthorized', onAuthorized)
    appEventEmitter.on('onUnAuthorized', onUnAuthorized)
    AppState.addEventListener('change', onAppStateChange)
    return () => {
      analytics.setUtmLabels()
      deepLinkNavigation.reset()
      navigateCleaner()
      AppState.removeEventListener('change', onAppStateChange)
      appEventEmitter.off('onAuthorized', onAuthorized)
      appEventEmitter.off('onUnAuthorized', onUnAuthorized)
      Linking.removeEventListener('url', onUrl)
      api.stop()
    }
  }, [])

  useEffect(() => {
    if (!isAuthorized) {
      intercomRegisterUnidentifiedUser()
    } else {
      setIntercomLauncherVisible(false)
    }
  }, [isAuthorized])

  const initializeLinking = async (
    onUrl: (event: {url: string | Unknown}) => void,
  ) => {
    try {
      const initialUrl = await Linking.getInitialURL()
      logJS('debug', 'initializeLinking with: ', initialUrl)
      if (initialUrl) onUrl({url: initialUrl})
    } catch (e) {
      logJS('error', 'initializeLinking:', JSON.stringify(e))
    }
    Linking.addEventListener('url', onUrl)
  }

  const initialize = async () => {
    logJS('debug', 'AppStart api start')
    initializeMomentLocale()
    NativeModules.AppInfoModule?.registerBuildFeatures(
      buildConfig.buildFeatures,
    )
    await api.start()
    logJS('debug', 'AppStart l18n start')
    await i18n.init()
    // toastHelper.init(i18n.t.bind(i18n))
    logJS('debug', 'AppStart storage prepare')
    await storage.restore()
    await storage.setIsFirstLaunch(false)
    await setNavigationBarColor(PRIMARY_BACKGROUND, true)
    branch.init()
    appsflyer.init()
    if (storage.isAuthorized) {
      analytics.init(storage.currentUser)
    }
    analytics.sendEvent('app_start', {authorized: storage.isAuthorized})
    const isAllow = await checkAppVersion(i18n, Platform.OS)
    if (storage.bugsnagReportId) {
      logJS('debug', 'send report log with uuid', storage.bugsnagReportId)
      // noinspection ES6MissingAwait
      api
        .sendPreservedLogFile(`id: ${storage.bugsnagReportId}`)
        .then((result) => {
          if (result) {
            logJS('debug', 'logs uploaded successfully')
            storage.setBugsnagReportId('')
          } else {
            logJS('debug', 'failed to upload logs')
          }
        })
    }
    if (!isAllow) return setReady(false)
    authorize()
  }

  const authorize = async () => {
    logJS('debug', 'Authorize start')
    const authorized = await api.isAuthorized()
    logJS('debug', 'Authorize isAuthorized', authorized)
    if (authorized) {
      const response = await api.current()
      logJS('debug', 'Authorize current ready')
      if (response.error) {
        if (response.error === 'unauthorized') {
          intercomLogoutUser()
          await storage.logout()
          setAuthorized(false)
          return setReady(true)
        } else {
          RNBootSplash.hide({fade: true})
          if (response.error === 'networkUnAvailable') {
            alertNoNetworkConnection(() => authorize())
            return
          }
          logJS(
            'error',
            `authorize error: ${response.code} error: ${response.error}`,
          )
          alertNoNetworkConnection(() => authorize())
          return
        }
      }
      await storage.saveUser(response.data!)
      if (storage.currentUser?.state === 'verified') {
        requestNotificationToken().then((token) => {
          api.sendDevice(token)
        })
      }
      if (storage.isAuthorized) {
        intercomLoginUser(storage.currentUser?.username!)
      }
      setAuthorized(storage.isAuthorized)
    }
    setReady(true)
    logJS('debug', 'app initialized')
  }

  useEffect(() => {
    if (isReady) {
      logJS('debug', 'App ready show initial screen')
      RNBootSplash.hide({fade: true})
    }
  }, [isReady])

  if (!isReady) {
    return (
      <ActivityIndicator
        style={[StyleSheet.absoluteFill]}
        animating={true}
        size={'small'}
        color={'rgba(77, 125, 208, 1)'}
      />
    )
  }

  const state = storage.currentUser?.state
  const initialScreen = getInitialScreen(state)
  logJS(
    'debug',
    'initial screen',
    initialScreen,
    'initial link',
    initialLink.current,
    'authorized?',
    isAuthorized,
  )

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppFullWindowLoading />
          <AppProviders>
            <BugsnagNavigationContainer
              ref={navigationRef}
              theme={AppNavigationTheme}>
              <Stack.Navigator
                initialRouteName={initialScreen}
                screenOptions={{
                  headerBackTitleVisible: false,
                  headerStyle: {elevation: 0},
                  ...TransitionPresets.SlideFromRightIOS,
                }}>
                {!isAuthorized && (
                  <Stack.Screen
                    name={'GuestScreenStack'}
                    options={{headerShown: false}}
                    initialParams={{
                      initialLink: initialLink.current,
                      initialRouteName: initialScreen,
                    }}
                    getComponent={() => require('./GuestScreenStack').default}
                  />
                )}
                {isAuthorized && (
                  <Stack.Screen
                    name={'MainFeedListScreen'}
                    options={{headerShown: false}}
                    initialParams={{initialLink: initialLink.current}}
                    getComponent={() =>
                      require('src/screens/MainFeedListScreen').default
                    }
                  />
                )}
              </Stack.Navigator>
            </BugsnagNavigationContainer>
          </AppProviders>
        </ThemeProvider>
        <NotifierRoot duration={4000} swipeEnabled={false} />
        <StatusBar
          barStyle='dark-content'
          translucent={true}
          backgroundColor={PRIMARY_BACKGROUND}
        />
      </SafeAreaProvider>
    </ErrorBoundary>
  )
}

// @ts-ignore
// export default gestureHandlerRootHOC(App)
// @ts-ignore
export default withWalletConnect(gestureHandlerRootHOC(App), {
  clientMeta: {
    name: 'Connect Club',
    icons: ['https://connect.club/apple-touch-icon.png'],
    url: 'https://connect.club',
    description: 'Connect with WalletConnect',
  },
  redirectUrl: 'cnnctVP://',
  storageOptions: {
    asyncStorage: AsyncStorage,
  },
})

import {LinkingOptions, NavigationContainer} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import React, {Suspense, useEffect, useRef, useState} from 'react'
import {SafeAreaView, StyleSheet, View} from 'react-native'
import {NotifierRoot} from 'react-native-notifier'
import {SafeAreaProvider} from 'react-native-safe-area-context'

import {api} from '../../src/api/api'

import AppFullWindowLoading from '../../src/components/common/AppFullWindowLoading'
import AppProviders from '../../src/components/common/AppProviders'
import AppText from '../../src/components/common/AppText'
import {AlertRoot} from '../../src/components/webSafeImports/alert/AlertWeb'

import {checkAppVersion} from '../../src/utils/checkAppVersion.utils'
import {initializeMomentLocale} from '../../src/utils/date.utils'
import {stackScreenConfigs} from '../../src/utils/navigation.utils'
import {getRoomParamsFromUri} from '../../src/utils/stringHelpers'
import {useDeepLinkNavigation} from '../../src/utils/useDeepLinkNaivgation'

import {appEventEmitter} from '../../src/appEventEmitter'
import i18n, {i18nInitialization} from '../../src/i18n'
import {storage} from '../../src/storage'
import {ThemeProvider} from '../../src/theme/appTheme'
import {AppNavigationTheme} from '../../src/theme/navigationTheme'

import electronChannel from './utils/ElectronChannel'

const CHECK_APP_VERSION_PLATFORM = 'desktop'

const Stack = createStackNavigator()

const App: React.FC = () => {
  const [isAuthorized, setAuthorized] = useState(false)
  const [isReady, setReady] = useState(false)
  const [isInitialized, setInitialized] = useState(false)
  const navigationRef = useRef<any>()
  const initialLink = useRef<string>('')
  const {handleDeepLink} = useDeepLinkNavigation(navigationRef)

  const onAuthorized = async () => {
    await storage.setSMSVerified()
    await storage.setUserStateVerified()
    setAuthorized(storage.isAuthorized)
  }

  const onUnAuthorized = async () => {
    await api.logout()
    await storage.logout()
    initialLink.current = ''
    setAuthorized(false)
  }

  const onOpenRoom = async (id: string, pass: string) => {
    navigationRef.current?.navigate('Room', {id, pass})
  }

  const handleDeepLinkInternal = (data: any) => {
    initialLink.current = data as string
    handleDeepLink(
      initialLink.current,
      getRoomParamsFromUri(initialLink.current),
    )
  }

  useEffect(() => {
    ;(async () => {
      initializeMomentLocale()
      await api.start()
      await i18nInitialization
      await storage.restore()

      setInitialized(true)
      const isAllow = await checkAppVersion(i18n, CHECK_APP_VERSION_PLATFORM)
      if (!isAllow) return setReady(false)

      await authorize()

      electronChannel.on('receivedDeeplink', handleDeepLinkInternal)
      appEventEmitter.on('onAuthorized', onAuthorized)
      appEventEmitter.on('onUnAuthorized', onUnAuthorized)
      appEventEmitter.on('openRoom', onOpenRoom)
      electronChannel.send('requestDeeplink')
    })()

    return () => {
      electronChannel.off('receivedDeeplink', handleDeepLinkInternal)
      appEventEmitter.off('onAuthorized', onAuthorized)
      appEventEmitter.off('onUnAuthorized', onUnAuthorized)
      appEventEmitter.off('openRoom', onOpenRoom)
      api.stop()
    }
  }, [])

  const authorize = async () => {
    const authorized = await api.isAuthorized()
    if (authorized) {
      const {data, error} = await api.current()
      if (error) {
        await storage.logout()
        setAuthorized(false)
        return setReady(true)
      }

      await storage.saveUser(data!)

      setAuthorized(storage.isAuthorized)
    }

    setReady(true)
  }

  const linking: LinkingOptions = {
    prefixes: [],
    config: {
      initialRouteName: isAuthorized ? 'Rooms' : 'WelcomeScreen',
      screens: {
        WelcomeScreen: 'welcome',
        EnterPhoneScreen: 'enter-phone',
        EnterPhoneCodeScreen: 'enter-phone-code',
        ChoosePhoneRegion: 'choose-region',
        Rooms: 'rooms',
        Room: 'room',
      },
    },
  }

  const renderUnauthorizedScreens = (): React.ReactNode => (
    <>
      <Stack.Screen
        name={'WelcomeScreen'}
        initialParams={{initialLink: initialLink.current}}
        getComponent={() => require('../../src/screens/WelcomeScreen').default}
      />
      <Stack.Screen
        name={'EnterPhoneScreen'}
        getComponent={() =>
          require('../../src/screens/EnterPhoneScreen').default
        }
      />
      <Stack.Screen
        name={'ChoosePhoneRegion'}
        getComponent={() =>
          require('../../src/screens/ChoosePhoneRegion').default
        }
      />
      <Stack.Screen
        name={'SuccessEnterCodeScreen'}
        getComponent={() =>
          require('../../src/screens/SuccessEnterCodeScreen').default
        }
      />
      <Stack.Screen
        name={'FullNameScreen'}
        getComponent={() => require('../../src/screens/FullNameScreen').default}
      />
      <Stack.Screen
        name={'PickUsernameScreen'}
        getComponent={() =>
          require('../../src/screens/PickUsernameScreen').default
        }
      />
      <Stack.Screen
        name={'RegistrationJoinedByScreen'}
        getComponent={() =>
          require('../../src/screens/RegistrationJoinedByScreen').default
        }
      />
      <Stack.Screen
        name={'PickAvatarScreen'}
        getComponent={() =>
          require('../../src/screens/PickAvatarScreen').default
        }
      />
      <Stack.Screen
        name={'RequestPermissionContactsScreen'}
        getComponent={() =>
          require('../../src/screens/RequestPermissionContactsScreen').default
        }
      />
      <Stack.Screen
        name={'MatchedContactsScreen'}
        getComponent={() =>
          require('../../src/screens/MatchedContactsScreen').default
        }
      />
      <Stack.Screen
        name={'RegistrationSelectInterestsScreen'}
        getComponent={() =>
          require('../../src/screens/RegistrationSelectInterestsScreen').default
        }
      />
      <Stack.Screen
        name={'FindPeopleScreen'}
        getComponent={() =>
          require('../../src/screens/FindPeopleScreen').default
        }
      />
      <Stack.Screen
        name={'RequestPermissionNotificationsScreen'}
        getComponent={() =>
          require('../../src/screens/RequestPermissionNotificationsScreen')
            .default
        }
      />
      <Stack.Screen
        name={'WelcomeSetBioScreen'}
        options={{title: '', ...stackScreenConfigs}}
        getComponent={() =>
          require('../../src/screens/WelcomeSetBioScreen').default
        }
      />
      <Stack.Screen
        name={'WaitingInviteScreen'}
        getComponent={() =>
          require('../../src/screens/WaitingInviteScreen').default
        }
      />
      <Stack.Screen
        name={'EnterPhoneCodeScreen'}
        getComponent={() =>
          require('../../src/screens/EnterPhoneCodeScreen').default
        }
      />
    </>
  )

  const renderAuthorizedScreens = (): React.ReactNode => (
    <>
      <Stack.Screen
        name='Rooms'
        getComponent={() =>
          require('../../src/screens/MainFeedListScreen').default
        }
      />
      <Stack.Screen
        name='Room'
        getComponent={() => require('./pages/RoomStack').default}
      />
    </>
  )

  const fallback = <AppText>Loading…</AppText>

  return (
    <SafeAreaView>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppProviders>
            <Suspense fallback={fallback}>
              <AppFullWindowLoading />

              {isReady && (
                <View style={styles.container}>
                  <NavigationContainer
                    ref={navigationRef}
                    linking={linking}
                    theme={AppNavigationTheme}
                    documentTitle={{
                      enabled: false,
                    }}
                    fallback={fallback}>
                    <Stack.Navigator
                      screenOptions={() => ({
                        headerShown: false,
                      })}>
                      {isAuthorized
                        ? renderAuthorizedScreens()
                        : renderUnauthorizedScreens()}
                    </Stack.Navigator>
                  </NavigationContainer>
                </View>
              )}
            </Suspense>
          </AppProviders>
        </ThemeProvider>

        <NotifierRoot duration={4000} swipeEnabled={false} />
        {isInitialized && <AlertRoot />}
      </SafeAreaProvider>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    height: '100vh',
  },
})

export default App

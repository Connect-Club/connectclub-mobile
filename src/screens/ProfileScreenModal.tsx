import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {observer} from 'mobx-react'
import React, {useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {Platform} from 'react-native'

import {appEventEmitter} from '../appEventEmitter'
import {logJS} from '../components/screens/room/modules/Logger'
import ProfileScreen from '../screens/ProfileScreen'
import {useTheme} from '../theme/appTheme'
import {baseNavigationScreenOptions} from '../theme/navigationTheme'
import {ms} from '../utils/layout.utils'
import {push} from '../utils/navigation.utils'
import {CommonModalScreenStack} from './CommonModalScreenStack'

interface ScreenProps {
  userId: string
  username: string
  navigationRoot?: string
  initialScreen?: string
}

type ScreenRouteProp = RouteProp<{Screen: ScreenProps}, 'Screen'>

const Stack = createStackNavigator()

const ProfileScreenModal: React.FC = () => {
  const {t} = useTranslation()
  const {params} = useRoute<ScreenRouteProp>()
  const {colors} = useTheme()
  const navigation = useNavigation()

  useEffect(() => {
    return appEventEmitter.on('showUserProfileInModal', (p) => {
      logJS(
        'debug',
        'ProfileScreenModal',
        'show user profile',
        p.userId,
        p.username,
        p.additionalProps,
      )
      push(navigation, 'ProfileScreen', {
        ...p.additionalProps,
        userId: p.userId,
        username: p.username,
        showCloseButton: false,
      })
    })
  }, [navigation])

  return (
    <Stack.Navigator
      initialRouteName={params.initialScreen}
      //@ts-ignore
      screenOptions={{
        ...baseNavigationScreenOptions(colors),
        headerStatusBarHeight: ms(10),
        headerTitleStyle: {lineHeight: ms(24)},
        ...Platform.select({
          web: {cardStyle: {backgroundColor: 'rgba(0, 0, 0, 0)'}},
        }),
      }}>
      <Stack.Screen
        name={'ProfileScreen'}
        component={observer(ProfileScreen)}
        options={{headerShown: false}}
        initialParams={{
          ...params,
          showCloseButton: true,
          navigationRoot: params?.navigationRoot,
        }}
      />
      <Stack.Screen
        name={'ProfileSettingsScreen'}
        options={{title: t('settingsScreenTitle')}}
        getComponent={() => require('./ProfileSettingsScreen').default}
        initialParams={{...params}}
      />
      {CommonModalScreenStack(Stack, t, params)}
    </Stack.Navigator>
  )
}

export default ProfileScreenModal

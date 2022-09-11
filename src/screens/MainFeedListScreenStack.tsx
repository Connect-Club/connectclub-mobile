import {createStackNavigator, TransitionPresets} from '@react-navigation/stack'
import React from 'react'
import {useTranslation} from 'react-i18next'

import {useTheme} from '../theme/appTheme'
import {baseNavigationScreenOptions} from '../theme/navigationTheme'
import {stackScreenConfigs} from '../utils/navigation.utils'

const Stack = createStackNavigator()

const MainFeedListScreenStack: React.FC = () => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  return (
    <>
      <Stack.Navigator
        mode={'modal'}
        screenOptions={baseNavigationScreenOptions(colors)}>
        <Stack.Screen
          name={'LocalMainFeedListScreen'}
          getComponent={() =>
            require('src/screens/MainFeedListScreen').LocalMainFeedListScreen
          }
          options={{title: '', headerShown: false}}
        />
        <Stack.Screen
          name={'ProfileScreenModal'}
          getComponent={() => require('src/screens/ProfileScreenModal').default}
          options={{
            ...TransitionPresets.ModalPresentationIOS,
            headerShown: false,
          }}
        />
        <Stack.Screen
          name={'StartRoomScreenModal'}
          getComponent={() =>
            require('../components/screens/startRoom/StartRoomScreenModal')
              .default
          }
          options={{
            ...TransitionPresets.ModalPresentationIOS,
            headerShown: false,
            cardStyle: {
              backgroundColor: 'rgb(10, 27, 75)',
            },
          }}
        />
        <Stack.Screen
          name={'UpcomingEventsScreen'}
          options={{headerShown: false, ...stackScreenConfigs}}
          getComponent={() =>
            require('src/screens/UpcomingEventsScreen').default
          }
        />
        <Stack.Screen
          name={'ActivityScreen'}
          options={{headerShown: false, ...stackScreenConfigs}}
          getComponent={() => require('src/screens/ActivityScreen').default}
        />
        <Stack.Screen
          name={'InvitesScreen'}
          options={{...stackScreenConfigs}}
          getComponent={() => require('src/screens/InvitesScreen').default}
        />
        <Stack.Screen
          name={'InvitesPendingScreen'}
          options={{...stackScreenConfigs}}
          getComponent={() =>
            require('src/screens/InvitesPendingScreen').default
          }
        />
        <Stack.Screen
          name={'CreateEventScreen'}
          options={{
            title: '',
            ...stackScreenConfigs,
            headerShown: false,
          }}
          getComponent={() => require('src/screens/CreateEventScreen').default}
        />
        <Stack.Screen
          name={'LanguageSelectorScreenModal'}
          options={{
            title: t('yourLanguageTitle'),
            ...TransitionPresets.ModalPresentationIOS,
            headerShown: false,
          }}
          getComponent={() =>
            require('src/screens/LanguageSelectorScreenModal').default
          }
        />
        <Stack.Screen
          name={'LanguageSelectorScreen'}
          options={{
            title: t('languageSelectorTitle'),
            ...stackScreenConfigs,
          }}
          getComponent={() =>
            require('src/screens/LanguageSelectorScreen').default
          }
        />
        <Stack.Screen
          name={'MyNetworkScreen'}
          options={{
            headerShown: false,
          }}
          getComponent={() => require('src/screens/MyNetworkScreen').default}
        />
        <Stack.Screen
          name={'ExploreScreen'}
          options={{
            headerShown: false,
            ...stackScreenConfigs,
          }}
          getComponent={() => require('src/screens/ExploreScreen').default}
        />
        <Stack.Screen
          name={'ClubScreen'}
          options={{
            ...TransitionPresets.ModalPresentationIOS,
            headerShown: false,
          }}
          initialParams={{withCustomToolbar: true, isModal: true}}
          getComponent={() => require('src/screens/ClubScreenModal').default}
        />
      </Stack.Navigator>
    </>
  )
}

export default MainFeedListScreenStack

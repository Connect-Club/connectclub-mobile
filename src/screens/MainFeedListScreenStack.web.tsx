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
            require('./MainFeedListScreen').LocalMainFeedListScreen
          }
          options={{title: '', headerShown: false}}
        />
        <Stack.Screen
          name={'ProfileScreenModal'}
          getComponent={() => require('./ProfileScreenModal').default}
          options={{
            ...TransitionPresets.ModalPresentationIOS,
            headerShown: false,
            cardStyle: {
              backgroundColor: 'transparent',
            },
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
              backgroundColor: 'rgba(77, 125, 208, 1)',
            },
          }}
        />
        <Stack.Screen
          name={'UpcomingEventsScreen'}
          options={{headerShown: false, ...stackScreenConfigs}}
          getComponent={() => require('./UpcomingEventsScreen').default}
        />
        <Stack.Screen
          name={'ActivityScreen'}
          options={{headerShown: false, ...stackScreenConfigs}}
          getComponent={() => require('./ActivityScreen').default}
        />
        <Stack.Screen
          name={'InvitesScreen'}
          options={{...stackScreenConfigs}}
          getComponent={() => require('./InvitesScreen').default}
        />
        <Stack.Screen
          name={'InvitesPendingScreen'}
          options={{...stackScreenConfigs}}
          getComponent={() => require('./InvitesPendingScreen').default}
        />
        <Stack.Screen
          name={'CreateEventScreen'}
          options={{
            title: '',
            ...stackScreenConfigs,
            headerShown: false,
          }}
          getComponent={() => require('./CreateEventScreen').default}
        />
        <Stack.Screen
          name={'LanguageSelectorScreen'}
          options={{
            title: t('languageSelectorTitle'),
            ...stackScreenConfigs,
          }}
          getComponent={() => require('./LanguageSelectorScreen').default}
        />
        <Stack.Screen
          name={'MyNetworkScreen'}
          options={{
            title: '',
            ...stackScreenConfigs,
            headerShown: false,
          }}
          getComponent={() => require('./MyNetworkScreen').default}
        />
        <Stack.Screen
          name={'ClubScreen'}
          options={{
            ...stackScreenConfigs,
            headerShown: false,
          }}
          initialParams={{withCustomToolbar: true}}
          getComponent={() => require('./ClubScreen').default}
        />
        <Stack.Screen
          name={'ClubMembersScreen'}
          options={{
            title: t('clubMembersTitle'),
            ...stackScreenConfigs,
          }}
          getComponent={() => require('./ClubMembersScreen').default}
        />
      </Stack.Navigator>
    </>
  )
}

export default MainFeedListScreenStack

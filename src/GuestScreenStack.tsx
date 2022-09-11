import {RouteProp, useRoute} from '@react-navigation/native'
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack'
import React, {memo} from 'react'

import {InitialLinkProp} from './models'
import {stackScreenConfigs} from './utils/navigation.utils'

const Stack = createStackNavigator()

type Params = {
  initialRouteName: string
} & InitialLinkProp

type ScreenRouteProp = RouteProp<{Screen: Params}, 'Screen'>

const GuestScreenStack: React.FC = () => {
  const {params} = useRoute<ScreenRouteProp>()

  return (
    <Stack.Navigator
      initialRouteName={params.initialRouteName}
      screenOptions={{
        headerBackTitleVisible: false,
        headerStyle: {elevation: 0},
        ...TransitionPresets.SlideFromRightIOS,
      }}>
      <Stack.Screen
        name={'WelcomeScreen'}
        options={{headerShown: false, ...stackScreenConfigs}}
        initialParams={{initialLink: params.initialLink}}
        getComponent={() => require('src/screens/WelcomeScreen').default}
      />
      <Stack.Screen
        name={'EnterPhoneScreen'}
        options={{
          title: '',
          ...stackScreenConfigs,
        }}
        getComponent={() => require('src/screens/EnterPhoneScreen').default}
      />
      <Stack.Screen
        name={'ChoosePhoneRegion'}
        options={{
          title: '',
          ...stackScreenConfigs,
        }}
        getComponent={() => require('src/screens/ChoosePhoneRegion').default}
      />
      <Stack.Screen
        name={'SuccessEnterCodeScreen'}
        options={{title: '', ...stackScreenConfigs}}
        getComponent={() =>
          require('src/screens/SuccessEnterCodeScreen').default
        }
      />
      <Stack.Screen
        name={'FullNameScreen'}
        options={{title: '', ...stackScreenConfigs}}
        getComponent={() => require('src/screens/FullNameScreen').default}
      />
      <Stack.Screen
        name={'PickUsernameScreen'}
        options={{title: '', ...stackScreenConfigs}}
        initialParams={{initialLink: params.initialLink}}
        getComponent={() => require('src/screens/PickUsernameScreen').default}
      />
      <Stack.Screen
        name={'ExploreClubsScreen'}
        options={{
          title: '',
          headerShown: false,
          ...stackScreenConfigs,
        }}
        initialParams={{initialLink: params.initialLink}}
        getComponent={() => require('src/screens/ExploreClubsScreen').default}
      />
      <Stack.Screen
        name={'RegistrationJoinedByScreen'}
        options={{headerShown: false, ...stackScreenConfigs}}
        initialParams={{initialLink: params.initialLink}}
        getComponent={() =>
          require('src/screens/RegistrationJoinedByScreen').default
        }
      />
      <Stack.Screen
        name={'PickAvatarScreen'}
        options={{title: '', ...stackScreenConfigs}}
        getComponent={() => require('src/screens/PickAvatarScreen').default}
      />
      <Stack.Screen
        name={'WelcomeSetBioScreen'}
        options={{title: '', ...stackScreenConfigs}}
        getComponent={() => require('src/screens/WelcomeSetBioScreen').default}
      />
      <Stack.Screen
        name={'RequestPermissionContactsScreen'}
        options={{title: '', ...stackScreenConfigs}}
        getComponent={() =>
          require('src/screens/RequestPermissionContactsScreen').default
        }
      />
      <Stack.Screen
        name={'MatchedContactsScreen'}
        options={{title: '', ...stackScreenConfigs}}
        getComponent={() =>
          require('src/screens/MatchedContactsScreen').default
        }
      />
      {/*<Stack.Screen*/}
      {/*  name={'RegistrationIndustriesSkillsGoalsScreen'}*/}
      {/*  options={{title: '', ...stackScreenConfigs}}*/}
      {/*  getComponent={() =>*/}
      {/*    require('./screens/RegistrationIndustriesSkillsGoalsScreen')*/}
      {/*      .default*/}
      {/*  }*/}
      {/*/>*/}
      {/*<Stack.Screen*/}
      {/*  name={'RegistrationSelectSkillsScreen'}*/}
      {/*  options={{*/}
      {/*    ...baseNavigationScreenOptions(colors),*/}
      {/*    headerStatusBarHeight: ms(10),*/}
      {/*    headerTitleStyle: {lineHeight: ms(24)},*/}
      {/*    ...TransitionPresets.ModalPresentationIOS,*/}
      {/*    headerShown: false,*/}
      {/*  }}*/}
      {/*  getComponent={() =>*/}
      {/*    require('src/screens/RegistrationSelectSkillsScreen')*/}
      {/*      .default*/}
      {/*  }*/}
      {/*/>*/}
      {/*<Stack.Screen*/}
      {/*  name={'SettingsSelectIndustriesScreen'}*/}
      {/*  options={{*/}
      {/*    ...baseNavigationScreenOptions(colors),*/}
      {/*    headerStatusBarHeight: ms(10),*/}
      {/*    headerTitleStyle: {lineHeight: ms(24)},*/}
      {/*    ...TransitionPresets.ModalPresentationIOS,*/}
      {/*    headerShown: false,*/}
      {/*  }}*/}
      {/*  getComponent={() =>*/}
      {/*    require('src/screens/SettingsSelectIndustriesScreen')*/}
      {/*      .default*/}
      {/*  }*/}
      {/*/>*/}
      {/*<Stack.Screen*/}
      {/*  name={'SettingsSelectGoalsScreen'}*/}
      {/*  options={{*/}
      {/*    ...baseNavigationScreenOptions(colors),*/}
      {/*    headerStatusBarHeight: ms(10),*/}
      {/*    headerTitleStyle: {lineHeight: ms(24)},*/}
      {/*    ...TransitionPresets.ModalPresentationIOS,*/}
      {/*    headerShown: false,*/}
      {/*  }}*/}
      {/*  getComponent={() =>*/}
      {/*    require('src/screens/SettingsSelectGoalsScreen').default*/}
      {/*  }*/}
      {/*/>*/}
      {/* commented out for now. need to decide if general interests should be still requested */}
      <Stack.Screen
        name={'RegistrationSelectInterestsScreen'}
        options={{title: '', ...stackScreenConfigs}}
        getComponent={() =>
          require('src/screens/RegistrationSelectInterestsScreen').default
        }
      />
      <Stack.Screen
        name={'FindPeopleScreen'}
        options={{title: '', ...stackScreenConfigs}}
        getComponent={() => require('src/screens/FindPeopleScreen').default}
      />
      <Stack.Screen
        name={'RequestPermissionNotificationsScreen'}
        options={{headerShown: false, ...stackScreenConfigs}}
        getComponent={() =>
          require('src/screens/RequestPermissionNotificationsScreen').default
        }
      />
      <Stack.Screen
        name={'WaitingInviteScreen'}
        options={{headerShown: false, ...stackScreenConfigs}}
        getComponent={() => require('src/screens/WaitingInviteScreen').default}
        initialParams={{initialLink: params.initialLink}}
      />
      <Stack.Screen
        name={'EnterPhoneCodeScreen'}
        options={{title: '', ...stackScreenConfigs}}
        getComponent={() => require('src/screens/EnterPhoneCodeScreen').default}
      />
    </Stack.Navigator>
  )
}

export default memo(GuestScreenStack)

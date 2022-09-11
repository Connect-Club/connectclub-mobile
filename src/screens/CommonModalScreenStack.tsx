import {TFunction} from 'i18next'
import React from 'react'

import {isNative} from '../utils/device.utils'
import {stackScreenConfigs} from '../utils/navigation.utils'

export const CommonModalScreenStack = (
  Stack: any,
  t: TFunction,
  params: any,
) => {
  return (
    <>
      <Stack.Screen
        name={'FollowersScreen'}
        getComponent={() => require('./FollowersScreen').default}
        options={{headerShown: isNative}}
      />
      <Stack.Screen
        name={'FollowingScreen'}
        getComponent={() => require('./FollowingScreen').default}
        options={{headerShown: isNative}}
      />
      <Stack.Screen
        name={'LanguageSelectorScreen'}
        options={{
          title: t('yourLanguageTitle'),
          ...stackScreenConfigs,
        }}
        getComponent={() => require('./LanguageSelectorScreen').default}
      />
      <Stack.Screen
        name={'ProfileReportScreen'}
        getComponent={() => require('./ProfileReportScreen').default}
      />
      <Stack.Screen
        name={'SettingsSelectInterestsScreen'}
        getComponent={() => require('./SettingsSelectInterestsScreen').default}
      />
      <Stack.Screen
        name={'SettingsSelectSkillsScreen'}
        getComponent={() =>
          require('src/screens/SettingsSelectSkillsScreen').default
        }
      />
      <Stack.Screen
        name={'SettingsSelectIndustriesScreen'}
        getComponent={() =>
          require('src/screens/SettingsSelectIndustriesScreen').default
        }
      />
      <Stack.Screen
        name={'SettingsSelectGoalsScreen'}
        getComponent={() =>
          require('src/screens/SettingsSelectGoalsScreen').default
        }
      />
      <Stack.Screen
        name={'MutualFollowsScreen'}
        getComponent={() => require('./MutualFollowsScreen').default}
      />
      <Stack.Screen
        name={'UpdateProfileBioScreenInModal'}
        options={{
          gestureEnabled: true,
          ...stackScreenConfigs,
        }}
        getComponent={() => require('./UpdateProfileBioScreen').default}
      />
      <Stack.Screen
        name={'ClubScreen'}
        options={{
          ...stackScreenConfigs,
          headerShown: false,
        }}
        getComponent={() => require('../screens/ClubScreen').default}
        initialParams={{...params, withCustomToolbar: true}}
      />
      <Stack.Screen
        name={'ClubMembersScreen'}
        initialParams={params}
        options={{
          title: t('clubMembersTitle'),
          ...stackScreenConfigs,
          headerShown: false,
        }}
        getComponent={() => require('../screens/ClubMembersScreen').default}
      />
      <Stack.Screen
        name={'CreateEventScreen'}
        initialParams={params}
        options={{
          ...stackScreenConfigs,
          headerShown: false,
        }}
        getComponent={() => require('../screens/CreateEventScreen').default}
      />
      <Stack.Screen
        getComponent={() => require('../screens/AddPeopleToClubScreen').default}
        name={'AddPeopleToClubScreen'}
        initialParams={params}
        options={{
          ...stackScreenConfigs,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name={'SelectClubInterestsScreen'}
        getComponent={() =>
          require('src/screens/SelectClubInterestsScreen').default
        }
        options={{
          ...stackScreenConfigs,
          headerShown: false,
        }}
      />
      <Stack.Screen
        getComponent={() =>
          require('src/screens/EditClubSettingScreen').default
        }
        name={'EditClubSettingScreen'}
        options={{
          ...stackScreenConfigs,
          headerShown: false,
        }}
      />
      <Stack.Screen
        name='CreateClubScreen'
        options={{
          headerShown: false,
        }}
        getComponent={() => require('./CreateClubScreen').default}
      />
      <Stack.Screen
        name='ClubListScreen'
        options={{
          headerShown: false,
        }}
        getComponent={() => require('./ClubListScreen').default}
      />
      <Stack.Screen
        name={'ExploreScreen'}
        options={{
          headerShown: false,
        }}
        getComponent={() => require('./ExploreScreen').default}
      />
    </>
  )
}

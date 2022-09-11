import {useRoute} from '@react-navigation/native'
import {createStackNavigator} from '@react-navigation/stack'
import {observer} from 'mobx-react'
import React from 'react'
import {useTranslation} from 'react-i18next'

import {ScreenRouteProp} from './ClubScreen'
import {CommonModalScreenStack} from './CommonModalScreenStack'
import ProfileScreen from './ProfileScreen'

const Stack = createStackNavigator()

const ClubScreenModal: React.FC = () => {
  const {t} = useTranslation()
  const {params} = useRoute<ScreenRouteProp>()
  const initialScreen = params.initialScreen ?? 'ClubScreen'
  return (
    <Stack.Navigator initialRouteName={initialScreen}>
      {CommonModalScreenStack(Stack, t, params)}
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
    </Stack.Navigator>
  )
}

export default ClubScreenModal

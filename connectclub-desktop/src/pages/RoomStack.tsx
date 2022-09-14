import {useRoute} from '@react-navigation/native'
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack'
import React from 'react'

import {stackScreenConfigs} from '../../../src/utils/navigation.utils'

import {useTheme} from '../../../src/theme/appTheme'
import {baseNavigationScreenOptions} from '../../../src/theme/navigationTheme'

import RoomPage from './RoomPage'

const Stack = createStackNavigator()

const RoomStack: React.FC = () => {
  const {params} = useRoute<any>()
  const {colors} = useTheme()

  return (
    <Stack.Navigator
      mode={'modal'}
      screenOptions={baseNavigationScreenOptions(colors)}>
      <Stack.Screen
        name={'RoomScreen'}
        component={RoomPage}
        initialParams={params}
        options={{...stackScreenConfigs, headerShown: false}}
      />

      <Stack.Screen
        name={'ProfileScreenModal'}
        getComponent={() =>
          require('../../../src/screens/ProfileScreenModal').default
        }
        initialParams={{...params, navigationRoot: 'RoomScreen'}}
        options={{
          ...TransitionPresets.ModalPresentationIOS,
          headerShown: false,
          cardStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
    </Stack.Navigator>
  )
}

export default RoomStack

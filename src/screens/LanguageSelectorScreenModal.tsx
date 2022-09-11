import {RouteProp, useRoute} from '@react-navigation/native'
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack'
import React from 'react'

import {useTheme} from '../theme/appTheme'
import {baseNavigationScreenOptions} from '../theme/navigationTheme'
import {LanguageSelectorScreenProps} from './LanguageSelectorScreen'

type ScreenRouteProp = RouteProp<
  {Screen: LanguageSelectorScreenProps},
  'Screen'
>

const Stack = createStackNavigator()

const LanguageSelectorScreenModal: React.FC = () => {
  const {params} = useRoute<ScreenRouteProp>()
  const {colors} = useTheme()

  return (
    <Stack.Navigator
      mode={'modal'}
      screenOptions={{
        ...baseNavigationScreenOptions(colors),
      }}>
      <Stack.Screen
        name={'LanguageSelectorScreen'}
        getComponent={() => require('./LanguageSelectorScreen').default}
        options={{headerShown: false}}
        initialParams={{
          ...params,
          showCloseButton: true,
          withCustomToolbar: true,
          ...TransitionPresets.ModalPresentationIOS,
        }}
      />
    </Stack.Navigator>
  )
}

export default LanguageSelectorScreenModal

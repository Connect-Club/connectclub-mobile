import {DefaultTheme} from '@react-navigation/native'
import {TransitionPresets} from '@react-navigation/stack'

import {stackScreenConfigs} from '../utils/navigation.utils'
import {PRIMARY_BACKGROUND} from './appTheme'

export const AppNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: PRIMARY_BACKGROUND,
    primary: '#538EF4',
    notification: 'red',
    card: PRIMARY_BACKGROUND,
    border: 'transparent',
    elevation: 0,
    shadowColor: 'transparent',
  },
}

export const baseNavigationScreenOptions = (colors: any): any => ({
  headerBackTitleVisible: false,
  headerStyle: {elevation: 0},
  gestureEnabled: true,
  cardOverlayEnabled: true,
  cardStyle: {
    backgroundColor: colors.systemBackground,
  },
  ...TransitionPresets.SlideFromRightIOS,
  ...stackScreenConfigs,
})

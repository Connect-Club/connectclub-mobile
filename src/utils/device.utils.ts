import {Platform} from 'react-native'
import {isTablet as isTabletDevice} from 'react-native-device-info'

export const isTablet = (): boolean => isTabletDevice()
export const isWeb = Platform.OS === 'web'
export const isNative = Platform.OS !== 'web'
export const isWebOrTablet = (): boolean => isWeb || isTablet()

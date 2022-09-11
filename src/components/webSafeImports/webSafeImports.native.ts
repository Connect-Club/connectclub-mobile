/**
 * React-native dependencies are reexported in this component. It is used only
 * in react-native environment and provides native dependencies used in the
 * mobile app.
 */

import {KeyboardAwareScrollView} from '@codler/react-native-keyboard-aware-scroll-view'
import WheelPickerView from '@dzhey/react-native-wheel-picker'
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet'
import Clipboard from '@react-native-community/clipboard'
import messaging from '@react-native-firebase/messaging'
import LottieView from 'lottie-react-native'
import {
  Alert,
  AlertButton,
  AlertOptions,
  Image,
  NativeModules,
} from 'react-native'
import {Amplitude} from 'react-native-amplitude'
import {Identify} from 'react-native-amplitude'
import {checkNetwork} from 'react-native-check-network'
import DatePicker from 'react-native-date-picker'
import {getVersion} from 'react-native-device-info'
import FastImage from 'react-native-fast-image'
import {PanGestureHandler} from 'react-native-gesture-handler'
import ReactNativeHapticFeedback from 'react-native-haptic-feedback'
// @ts-ignore
import KeyboardSpacer from 'react-native-keyboard-spacer'
import LinearGradient from 'react-native-linear-gradient'
import {openSettings} from 'react-native-permissions'
import prompt from 'react-native-prompt-android'
import Animated, {useAnimatedGestureHandler} from 'react-native-reanimated'
import {Sms} from 'react-native-sms-android'

import cameraUtils from '../../utils/camera.utils'
import contactsUtils from '../../utils/contacts.utils'
import {
  presentIntercom,
  presentIntercomCarousel,
} from '../screens/room/modules/IntercomModule'
import MenuTextInput from '../screens/room/nativeview/RTCMenuTextInput'
import RasterIconNative from '../screens/room/nativeview/RTCRastIconView'
import TargetPathView from '../screens/room/nativeview/RTCTargetPathView'
import AppModalNative from './AppModalNative'

const nativeHttpClient = NativeModules.HttpClient

export const getAppVersion = (): string => getVersion()

export const alert = (
  title: string,
  message?: string,
  buttons?: AlertButton[],
  options?: AlertOptions,
): void => {
  Alert.alert(title, message, buttons, options)
}

// available in reanimated 2.2.0 (for mobile native)
export type ReanimatedStyleProp<T> = Animated.AnimatedStyleProp<T>
export type ReanimatedWithTimingConfig = Animated.WithTimingConfig

if (WheelPickerView === undefined) {
  console.error('WheelPickerView is not defined')
}

export {
  messaging,
  nativeHttpClient,
  checkNetwork,
  Amplitude,
  Identify,
  Clipboard,
  KeyboardAwareScrollView,
  Sms,
  FastImage,
  RasterIconNative,
  LinearGradient,
  BottomSheet,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetFlatList,
  prompt,
  MenuTextInput,
  DatePicker,
  KeyboardSpacer,
  WheelPickerView as Picker,
  openSettings,
  presentIntercomCarousel,
  presentIntercom,
  cameraUtils,
  contactsUtils,
  AppModalNative as AppModal,
  Image,
  LottieView,
  TargetPathView,
  ReactNativeHapticFeedback,
  useAnimatedGestureHandler,
  PanGestureHandler,
}

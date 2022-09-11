import {AlertButton, AlertOptions} from 'react-native'
import {PromptOptions} from 'react-native-prompt-android'
import {AnimatedStyleProp, WithTimingConfig} from 'react-native-reanimated'

import {ContactModel} from '../../models'
import {logJS} from '../screens/room/modules/Logger'
import AlertWeb from './alert/AlertWeb'
import AppModalWeb from './AppModalWeb'
import BottomSheetBackdropWeb from './bottom-sheet/BottomSheetBackdropWeb'
import BottomSheetFlatListWeb from './bottom-sheet/BottomSheetFlatListWeb'
import BottomSheetModalWeb from './bottom-sheet/BottomSheetModalWeb'
import BottomSheetViewWeb from './bottom-sheet/BottomSheetViewWeb'
import BottomSheetWeb from './bottom-sheet/BottomSheetWeb'
import DatePickerWeb from './DatePickerWeb'
import FastImageWeb from './FastImageWeb'
import KeyboardAwareScrollViewWeb from './KeyboardAwareScrollViewWeb'
import KeyboardSpacerWeb from './KeyboardSpacerWeb'
import LinearGradientWeb from './LinearGradientWeb'
import LottieViewWeb from './LottieViewWeb'
import MenuTextInputWeb from './MenuTextInputWeb'
import PanGestureHandlerWeb from './PanGestureHandlerWeb'
import PickerWeb from './PickerWeb'
import RasterIconNativeWeb from './RasterIconNativeWeb'
import TargetPathViewWeb from './TargetPathViewWeb'

/**
 * Collection of mock implementations for native components which are available only in
 * native mobile context. It is required to enable reuse of components from mobile app
 * in the ConnectClub desktop app while keeping changes to mobile codebase to a minimum.
 *
 * In the code of the react-native app the dependencies are imported using:
 *
 * import {something} from 'relative/path/webSafeImports'
 *
 * The webSafeImports.ts is imported in the web environment. In the react-native environment
 * the webSafeImports.native.ts is used. This file contains mock or web-compatible implementations.
 */

// Define global __DEV__ for web context
declare var global: any
global.__DEV__ = __DEV__

// @react-native-firebase/messaging
export const messaging = () => {
  return {
    hasPermission: () => undefined,
    requestPermission: () => undefined,
    getToken: async (): Promise<string | undefined> => undefined,
    getInitialNotification: (): Promise<any> =>
      new Promise((resolve) => resolve(undefined)),
    setBackgroundMessageHandler: (handler: (message: any) => Promise<any>) =>
      undefined,
    onMessage: (listener: (message: any) => any) => undefined,
    onNotificationOpenedApp: (listener: (message: any) => any) => undefined,
  }
}
messaging.AuthorizationStatus = {
  AUTHORIZED: undefined,
  PROVISIONAL: undefined,
}

//todo: write useful network checking
class DefaultCheckNetwork {
  isReachable = (): Promise<boolean> => {
    return new Promise((resolve) => resolve(true))
  }

  startListen = (listener: (isReachable: {isReachable: boolean}) => void) => {
    //listener({isReachable: true})
  }

  stopListen = () => {}
}

// react-native-check-network
export const checkNetwork = new DefaultCheckNetwork()

// react-native
export const nativeHttpClient = global.nativeHttpClientInstance

export class Identify {
  set(key: string, value: unknown): void {}
}

// @amplitude/react-native
export const Amplitude = {
  getInstance: () => {
    return {
      init: (apiKey: string) => {},
      trackingSessionEvents: (flag: boolean) => {},
      logEvent: (event: any, props: any) => {},
      getSessionId: async () => {
        return 0
      },
      getDeviceId: async () => {
        return ''
      },
      setMinTimeBetweenSessionsMillis: async (millis: number) => {
        return
      },
      useRandomDeviceId: async () => {
        return
      },
      setUserId: async (
        userId: string | null,
        startNewSession: boolean = false,
      ) => {
        return true
      },
      identify: async (_: Identify) => {
        return true
      },
    }
  },
}

// react-native-haptic-feedback
export const ReactNativeHapticFeedback = {
  trigger: (type: string, options: any) => {},
}

// @react-native-community/clipboard
export const Clipboard = {
  getString: (): Promise<string> => {
    return Promise.resolve('')
  },
  setString: (value: string) => {
    const fallbackCopyTextToClipboard = (text: string) => {
      const textArea = document.createElement('textarea')
      textArea.value = text

      // Avoid scrolling to bottom
      textArea.style.top = '0'
      textArea.style.left = '0'
      textArea.style.position = 'fixed'

      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()

      try {
        const successful = document.execCommand('copy')
        const msg = successful ? 'successful' : 'unsuccessful'
        logJS('debug', 'Fallback: Copying text command was ' + msg)
      } catch (err) {
        logJS('warning', 'Fallback: Unable to copy', err)
      }

      document.body.removeChild(textArea)
    }

    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(value)
      return
    }

    navigator.clipboard.writeText(value).then(
      () => logJS('debug', 'Async: Copying to clipboard was successful!'),
      (err: any) => logJS('warning', 'Async: Could not copy text: ', err),
    )
  },
}

// react-native-sms-android
export const Sms = {
  sms: (phone: string, body: string) => {},
}

export const prompt = (
  title?: string,
  message?: string,
  callbackOrButtons?: (value: string) => void,
  options?: PromptOptions,
): void => {
  AlertWeb.alert(title ?? '', message, undefined, undefined, {
    options,
    onTextSubmit: (text: string) => callbackOrButtons?.(text),
  })
}

export const alert = (
  title: string,
  message?: string,
  buttons?: AlertButton[],
  options?: AlertOptions,
): void => {
  AlertWeb.alert(title, message, buttons, options)
}

export const openSettings = (): void => {}

export const presentIntercomCarousel = (): void => {}

export const presentIntercom = (): void => {}

export const getAppVersion = (): string => {
  // @ts-ignore
  // eslint-disable-next-line no-undef
  return VERSION
}

export const cameraUtils = {
  pickImageFromLibrary: async (): Promise<string | null> => {
    return Promise.resolve(null)
  },
  takePhotoFromCamera: async (): Promise<string | null> => {
    return Promise.resolve(null)
  },
}

export const contactsUtils = {
  checkContactsPermissions: async (): Promise<boolean> => {
    return Promise.resolve(false)
  },

  requestContactsPermissions: async (): Promise<
    'authorized' | 'denied' | 'never_ask_again'
  > => {
    return Promise.resolve('never_ask_again')
  },

  fetchContactsFromPhone: async (
    force: boolean,
  ): Promise<Array<ContactModel>> => {
    return []
  },
}

export const Image = {
  resolveAssetSource: (source: string): any => {
    return {uri: source}
  },
}

export function useAnimatedGestureHandler(handlers: any, deps?: any): any {}

// available in reanimated 2.3.0 (for desktop)
export type ReanimatedStyleProp<T> = AnimatedStyleProp<T>
export type ReanimatedWithTimingConfig = WithTimingConfig

export {
  // react-native-keyboard-aware-scroll-view
  KeyboardAwareScrollViewWeb as KeyboardAwareScrollView,
  // react-native-fast-image
  FastImageWeb as FastImage,
  RasterIconNativeWeb as RasterIconNative,
  // react-native-linear-gradient
  LinearGradientWeb as LinearGradient,
  BottomSheetWeb as BottomSheet,
  BottomSheetViewWeb as BottomSheetView,
  BottomSheetBackdropWeb as BottomSheetBackdrop,
  BottomSheetModalWeb as BottomSheetModal,
  BottomSheetFlatListWeb as BottomSheetFlatList,
  MenuTextInputWeb as MenuTextInput,
  DatePickerWeb as DatePicker,
  KeyboardSpacerWeb as KeyboardSpacer,
  PickerWeb as Picker,
  AppModalWeb as AppModal,
  LottieViewWeb as LottieView,
  TargetPathViewWeb as TargetPathView,
  PanGestureHandlerWeb as PanGestureHandler,
}

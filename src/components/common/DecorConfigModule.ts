import {NativeModules, Platform} from 'react-native'

export type KeyboardMode = 'overlay' | 'resize'
export const {AndroidDecorConfig} = NativeModules
const IS_ANDROID = Platform.OS === 'android'

export const setNavigationBarColor = (color: String, light: Boolean) => {
  if (IS_ANDROID) {
    AndroidDecorConfig.setNavigationBarColor(color, light)
  }
}

export const showNavigationBar = (light: boolean) => {
  if (IS_ANDROID) {
    AndroidDecorConfig.showNavigationBar(light)
  }
}

export const hideNavigationBar = () => {
  if (IS_ANDROID) {
    AndroidDecorConfig.hideNavigationBar()
  }
}

export const setNoLimitsFlag = (noLimits: boolean) => {
  if (IS_ANDROID) {
    AndroidDecorConfig.setNoLimitsFlag(noLimits)
  }
}

export const setKeyboardMode = (mode: KeyboardMode) => {
  if (IS_ANDROID) {
    AndroidDecorConfig.setSoftInputMode(mode)
  }
}

export const clearWindowFocus = () => {
  if (IS_ANDROID) {
    AndroidDecorConfig.clearWindowFocus()
  }
}

export const resetKeyboardMode = () => setKeyboardMode('resize')

import React, {forwardRef, memo, PropsWithChildren} from 'react'
import {Platform, TouchableOpacity, TouchableOpacityProps} from 'react-native'

import {logJS} from '../screens/room/modules/Logger'
import {ReactNativeHapticFeedback} from '../webSafeImports/webSafeImports'

interface Props
  extends Omit<
    TouchableOpacityProps,
    'onPress' | 'accessibilityLabel' | 'activeOpacity'
  > {
  readonly accessibilityLabel?: string
  readonly onPress?: () => void
  readonly activeOpacity?: number
  readonly nativeID?: string
  readonly shouldVibrateOnClick?: boolean
}

const AppTouchableOpacity = forwardRef<
  TouchableOpacity,
  PropsWithChildren<Props>
>((props, ref) => {
  const proxyOnPress = () => {
    if (!props.onPress) return
    if (props.shouldVibrateOnClick && Platform.OS !== 'android') {
      ReactNativeHapticFeedback.trigger('impactMedium', {
        enableVibrateFallback: false,
        ignoreAndroidSystemSettings: true,
      })
    }
    props.onPress?.()
    logJS('info', 'pressed with label:', props.accessibilityLabel)
  }

  return (
    <TouchableOpacity
      ref={ref}
      {...props}
      onPress={proxyOnPress}
      activeOpacity={1}>
      {props.children}
    </TouchableOpacity>
  )
})

export default memo(AppTouchableOpacity)

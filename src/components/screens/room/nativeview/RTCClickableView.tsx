import React from 'react'
import {
  Platform,
  requireNativeComponent,
  StyleProp,
  ViewProps,
  ViewStyle,
} from 'react-native'

import {ReactNativeHapticFeedback} from '../../../webSafeImports/webSafeImports'
import {logJS} from '../modules/Logger'

const config = {
  enableVibrateFallback: false,
  ignoreAndroidSystemSettings: true,
}

interface NativeProps {
  readonly style?: StyleProp<ViewStyle>
  readonly onClick?: () => void
  readonly shouldVibrateOnClick?: boolean
}

const RTCClickableView = requireNativeComponent<typeof ClickableView>(
  'ClickableView',
)

type RTCClickableViewProps = ViewProps & NativeProps

const ClickableView: React.FC<RTCClickableViewProps> = (props) => {
  const proxyOnClick = () => {
    if (!props.onClick) return
    if (props.shouldVibrateOnClick && Platform.OS !== 'android') {
      ReactNativeHapticFeedback.trigger('impactMedium', config)
    }
    props.onClick?.()
    logJS('info', 'pressed with label:', props.accessibilityLabel)
  }

  return (
    <RTCClickableView
      {...props}
      //@ts-ignore
      onClick={proxyOnClick}
    />
  )
}

export default ClickableView

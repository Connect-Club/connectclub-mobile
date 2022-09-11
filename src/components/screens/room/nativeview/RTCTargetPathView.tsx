import React from 'react'
import {
  requireNativeComponent,
  StyleProp,
  ViewProps,
  ViewStyle,
} from 'react-native'

interface NativeProps {
  readonly style?: StyleProp<ViewStyle>
}

const RTCTargetPathView = requireNativeComponent<typeof TargetPathView>(
  'TargetPathView',
)

type RTCTargetPathViewProps = ViewProps & NativeProps

const TargetPathView: React.FC<RTCTargetPathViewProps> = (props) => {
  return <RTCTargetPathView {...props} />
}

export default TargetPathView

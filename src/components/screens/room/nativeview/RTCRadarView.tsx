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

const RTCRadarView = requireNativeComponent<typeof RadarView>('RadarView')

type RTCRadarViewProps = ViewProps & NativeProps

const RadarView: React.FC<RTCRadarViewProps> = (props) => {
  return <RTCRadarView {...props} />
}

export default RadarView

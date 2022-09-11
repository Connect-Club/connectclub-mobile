import React from 'react'
import {StyleProp, ViewProps, ViewStyle} from 'react-native'

import AppTouchableOpacity from '../../../common/AppTouchableOpacity'

interface NativeProps {
  readonly style?: StyleProp<ViewStyle>
  readonly onClick?: () => void
  readonly shouldVibrateOnClick?: boolean
}

type RTCClickableViewProps = ViewProps & NativeProps

const ClickableView: React.FC<RTCClickableViewProps> = (props) => {
  return <AppTouchableOpacity {...props} onPress={props.onClick} />
}

export default ClickableView

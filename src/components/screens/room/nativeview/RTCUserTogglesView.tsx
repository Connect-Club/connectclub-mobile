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

const RTCUserTogglesView = requireNativeComponent<typeof UserTogglesViewNative>(
  'UserTogglesView',
)

type RTCUserTogglesViewProps = ViewProps & NativeProps

const UserTogglesViewNative: React.FC<RTCUserTogglesViewProps> = (props) => {
  return <RTCUserTogglesView {...props} />
}

export default UserTogglesViewNative

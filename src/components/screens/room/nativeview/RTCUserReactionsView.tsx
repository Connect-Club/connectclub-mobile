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

const RTCUserReactionsView = requireNativeComponent<
  typeof UserReactionsViewNative
>('UserReactionsView')

type RTCUserReactionsViewProps = ViewProps & NativeProps

const UserReactionsViewNative: React.FC<RTCUserReactionsViewProps> = (
  props,
) => {
  return <RTCUserReactionsView {...props} />
}

export default UserReactionsViewNative

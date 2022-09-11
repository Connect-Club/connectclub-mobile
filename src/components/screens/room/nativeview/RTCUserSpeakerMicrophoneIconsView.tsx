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

const RTCUserSpeakerMicrophoneIconsView = requireNativeComponent<
  typeof UserSpeakerMicrophoneIconsViewNative
>('UserSpeakerMicrophoneIconsView')

type RTCUserSpeakerMicrophoneIconsViewProps = ViewProps & NativeProps

const UserSpeakerMicrophoneIconsViewNative: React.FC<RTCUserSpeakerMicrophoneIconsViewProps> = (
  props,
) => {
  return <RTCUserSpeakerMicrophoneIconsView {...props} />
}

export default UserSpeakerMicrophoneIconsViewNative

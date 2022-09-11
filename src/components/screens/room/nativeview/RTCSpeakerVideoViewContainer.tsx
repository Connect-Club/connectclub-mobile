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

const RTCSpeakerVideoViewContainer = requireNativeComponent<
  typeof SpeakerVideoViewContainer
>('SpeakerVideoViewContainer')

type RTCSpeakerVideoViewContainerProps = ViewProps & NativeProps

export const SpeakerVideoViewContainer: React.FC<RTCSpeakerVideoViewContainerProps> = (
  props,
) => {
  return (
    <RTCSpeakerVideoViewContainer
      accessibilityLabel='speaker-video-view-container'
      pointerEvents={'none'}
      {...props}
    />
  )
}

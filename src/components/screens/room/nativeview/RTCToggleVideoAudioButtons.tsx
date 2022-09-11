import React, {forwardRef, ReactNode} from 'react'
import {
  requireNativeComponent,
  StyleProp,
  ViewProps,
  ViewStyle,
} from 'react-native'

interface NativeProps {
  readonly style?: StyleProp<ViewStyle>
  readonly micOnIcon: string
  readonly micOffIcon: string
  readonly cameraOnIcon: string
  readonly cameraOffIcon: string
  readonly progressColor: string
  readonly children?: ReactNode
}

const RTCToggleVideoAudioButtons = requireNativeComponent<
  typeof ToggleVideoAudioButtonsNative
>('ToggleVideoAudioButtons')

type RTCToggleVideoAudioButtonsProps = ViewProps & NativeProps
export interface ToggleVideoAudioButtonsViewRef {}
const ToggleVideoAudioButtonsNative = forwardRef<
  ToggleVideoAudioButtonsViewRef,
  RTCToggleVideoAudioButtonsProps
>((props, ref) => {
  //@ts-ignore
  return <RTCToggleVideoAudioButtons ref={ref} {...props} />
})

export default ToggleVideoAudioButtonsNative

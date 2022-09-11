import React from 'react'
import {
  requireNativeComponent,
  StyleProp,
  ViewProps,
  ViewStyle,
} from 'react-native'

import {BottomSheetUserEvent} from '../../../../models'

interface NativeProps {
  readonly style?: StyleProp<ViewStyle>
  readonly userId: string
  readonly onClick?: (event: BottomSheetUserEvent) => void
}

const RTCSpeakerView = requireNativeComponent<typeof SpeakerView>('SpeakerView')

type RTCSpeakerViewProps = ViewProps & NativeProps

const SpeakerView: React.FC<RTCSpeakerViewProps> = (props) => {
  const onClick = (event: BottomSheetUserEvent) => props.onClick?.(event)

  return (
    <RTCSpeakerView
      accessibilityLabel='speaker-view'
      {...props}
      //@ts-ignore
      onClick={onClick}
    />
  )
}

export default SpeakerView

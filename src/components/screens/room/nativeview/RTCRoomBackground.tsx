import React from 'react'
import {requireNativeComponent, ViewProps} from 'react-native'

interface NativeProps {
  imageSource?: string | null
  bgSize?: string | null
  readonly onBackgroundLoaded?: () => void
}

const RNCRoomBackground = requireNativeComponent<typeof RoomBackgroundView>(
  'RNCRoomBackground',
)

type RoomBackgroundViewProps = ViewProps & NativeProps

const RoomBackgroundView: React.FC<RoomBackgroundViewProps> = (props) => {
  return <RNCRoomBackground {...props} />
}

export default RoomBackgroundView

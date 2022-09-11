import React from 'react'
import {requireNativeComponent, ViewProps} from 'react-native'

interface Options {
  readonly width: number
  readonly height: number
  readonly multiplier: number
  readonly minZoom: number
  readonly maxZoom: number
}

interface NativeProps {
  options: Options
}

const RNCRoomLayout = requireNativeComponent<typeof RoomLayoutView>(
  'RNCRoomLayout',
)

type RoomLayoutViewProps = ViewProps & NativeProps
export type LocationClickEvent = {
  x: number
  y: number
}

const RoomLayoutView: React.FC<RoomLayoutViewProps> = (props) => {
  return <RNCRoomLayout {...props} />
}

export default RoomLayoutView

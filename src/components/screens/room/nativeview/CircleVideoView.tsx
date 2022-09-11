import React from 'react'
import {requireNativeComponent} from 'react-native'

interface NativeProps {
  trackId?: string
  isMirror?: boolean
  width: number
  height: number
  zIndex: number
}

const RNCCircleSurfaceVideoView = requireNativeComponent<
  typeof CircleVideoView
>('RNCTextureVideoView')

type CircleVideoViewProps = NativeProps

const CircleVideoView: React.FC<CircleVideoViewProps> = (props) => {
  const style = {
    width: props.width,
    height: props.height,
    zIndex: props.zIndex,
  }

  return (
    <RNCCircleSurfaceVideoView
      {...props}
      // @ts-ignore
      pointerEvents={'none'}
      style={style}
    />
  )
}

export default CircleVideoView

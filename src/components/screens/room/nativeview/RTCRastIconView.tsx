import React, {memo} from 'react'
import {
  Image,
  ImageStyle,
  requireNativeComponent,
  StyleProp,
  ViewProps
} from 'react-native'

import {RasterIconType, requireRasterIcon} from '../../../../assets/rasterIcons'

export interface RasterIconNativeProps {
  readonly style?: StyleProp<ImageStyle>
  readonly type: RasterIconType
  readonly circle?: boolean
  readonly scaleType?: 'centerInside' | 'fitCenter'
  readonly paddingHorizontal?: number
  readonly accessibilityLabel?: string
}

const RTCRasterIcon = requireNativeComponent<typeof RasterIconNative>(
  'RasterIcon',
)

type RTCRasterIconProps = ViewProps & RasterIconNativeProps
const uriCache = new Map<string, string>()

const RasterIconNative: React.FC<RTCRasterIconProps> = (props) => {
  if (uriCache.has(props.type)) {
    // @ts-ignore
    return <RTCRasterIcon {...props} uri={uriCache.get(props.type)} />
  }
  const path = requireRasterIcon(props.type)

  const uri = Image.resolveAssetSource(path).uri
  uriCache.set(props.type, uri)
  // @ts-ignore
  return <RTCRasterIcon {...props} uri={uri} />
}

export default memo(RasterIconNative)

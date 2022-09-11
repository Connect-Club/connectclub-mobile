import React from 'react'
import {Image} from 'react-native'

import {requireRasterIcon} from '../../assets/rasterIcons'
import {RasterIconNativeProps} from '../screens/room/nativeview/RTCRastIconView'

const uriCache = new Map<string, string>()

const RasterIconNativeWeb: React.FC<RasterIconNativeProps> = (props) => {
  const {type} = props

  const renderImage = (uri: string) => {
    return <Image style={props.style} source={{uri}} />
  }

  if (uriCache.has(type)) {
    return renderImage(uriCache.get(type)!)
  }

  const path = requireRasterIcon(props.type)

  uriCache.set(type, path)

  return renderImage(path)
}

export default RasterIconNativeWeb

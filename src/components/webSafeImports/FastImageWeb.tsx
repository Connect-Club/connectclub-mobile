import React from 'react'
import {Image, ImageSourcePropType, ImageStyle, StyleProp} from 'react-native'

export interface Props {
  source: ImageSourcePropType & {
    priority?: 'low' | 'normal' | 'high'
  }
  style?: StyleProp<ImageStyle>
}

const FastImageWeb: React.FC<Props> = ({source, style}) => {
  return <Image source={source} style={style} />
}

export default FastImageWeb

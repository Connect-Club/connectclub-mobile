import React, {memo, useCallback, useMemo, useState} from 'react'
import {
  Image,
  ImageLoadEventData,
  ImageProps,
  ImageStyle,
  NativeSyntheticEvent,
  Platform,
  StyleProp,
} from 'react-native'

import {maxWidth} from '../../../utils/layout.utils'

const screenWidth = maxWidth()

const AspectImageView: React.FC<ImageProps> = (props) => {
  const [height, setHeight] = useState(-1)

  if (Platform.OS === 'web') {
    return <Image {...props} />
  }

  const style: StyleProp<ImageStyle> = useMemo(
    () => ({
      width: screenWidth,
      height: height === -1 ? 1 : height,
      opacity: height > 1 ? 1 : 0,
    }),
    [height],
  )

  const onLoad = useCallback((e: NativeSyntheticEvent<ImageLoadEventData>) => {
    const {width, height} = e.nativeEvent.source
    const aspect = (screenWidth * height) / width
    setHeight(aspect)
  }, [])

  return <Image {...props} style={[style, props.style]} onLoad={onLoad} />
}

export default memo(AspectImageView)

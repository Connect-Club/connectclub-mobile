import React from 'react'
import {StyleProp, View, ViewStyle} from 'react-native'

const Horizontal: React.FC<{style?: StyleProp<ViewStyle>}> = ({
  children,
  style,
}) => {
  let allStyles: StyleProp<ViewStyle> = [{flexDirection: 'row'}]
  if (style !== undefined) allStyles = [allStyles[0], style]

  return <View style={allStyles}>{children}</View>
}

export default Horizontal

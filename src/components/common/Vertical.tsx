import React from 'react'
import {LayoutChangeEvent, StyleProp, View, ViewStyle} from 'react-native'

interface Props {
  style?: StyleProp<ViewStyle>
  onLayout?: (event: LayoutChangeEvent) => void
}

const Vertical: React.FC<Props> = ({children, style, onLayout}) => {
  let allStyles: StyleProp<ViewStyle> = [{flexDirection: 'column'}]
  if (style !== undefined) allStyles = [allStyles[0], style]

  return (
    <View onLayout={onLayout} style={allStyles}>
      {children}
    </View>
  )
}

export default Vertical

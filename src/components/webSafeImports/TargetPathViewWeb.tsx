import React from 'react'
import {StyleProp, View, ViewStyle} from 'react-native'

interface Props {
  readonly style?: StyleProp<ViewStyle>
}

const TargetPathViewWeb: React.FC<Props> = ({style, children}) => {
  return <View style={style}>{children}</View>
}

export default TargetPathViewWeb

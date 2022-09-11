import React from 'react'
import {View, ViewProps} from 'react-native'

interface Props extends ViewProps {
  colors: (string | number)[]
  locations?: number[]
}

const LinearGradientWeb: React.FC<Props> = ({children}) => {
  return <View>{children}</View>
}

export default LinearGradientWeb

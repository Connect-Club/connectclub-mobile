import React, {memo} from 'react'
import {View} from 'react-native'

interface Props {
  readonly vertical?: number
  readonly horizontal?: number
}

const Spacer: React.FC<Props> = ({vertical, horizontal}) => {
  return <View style={{width: horizontal, height: vertical}} />
}

export default memo(Spacer)

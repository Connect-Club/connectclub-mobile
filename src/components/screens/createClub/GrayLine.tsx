import React from 'react'
import {StyleSheet, View} from 'react-native'

import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'

const GrayLine: React.FC = () => {
  const {colors} = useTheme()

  return (
    <View style={[styles.grayLine, {backgroundColor: colors.secondaryIcon}]} />
  )
}

const styles = StyleSheet.create({
  grayLine: {
    height: ms(1),
    opacity: 0.08,
  },
})

export default GrayLine

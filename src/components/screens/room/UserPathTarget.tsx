import React, {memo} from 'react'
import {Platform, StyleProp, StyleSheet, View, ViewStyle} from 'react-native'

import {TargetPathView} from '../../../components/webSafeImports/webSafeImports'

interface Props {
  readonly size: number
  readonly zIndex: number
}

const UserPathTarget: React.FC<Props> = ({size, zIndex}) => {
  const targetStyle: StyleProp<ViewStyle> = {
    width: size,
    height: size,
    borderRadius: size / 2,
    zIndex,
  }
  const pointSize = size * 0.08
  const pointStyle = {
    width: pointSize,
    height: pointSize,
    borderRadius: pointSize / 2,
  }

  return (
    <TargetPathView
      style={[styles.target, targetStyle, {borderWidth: size / 50}]}>
      <View style={[styles.point, pointStyle]} />
    </TargetPathView>
  )
}

export default memo(UserPathTarget)

const styles = StyleSheet.create({
  target: {
    position: 'absolute',
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        pointerEvents: 'none',
      },
    }),
  },
  point: {
    backgroundColor: 'white',
  },
})

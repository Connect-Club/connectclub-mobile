import React, {memo, useMemo} from 'react'
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native'

import RasterIcon from '../../../assets/RasterIcon'
import {RasterIconType} from '../../../assets/rasterIcons'

interface Props {
  readonly parentSize: number
  readonly scale: number
  readonly absoluteSize?: number
  readonly offset?: number
  readonly zIndex?: number
  readonly icon: RasterIconType
  readonly style?: StyleProp<ViewStyle>
}

const UserBadgeView: React.FC<Props> = (props) => {
  const size = props.absoluteSize
    ? props.absoluteSize
    : props.parentSize * props.scale
  const start = props.offset
    ? props.offset
    : props.parentSize - props.parentSize * 0.15

  const style: StyleProp<ViewStyle> = useMemo(
    () => [
      styles.badge,
      {
        width: size,
        height: size,
        start: start,
        zIndex: props.zIndex,
        overflow: 'hidden',
        borderRadius: size / 2,
      },
    ],
    [props.zIndex, size, start],
  )

  return (
    <View style={[style, props.style]} accessibilityLabel={'UserBadgeView'}>
      <RasterIcon
        circle
        type={props.icon}
        style={{width: size, height: size}}
        scaleType={'fitCenter'}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: 'white',
    position: 'absolute',
    overflow: 'hidden',
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default memo(UserBadgeView)

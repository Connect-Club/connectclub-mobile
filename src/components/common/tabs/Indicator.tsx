import React, {forwardRef, memo, useCallback, useImperativeHandle} from 'react'
import {ImageStyle, StyleSheet, ViewStyle} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'

import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {ReanimatedStyleProp} from '../../webSafeImports/webSafeImports'
import {Measurement} from './models'

const INDICATOR_HEIGHT = 2

export interface IndicatorRef {
  readonly onPagerScroll: (page: number, offset: number) => void
}

interface Props {
  readonly measurements: Array<Measurement>
}

const Indicator = forwardRef<IndicatorRef, Props>(({measurements}, ref) => {
  const {colors} = useTheme()
  const widthSharedValue = useSharedValue(0)
  const leftSharedValue = useSharedValue(0)
  const animatedStyle = useAnimatedStyle(
    (): ReanimatedStyleProp<ViewStyle | ImageStyle> => ({
      width: widthSharedValue.value,
      transform: [{translateX: leftSharedValue.value}],
    }),
  )
  const onPagerScroll = useCallback(
    (page: number, offset: number) => {
      const current = measurements[page]
      if (current) {
        const next = offset > 0 ? measurements[page + 1] ?? current : current
        const xFrom = current.x
        const wFrom = current.width
        widthSharedValue.value = wFrom + (next.width - wFrom) * offset
        leftSharedValue.value = xFrom + (next.x - xFrom) * offset
      }
    },
    [measurements],
  )

  useImperativeHandle(
    ref,
    () => ({
      onPagerScroll: onPagerScroll,
    }),
    [onPagerScroll],
  )

  return (
    <Animated.View
      style={[
        styles.indicator,
        {backgroundColor: colors.primaryClickable},
        animatedStyle,
      ]}
    />
  )
})

export default memo(Indicator)

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    height: ms(INDICATOR_HEIGHT),
    bottom: 0,
  },
})

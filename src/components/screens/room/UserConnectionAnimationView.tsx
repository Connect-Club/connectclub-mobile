import React, {memo} from 'react'
import {StyleSheet, View} from 'react-native'
import Animated from 'react-native-reanimated'

import RasterIcon from '../../../assets/RasterIcon'
import {ms} from '../../../utils/layout.utils'
import {useSimpleRippleAnimation} from '../../../utils/reanimated.utils'

interface Props {
  readonly iconHidden: boolean
  readonly borderWidth: number
  readonly parentSize: number
  readonly rippleInterval?: number
  readonly initialDelay?: number
  readonly pointerEvents?: 'none'
}

const overlayOpacity = 0.54

const UserConnectionAnimationView: React.FC<Props> = ({
  iconHidden,
  borderWidth,
  parentSize,
  pointerEvents,
}) => {
  const viewRatio = (parentSize - borderWidth * 2) / 80
  const adaptedParentSize = 80 * viewRatio
  const adaptedIconSize = ms(24 * viewRatio)
  const parentSizeStyle = {width: adaptedParentSize, height: adaptedParentSize}
  const viewSizeStyle = {width: adaptedParentSize, height: adaptedParentSize}
  const iconStyle = {width: adaptedIconSize, height: adaptedIconSize}
  const rippleStyle = useSimpleRippleAnimation(overlayOpacity)
  return (
    <View pointerEvents={pointerEvents} style={[styles.base, parentSizeStyle]}>
      <View style={[styles.overlay, parentSizeStyle]} />
      <Animated.View
        style={[styles.animatedView, viewSizeStyle, rippleStyle]}
      />
      {!iconHidden && (
        <RasterIcon
          type={'icBadConnection'}
          style={iconStyle}
          paddingHorizontal={0}
          scaleType={'fitCenter'}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: ms(1000),
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'black',
    opacity: overlayOpacity,
    borderRadius: ms(1000),
  },
  animatedView: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
    opacity: overlayOpacity,
    borderRadius: ms(1000),
  },
})

export default memo(UserConnectionAnimationView)

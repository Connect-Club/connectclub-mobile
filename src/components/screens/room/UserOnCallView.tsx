import {observer} from 'mobx-react'
import React from 'react'
import {StyleSheet, View} from 'react-native'
import Animated from 'react-native-reanimated'

import RasterIcon from '../../../assets/RasterIcon'
import {ms} from '../../../utils/layout.utils'
import {useSimpleRippleAnimation} from '../../../utils/reanimated.utils'

interface Props {
  readonly parentSize: number
  readonly borderWidth: number
  readonly scale: number
}

const overlayOpacity = 0.23

const UserOnCallView: React.FC<Props> = (props) => {
  const viewRatio = (props.parentSize - props.borderWidth * 2) / 80
  const adaptedParentSize = 80 * viewRatio
  const iconSize = 24 * viewRatio
  const parentSizeStyle = {width: adaptedParentSize, height: adaptedParentSize}
  const centerViewStyle = {width: adaptedParentSize, height: adaptedParentSize}
  const iconSizeStyle = {width: ms(iconSize), height: ms(iconSize)}
  const rippleStyle = useSimpleRippleAnimation(overlayOpacity)
  return (
    <View style={[styles.callingView, centerViewStyle]}>
      <View style={[styles.overlay, parentSizeStyle]} />
      <Animated.View
        style={[styles.animatedView, centerViewStyle, rippleStyle]}
      />
      <RasterIcon
        style={iconSizeStyle}
        type={'icCalling'}
        scaleType={'fitCenter'}
      />
    </View>
  )
}

export default observer(UserOnCallView)

const styles = StyleSheet.create({
  callingView: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: ms(1000),
  },
  overlay: {
    position: 'absolute',
    backgroundColor: 'black',
    opacity: 0.54,
    borderRadius: ms(1000),
  },
  animatedView: {
    position: 'absolute',
    backgroundColor: 'white',
    opacity: overlayOpacity,
    borderRadius: ms(1000),
  },
})

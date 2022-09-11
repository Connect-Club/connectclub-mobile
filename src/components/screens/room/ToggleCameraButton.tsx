import React, {memo, useCallback} from 'react'
import {StyleSheet, View} from 'react-native'
import Animated from 'react-native-reanimated'

import {analytics} from '../../../Analytics'
import AppIcon from '../../../assets/AppIcon'
import AppTouchableOpacity from '../../../components/common/AppTouchableOpacity'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {useRotateAnimation} from '../../../utils/reanimated.utils'

const rotateAnimationConfig = {
  degrees: 180,
  duration: 500,
}

interface Props {
  readonly onPress?: () => void
  readonly roomId?: string
  readonly eventId?: string
}

const ToggleCameraButton: React.FC<Props> = ({onPress, roomId, eventId}) => {
  const {colors} = useTheme()

  const Component = onPress ? AppTouchableOpacity : View
  const rotateAnimation = useRotateAnimation(rotateAnimationConfig)

  const onPressCallback = useCallback(() => {
    analytics.sendEvent('click_toggle_camera_button', {roomId, eventId})
    rotateAnimation.start()
    onPress?.()
  }, [onPress])

  return (
    <Component
      style={[
        styles.button,
        {
          backgroundColor: colors.floatingBackground,
          opacity: onPress ? 1 : 0.5,
        },
      ]}
      accessibilityLabel={'toggleCameraButton'}
      shouldVibrateOnClick
      onPress={onPressCallback}>
      <Animated.View style={rotateAnimation.style}>
        <AppIcon type={'icToggleCamera'} />
      </Animated.View>
    </Component>
  )
}

export default memo(ToggleCameraButton)

const styles = StyleSheet.create({
  button: {
    width: ms(48),
    height: ms(48),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(48 / 2),
    marginStart: ms(16),
    zIndex: 5,
  },
})

import React, {memo} from 'react'
import {Image, StyleSheet} from 'react-native'

import RasterIcon from '../../../assets/RasterIcon'
import {AppNavigationTheme} from '../../../theme/navigationTheme'
import {isWeb} from '../../../utils/device.utils'

interface Props {
  readonly parentSize: number
  readonly scale: number
}

const UserScreenShareView: React.FC<Props> = (props) => {
  const size = props.parentSize * props.scale
  const start = -(size / 4)

  if (isWeb) {
    return (
      <Image
        source={require('../../../../connectclub-desktop/src/assets/img/ic_share_screen_web.png')}
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            top: props.parentSize - size,
            start: start,
          },
        ]}
      />
    )
  }

  return (
    <RasterIcon
      circle
      accessibilityLabel={'UserScreenShareView'}
      type={'icScreenShare'}
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          top: props.parentSize - size,
          start: start,
        },
      ]}
      paddingHorizontal={size * 0.25}
      scaleType={'fitCenter'}
    />
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppNavigationTheme.colors.primary,
    position: 'absolute',
  },
})

export default memo(UserScreenShareView)

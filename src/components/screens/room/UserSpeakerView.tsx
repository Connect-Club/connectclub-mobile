import React, {memo} from 'react'
import {Image, Platform, StyleSheet} from 'react-native'

import RasterIcon from '../../../assets/RasterIcon'
import {AppNavigationTheme} from '../../../theme/navigationTheme'
import UserSpeakerMicrophoneIconsViewNative from './nativeview/RTCUserSpeakerMicrophoneIconsView'

interface Props {
  readonly parentSize: number
  readonly scale: number
  readonly isAbsoluteSpeaker?: boolean
}

const speakerIcon = require('../../../assets/img/icSpeakerOn.png')
const absoluteSpeakerIcon = require('../../../assets/img/ic_megaphone_on.png')

const UserSpeakerView: React.FC<Props> = (props) => {
  const size = props.parentSize * props.scale
  const sizeIndex = size / 26
  const iconSize = 16 * sizeIndex
  const start = -(size / 4)
  const isAbsoluteSpeaker = props.isAbsoluteSpeaker ?? false
  const iosIcon = isAbsoluteSpeaker ? 'ic_megaphone_on' : 'icSpeakerOn'
  const icon = isAbsoluteSpeaker ? absoluteSpeakerIcon : speakerIcon

  return (
    <UserSpeakerMicrophoneIconsViewNative
      style={[
        styles.speaker,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          top: props.parentSize - size,
          start: start,
        },
      ]}>
      {Platform.select({
        ios: (
          <RasterIcon
            accessibilityLabel={'icSpeakerOn'}
            type={iosIcon}
            style={{width: size, height: size}}
            paddingHorizontal={size * 0.2}
            scaleType={'fitCenter'}
          />
        ),
        default: (
          <Image
            source={icon}
            width={size}
            height={size}
            resizeMode={'contain'}
            style={[
              styles.androidIconStyle,
              {width: iconSize, height: iconSize},
            ]}
          />
        ),
      })}
    </UserSpeakerMicrophoneIconsViewNative>
  )
}

const styles = StyleSheet.create({
  speaker: {
    justifyContent: 'center',
    backgroundColor: AppNavigationTheme.colors.primary,
    position: 'absolute',
  },
  androidIconStyle: {
    alignSelf: 'center',
  },
})

export default memo(UserSpeakerView)

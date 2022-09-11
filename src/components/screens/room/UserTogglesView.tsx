import React, {memo} from 'react'
import {StyleSheet} from 'react-native'

import RasterIcon from '../../../assets/RasterIcon'
import {commonStyles} from '../../../theme/appTheme'
import UserTogglesViewNative from './nativeview/RTCUserTogglesView'

interface Props {
  readonly parentSize: number
  readonly scale: number
  readonly zIndex: number
}

const UserTogglesView: React.FC<Props> = (props) => {
  const scaledSize = props.parentSize * props.scale

  return (
    <UserTogglesViewNative
      style={[
        {
          width: scaledSize,
          height: scaledSize * 2,
          borderRadius: scaledSize / 2,
          top: props.parentSize - props.parentSize / 2 - scaledSize / 2,
          start: props.parentSize - props.parentSize * 0.15,
          zIndex: props.zIndex,
        },
        commonStyles.flexOne,
        styles.videoAudioTogglesContainer,
      ]}>
      <RasterIcon
        accessibilityLabel={'videoIconView'}
        type={'ic_stage_cam_off'}
        style={{
          width: scaledSize,
          height: scaledSize,
        }}
        paddingHorizontal={scaledSize * 0.25}
        scaleType={'fitCenter'}
      />
      {/*{!props.isAudioEnabled && !props.isSpeaker && (*/}
      <RasterIcon
        accessibilityLabel={'audioIconView'}
        type={'ic_stage_mic_off'}
        style={{
          width: scaledSize,
          height: scaledSize,
        }}
        paddingHorizontal={scaledSize * 0.25}
        scaleType={'fitCenter'}
      />
    </UserTogglesViewNative>
  )
}

const styles = StyleSheet.create({
  videoAudioTogglesContainer: {
    flexDirection: 'column',
    backgroundColor: 'white',
    position: 'absolute',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    elevation: 4,
  },
})

export default memo(UserTogglesView)

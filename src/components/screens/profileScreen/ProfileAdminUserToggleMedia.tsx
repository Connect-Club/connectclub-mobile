import React, {memo, useCallback, useState} from 'react'
import {StyleSheet, View} from 'react-native'

import {sendUserMute} from '../../../appEventEmitter'
import AppIcon from '../../../assets/AppIcon'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  readonly isVideoEnabled: boolean
  readonly isAudioEnabled: boolean
  readonly userId: string
}

export const ProfileAdminUserToggleMedia: React.FC<Props> = memo((props) => {
  const {colors} = useTheme()

  const [videoEnabled, setVideoEnabled] = useState(props.isVideoEnabled)
  const [audioEnabled, setAudioEnabled] = useState(props.isAudioEnabled)

  const onVideoClick = useCallback(() => {
    setVideoEnabled(!videoEnabled)
    sendUserMute(props.userId, 'video')
  }, [videoEnabled])

  const onAudioClick = useCallback(() => {
    setAudioEnabled(!audioEnabled)
    sendUserMute(props.userId, 'audio')
  }, [audioEnabled])

  return (
    <View style={[styles.base, {backgroundColor: colors.floatingBackground}]}>
      <AppTouchableOpacity
        shouldVibrateOnClick
        style={styles.button}
        onPress={!videoEnabled ? undefined : onVideoClick}>
        <AppIcon
          type={videoEnabled ? 'icCamOn' : 'icCamOff'}
          tint={colors.accentPrimary}
        />
      </AppTouchableOpacity>
      <AppTouchableOpacity
        shouldVibrateOnClick
        style={styles.button}
        onPress={!audioEnabled ? undefined : onAudioClick}>
        <AppIcon
          type={audioEnabled ? 'icMicOn' : 'icMicOff'}
          tint={colors.accentPrimary}
        />
      </AppTouchableOpacity>
    </View>
  )
})

const styles = StyleSheet.create({
  base: {
    marginTop: -ms(16),
    backgroundColor: 'white',
    width: ms(100),
    height: ms(38),
    borderRadius: ms(38) / 2,
    flexDirection: 'row',
  },

  button: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
})

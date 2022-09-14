import {observer} from 'mobx-react'
import React from 'react'
import {ActivityIndicator, StyleSheet, View} from 'react-native'

import AppTouchableOpacity from '../../../src/components/common/AppTouchableOpacity'
import {
  LocalMediaState,
  MediaState,
} from '../../../src/components/screens/room/models/localModels'

import {ms} from '../../../src/utils/layout.utils'

import RasterIcon from '../../../src/assets/RasterIcon'
import {RasterIconType} from '../../../src/assets/rasterIcons'
import {useTheme} from '../../../src/theme/appTheme'

interface Props {
  readonly onVideoToggle: () => void
  readonly onAudioToggle: () => void
  readonly currentUserMediaState: LocalMediaState
}

const renderToggleButton = (
  state: MediaState,
  onPress: () => void,
  onIconType: RasterIconType,
  offIconType: RasterIconType,
): React.ReactNode => {
  if (state === MediaState.LOADING)
    return (
      <ActivityIndicator style={styles.button} size={'small'} color={'black'} />
    )

  const icon: RasterIconType =
    state === MediaState.ON ? onIconType : offIconType

  return (
    <AppTouchableOpacity style={styles.button} onPress={onPress}>
      <RasterIcon type={icon} style={styles.icon} />
    </AppTouchableOpacity>
  )
}

const ToggleVideoAudioButtonsWeb: React.FC<Props> = ({
  onVideoToggle,
  onAudioToggle,
  currentUserMediaState,
}) => {
  const {colors} = useTheme()

  return (
    <View
      style={[
        styles.buttonsContainer,
        {backgroundColor: colors.floatingBackground},
      ]}>
      {renderToggleButton(
        currentUserMediaState.video,
        onVideoToggle,
        'icCamOn',
        'icCamOff',
      )}

      {renderToggleButton(
        currentUserMediaState.audio,
        onAudioToggle,
        'icMicOn',
        'icMicOff',
      )}
    </View>
  )
}

export default observer(ToggleVideoAudioButtonsWeb)

const styles = StyleSheet.create({
  buttonsContainer: {
    width: ms(96),
    height: ms(48),
    borderRadius: ms(24),
    flexDirection: 'row',
    marginStart: 16,
    zIndex: 100,
  },

  button: {
    width: ms(48),
    height: ms(48),
    paddingHorizontal: ms(16),
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    width: ms(24),
    height: ms(24),
  },
})

import {observer} from 'mobx-react'
import React from 'react'
import {StyleSheet} from 'react-native'

import {analytics} from '../../../Analytics'
import AppIcon from '../../../assets/AppIcon'
import {useTheme} from '../../../theme/appTheme'
import {isNative} from '../../../utils/device.utils'
import {ms} from '../../../utils/layout.utils'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  readonly isAvailable: boolean
  readonly isEnabled: boolean
  readonly onPress: (enable: boolean) => void
}

const AbsoluteSpeakerButton: React.FC<Props> = (props) => {
  const {colors} = useTheme()

  const onPress = () => {
    if (!props.isAvailable) return
    props.onPress(!props.isEnabled)
    if (!props.isEnabled)
      analytics.sendEvent('click_admin_absolute_speaker_button')
  }

  return (
    <AppTouchableOpacity
      accessibilityLabel={'absoluteSpeakerButton'}
      style={[
        styles.button,
        {
          backgroundColor: colors.floatingBackground,
        },
      ]}
      shouldVibrateOnClick={props.isAvailable}
      onPress={onPress}>
      <AppIcon
        style={{opacity: props.isAvailable ? 1.0 : 0.3}}
        type={props.isEnabled ? 'icMegafonOn' : 'icMegafonOff'}
        tint={props.isEnabled ? colors.accentPrimary : colors.bodyText}
      />
    </AppTouchableOpacity>
  )
}

export default observer(AbsoluteSpeakerButton)

const styles = StyleSheet.create({
  button: {
    height: ms(48),
    width: ms(48),
    paddingHorizontal: isNative ? ms(19) : 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(48) / 2,
    marginStart: ms(16),
  },
})

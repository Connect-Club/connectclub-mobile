import React, {memo} from 'react'
import {StyleSheet} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import AppTouchableOpacity from '../../../components/common/AppTouchableOpacity'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'

interface Props {
  readonly onPress: () => void
}

const SelfieButton: React.FC<Props> = ({onPress}) => {
  const {colors} = useTheme()

  return (
    <AppTouchableOpacity
      style={[styles.button, {backgroundColor: colors.floatingBackground}]}
      accessibilityLabel={'selfieButton'}
      shouldVibrateOnClick
      onPress={onPress}>
      <AppIcon type={'icSelfie'} tint={colors.warning} />
    </AppTouchableOpacity>
  )
}

export default memo(SelfieButton)

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

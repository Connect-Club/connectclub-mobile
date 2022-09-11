import React, {memo} from 'react'
import {StyleSheet} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  readonly onPress: () => void
}

const CollapseRoomButton: React.FC<Props> = ({onPress}) => {
  const {colors} = useTheme()

  return (
    <AppTouchableOpacity
      style={[styles.button, {backgroundColor: colors.floatingBackground}]}
      accessibilityLabel={'collapseRoom'}
      shouldVibrateOnClick
      onPress={onPress}>
      <AppIcon type={'icArrowDown'} tint={undefined} />
    </AppTouchableOpacity>
  )
}

export default memo(CollapseRoomButton)

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

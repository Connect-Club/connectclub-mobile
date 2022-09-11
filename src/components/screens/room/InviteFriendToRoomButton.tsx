import React, {memo} from 'react'
import {StyleSheet} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  readonly onPress: () => void
}

const InviteFriendToRoomButton: React.FC<Props> = ({onPress}) => {
  const {colors} = useTheme()

  return (
    <AppTouchableOpacity
      accessibilityLabel={'InviteFriendToRoomButton'}
      style={[styles.button, {backgroundColor: colors.floatingBackground}]}
      shouldVibrateOnClick
      onPress={onPress}>
      <AppIcon type={'icInvite'} tint={colors.bodyText} />
    </AppTouchableOpacity>
  )
}

export default memo(InviteFriendToRoomButton)

const styles = StyleSheet.create({
  button: {
    width: ms(48),
    height: ms(48),
    paddingHorizontal: ms(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(48 / 2),
    marginStart: ms(16),
  },
})

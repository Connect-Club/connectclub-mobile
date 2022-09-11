import React from 'react'
import {StyleSheet, View} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  readonly onPress: () => void
  readonly showPrivacyBadge: boolean
}

const ManageRoomButton: React.FC<Props> = ({onPress, showPrivacyBadge}) => {
  const {colors} = useTheme()

  return (
    <AppTouchableOpacity
      accessibilityLabel={'manageRoomButton'}
      style={[styles.button, {backgroundColor: colors.floatingBackground}]}
      shouldVibrateOnClick
      onPress={onPress}>
      <AppIcon type={'icSettings'} tint={colors.bodyText} />

      {showPrivacyBadge && (
        <View
          style={[
            styles.lockBadge,
            {backgroundColor: colors.primaryClickable},
          ]}>
          <AppIcon type={'icClosedLock16'} />
        </View>
      )}
    </AppTouchableOpacity>
  )
}

export default ManageRoomButton

const styles = StyleSheet.create({
  button: {
    height: ms(48),
    width: ms(48),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(48) / 2,
    marginStart: ms(16),
  },
  lockBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    borderRadius: ms(100),
    width: ms(18),
    height: ms(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
})

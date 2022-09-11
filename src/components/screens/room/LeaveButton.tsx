import React, {memo, useCallback} from 'react'
import {StyleSheet} from 'react-native'

import {useNetworkState} from '../../../api/useNetworkCallback'
import AppIcon from '../../../assets/AppIcon'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  readonly onPress: () => void
}

const LeaveButton: React.FC<Props> = ({onPress}) => {
  const {colors} = useTheme()
  const networkState = useNetworkState()
  const onClick = useCallback(() => {
    if (networkState) onPress()
  }, [onPress, networkState])

  return (
    <AppTouchableOpacity
      style={[styles.button, {backgroundColor: colors.floatingBackground}]}
      accessibilityLabel={'leaveButton'}
      shouldVibrateOnClick
      onPress={onClick}>
      <AppIcon
        style={{opacity: networkState ? 1 : 0.5}}
        type={'icLeave'}
        tint={colors.warning}
      />
    </AppTouchableOpacity>
  )
}

export default memo(LeaveButton)

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

import React, {memo} from 'react'
import {StyleProp, StyleSheet, ViewStyle} from 'react-native'

import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  readonly onPress: () => void
  readonly title: string
  readonly isEnabled?: boolean
  readonly color?: string
  readonly style?: StyleProp<ViewStyle>
}

const NavigationTextButton: React.FC<Props> = ({
  onPress,
  title,
  color,
  style,
  isEnabled = true,
}) => {
  const {colors} = useTheme()

  return (
    <AppTouchableOpacity
      disabled={!isEnabled}
      style={[styles.button, style]}
      onPress={onPress}>
      <AppText
        style={[
          styles.title,
          {color: color ?? colors.accentPrimary},
          {opacity: isEnabled ? 1 : 0.5},
        ]}>
        {title}
      </AppText>
    </AppTouchableOpacity>
  )
}

export default memo(NavigationTextButton)

const styles = StyleSheet.create({
  button: {
    height: ms(42),
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: ms(18),
    paddingHorizontal: ms(8),
  },
})

import React from 'react'
import {StyleProp, StyleSheet, TextStyle, ViewStyle} from 'react-native'

import {useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import AppText from './AppText'
import AppTouchableOpacity from './AppTouchableOpacity'

interface Props {
  readonly title: string
  readonly onPress?: () => void
  readonly height?: number
  readonly style?: StyleProp<ViewStyle>
  readonly textStyle?: StyleProp<TextStyle>
  readonly accessibilityLabel?: string
  readonly isEnabled?: boolean
}

const InlineButton: React.FC<Props> = ({
  title,
  onPress,
  style,
  textStyle,
  height = 24,
  accessibilityLabel,
  isEnabled = true,
}) => {
  const {colors} = useTheme()

  return (
    <AppTouchableOpacity
      style={[styles.followersButton, {height}, style]}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      disabled={!isEnabled}>
      <AppText style={[styles.title, {color: colors.accentPrimary}, textStyle]}>
        {title}
      </AppText>
    </AppTouchableOpacity>
  )
}

export default InlineButton

const styles = StyleSheet.create({
  followersButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontWeight: '600',
    fontSize: ms(14),
    marginStart: ms(4),
  },
})

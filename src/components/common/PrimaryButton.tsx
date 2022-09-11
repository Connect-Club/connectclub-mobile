import React from 'react'
import {StyleProp, StyleSheet, TextStyle, ViewStyle} from 'react-native'

import AppIcon, {AppIconProps, AppIconType} from '../../assets/AppIcon'
import {commonStyles, useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import AppText from './AppText'
import AppTouchableOpacity from './AppTouchableOpacity'
import Horizontal from './Horizontal'

interface Props {
  readonly title: string
  readonly onPress?: () => void
  readonly style?: StyleProp<ViewStyle>
  readonly isEnabled?: boolean
  readonly textStyle?: StyleProp<TextStyle>
  readonly icon?: AppIconType | AppIconProps
  readonly accessibilityLabel?: string
  readonly shouldVibrateOnClick?: boolean
}

const PrimaryButton: React.FC<Props> = ({
  title,
  onPress,
  style,
  textStyle,
  icon,
  isEnabled = true,
  accessibilityLabel,
  shouldVibrateOnClick,
}) => {
  const {colors} = useTheme()

  const buttonBackground = {
    backgroundColor: isEnabled
      ? colors.accentPrimary
      : colors.accentPrimaryDisabled,
  }
  const textColor = {
    color: isEnabled ? colors.textPrimary : colors.textPrimaryDisabled,
  }
  const hasIconType = typeof icon === 'string'

  return (
    <AppTouchableOpacity
      shouldVibrateOnClick={shouldVibrateOnClick}
      accessibilityLabel={accessibilityLabel}
      disabled={!isEnabled}
      style={[buttonBackground, commonStyles.primaryButton, style]}
      activeOpacity={0.9}
      onPress={onPress}>
      <Horizontal style={styles.container}>
        {hasIconType && icon && <AppIcon style={styles.icon} type={icon} />}
        {!hasIconType && icon && <AppIcon style={styles.icon} {...icon} />}
        <AppText style={[styles.title, textColor, textStyle]}>{title}</AppText>
      </Horizontal>
    </AppTouchableOpacity>
  )
}

export default PrimaryButton

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  icon: {
    marginEnd: ms(8),
  },

  title: {
    fontSize: ms(17),
    fontWeight: '600',
  },
})

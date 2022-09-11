import React, {memo} from 'react'
import {StyleProp, StyleSheet, ViewStyle} from 'react-native'

import AppIcon, {AppIconType} from '../../assets/AppIcon'
import {useTheme} from '../../theme/appTheme'
import AppTouchableOpacity from './AppTouchableOpacity'

interface Props {
  readonly onPress?: () => void
  readonly icon: AppIconType
  readonly tint?: string
  readonly style?: StyleProp<ViewStyle>
  readonly accessibilityLabel: string
  readonly shouldVibrateOnClick?: boolean
  readonly disabled?: boolean
}

const AppIconButton: React.FC<Props> = ({
  onPress,
  icon,
  tint,
  style,
  accessibilityLabel,
  shouldVibrateOnClick,
  disabled
}) => {
  const {colors} = useTheme()

  return (
    <AppTouchableOpacity
      accessibilityLabel={accessibilityLabel}
      style={[styles.button, style]}
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
      shouldVibrateOnClick={shouldVibrateOnClick}
      disabled={disabled}
    >
      <AppIcon type={icon} tint={tint ?? colors.bodyText} />
    </AppTouchableOpacity>
  )
}

export default memo(AppIconButton)

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})

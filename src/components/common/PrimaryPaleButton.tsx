import React from 'react'
import {StyleSheet} from 'react-native'

import {AppIconProps} from '../../assets/AppIcon'
import {AppIconType} from '../../assets/AppIcon.native'
import {useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import PrimaryButton from './PrimaryButton'

interface PrimaryPaleButtonProps {
  readonly title: string
  readonly accessibilityLabel?: string
  readonly icon?: AppIconType | AppIconProps
  readonly onPress?: () => void
}

const PrimaryPaleButton: React.FC<PrimaryPaleButtonProps> = (props) => {
  const {colors} = useTheme()
  const titleStyle = {color: colors.accentPrimary, fontSize: ms(12)}

  return (
    <PrimaryButton
      style={[styles.button, {backgroundColor: colors.accentSecondary}]}
      shouldVibrateOnClick
      icon={props.icon}
      title={props.title}
      accessibilityLabel={props.accessibilityLabel}
      onPress={props.onPress}
      textStyle={titleStyle}
    />
  )
}

export default PrimaryPaleButton

const styles = StyleSheet.create({
  button: {
    height: ms(30),
    paddingHorizontal: ms(12),
    minWidth: undefined,
    minHeight: undefined,
    maxWidth: ms(209),
  },
})

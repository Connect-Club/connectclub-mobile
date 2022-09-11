import React, {memo} from 'react'
import {StyleProp, StyleSheet, ViewStyle} from 'react-native'

import AppIcon, {AppIconType} from '../../assets/AppIcon'
import {commonStyles, useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import AppText from './AppText'
import AppTouchableOpacity from './AppTouchableOpacity'

interface Props {
  readonly onPress: () => void
  readonly icon: AppIconType
  readonly tint?: string
  readonly title: string
  readonly style?: StyleProp<ViewStyle>
}

const VerticalIconTextButton: React.FC<Props> = ({
  onPress,
  icon,
  tint,
  title,
  style,
}) => {
  const {colors} = useTheme()

  return (
    <AppTouchableOpacity
      style={[commonStyles.flexCenter, style]}
      onPress={onPress}>
      <AppIcon type={icon} tint={tint ?? colors.bodyText} />
      <AppText style={[styles.title, {color: colors.bodyText}]}>
        {title}
      </AppText>
    </AppTouchableOpacity>
  )
}

export default memo(VerticalIconTextButton)

const styles = StyleSheet.create({
  title: {
    fontSize: ms(13),
    marginTop: ms(5),
  },
})

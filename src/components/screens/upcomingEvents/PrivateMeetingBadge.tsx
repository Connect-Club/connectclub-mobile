import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleProp, StyleSheet, ViewStyle} from 'react-native'

import AppIcon from '../../../assets/AppIcon.native'
import {makeTextStyle, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import Horizontal from '../../common/Horizontal'

interface BadgeProps {
  readonly isShort?: boolean
  readonly style?: StyleProp<ViewStyle>
}

const PrivateMeetingBadge: React.FC<BadgeProps> = ({
  isShort = false,
  style,
}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()

  return (
    <Horizontal
      style={[
        styles.privateMeetingBadge,
        style,
        {backgroundColor: colors.inactiveAccentColor},
      ]}>
      <AppIcon type={'icLock'} tint={colors.secondaryBodyText} />
      <AppText style={[styles.badgeText, {color: colors.secondaryBodyText}]}>
        {isShort ? t('privateMeetingShort') : t('privateMeetingText')}
      </AppText>
    </Horizontal>
  )
}
export default PrivateMeetingBadge

const styles = StyleSheet.create({
  privateMeetingBadge: {
    height: ms(26),
    borderRadius: ms(8),
    paddingHorizontal: ms(12),
    justifyContent: 'center',
    alignItems: 'center',
  },

  badgeText: {
    ...makeTextStyle(ms(12), ms(18), '600'),
  },
})

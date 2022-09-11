import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleProp, StyleSheet, ViewStyle} from 'react-native'

import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  readonly count: number
  readonly style?: StyleProp<ViewStyle>
}

const PendingInvitesButton: React.FC<Props> = ({count, style}) => {
  const navigation = useNavigation()
  const {t} = useTranslation()
  const {colors} = useTheme()

  return (
    <AppTouchableOpacity
      style={[
        styles.followButton,
        style,
        {backgroundColor: colors.accentSecondary},
      ]}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('InvitesPendingScreen')}>
      <AppText style={[styles.followButtonText, {color: colors.accentPrimary}]}>
        {t('invitesScreenPendingButton', {count})}
      </AppText>
    </AppTouchableOpacity>
  )
}

export default PendingInvitesButton

const styles = StyleSheet.create({
  followButton: {
    alignSelf: 'center',
    width: 'auto',
    height: ms(28),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ms(16),
    borderRadius: ms(28) / 2,
  },

  followButtonText: {
    fontSize: ms(12),
    fontWeight: '600',
  },
})

import React from 'react'
import {useTranslation} from 'react-i18next'
import {Keyboard, StyleSheet} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {UserPhone} from '../../../models'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import {clearWindowFocus} from '../../common/DecorConfigModule'

export type InvitePressHandler = (
  displayName: string,
  phones: Array<UserPhone>,
) => void

interface Props {
  readonly isJoined: boolean
  readonly isPending: boolean
  readonly phones: Array<UserPhone>
  readonly displayName: string
  readonly onContactSelectedPress: InvitePressHandler
}

const InviteButton: React.FC<Props> = ({
  isJoined,
  onContactSelectedPress,
  phones,
  displayName,
  isPending,
}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()

  const background = {
    backgroundColor: isJoined ? 'transparent' : colors.accentPrimary,
    paddingHorizontal: ms(isJoined ? 12 : 24),
  }

  const color = {
    color: isJoined ? colors.secondaryBodyText : colors.textPrimary,
  }

  let title = isJoined
    ? t('invitesScreenJoined')
    : t('invitesScreenInviteButton')

  if (isPending) title = t('invitesPendingScreenSendReminder')

  return (
    <AppTouchableOpacity
      style={[styles.button, background]}
      accessibilityLabel={'inviteButton'}
      activeOpacity={isJoined ? 1 : 0.9}
      onPress={
        isJoined
          ? undefined
          : () => {
              clearWindowFocus()
              Keyboard.dismiss()
              onContactSelectedPress(displayName, phones)
            }
      }>
      {isJoined && (
        <AppIcon
          style={styles.icon}
          tint={colors.secondaryBodyText}
          type={'icCheck'}
        />
      )}
      <AppText style={[styles.followButtonText, color]}>{title}</AppText>
    </AppTouchableOpacity>
  )
}

export default InviteButton

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: ms(28),
    borderRadius: ms(28 / 2),
  },

  followButtonText: {
    fontSize: ms(12),
    fontWeight: '600',
  },

  icon: {
    marginEnd: ms(4),
  },
})

import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {InviteContactStatus, UserPhone} from '../../../models'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

export type SelectPhoneDialogButtons = Array<{
  phone: string
  status: InviteContactStatus
}>

interface Props {
  readonly buttons: SelectPhoneDialogButtons
  readonly onDismiss: () => void
  readonly onSelect: (phone: UserPhone) => void
}

export interface SelectorConfig {
  readonly displayName: string
  readonly phones: Array<UserPhone>
}

const SelectPhoneBottomDialog: React.FC<Props> = (props) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  return (
    <View>
      <AppText style={[styles.title, {color: colors.bodyText}]}>
        {t('phoneSelectorTitle')}
      </AppText>
      {props.buttons.map((userPhone, i) => {
        const status = userPhone.status
        const isFirst = i === 0
        const isJoined = status === 'invited'
        let label = ''
        switch (status) {
          // Invited
          case 'pending':
          case 'send_reminder':
            label = t('phoneLabelInvited')
            break
          // Joined
          case 'invited':
            label = t('phoneLabelJoined')
            break
        }
        const onPress = () => {
          if (isJoined) return
          props.onSelect(userPhone)
        }
        const color = isJoined ? colors.secondaryBodyText : colors.bodyText
        return (
          <AppTouchableOpacity
            style={styles.container}
            key={i}
            activeOpacity={isJoined ? 1 : 0.8}
            onPress={onPress}>
            <AppText style={[styles.phoneText, {color: color}]}>
              {userPhone.phone}
            </AppText>
            {!!label && (
              <View style={styles.statusContainer}>
                {isJoined && <AppIcon type={'icCheck24'} tint={color} />}
                <AppText style={[styles.statusText, {color: color}]}>
                  {label}
                </AppText>
              </View>
            )}
            {!isFirst && (
              <View
                style={[
                  styles.divider,
                  {backgroundColor: colors.inactiveAccentColor},
                ]}
              />
            )}
          </AppTouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  divider: {
    height: ms(1),
    position: 'absolute',
    left: ms(16),
    right: ms(16),
    top: 0,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ms(16),
    height: ms(56),
  },
  title: {
    textAlign: 'center',
    fontSize: ms(17),
    fontWeight: 'bold',
    lineHeight: ms(56),
  },
  phoneText: {
    fontSize: ms(17),
    lineHeight: ms(25),
  },
  statusText: {
    fontSize: ms(12),
    lineHeight: ms(18),
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})

export default SelectPhoneBottomDialog

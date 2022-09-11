import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {appEventEmitter} from '../../../appEventEmitter'
import AppIcon from '../../../assets/AppIcon'
import {UserModel} from '../../../models'
import {useTheme} from '../../../theme/appTheme'
import {timeAgo} from '../../../utils/date.utils'
import {ms} from '../../../utils/layout.utils'
import {fullName, getUserShortName} from '../../../utils/userHelper'
import AppAvatar from '../../common/AppAvatar'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Vertical from '../../common/Vertical'

interface Props {
  readonly user: UserModel
  readonly onUserPress: (id: string) => void
}

const AvailableToChatListItem: React.FC<Props> = ({user, onUserPress}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()
  const dotStyle = [
    styles.dotView,
    {
      backgroundColor: colors.activeAccent,
      borderColor: colors.systemBackground,
    },
  ]

  const onInviteIntoRoom = async () => {
    appEventEmitter.trigger('startRoomForChat', user.id)
  }

  return (
    <AppTouchableOpacity
      accessibilityLabel={'availableToChatItem'}
      style={styles.listItem}
      onPress={() => onUserPress(user.id)}>
      <AppAvatar
        size={ms(38)}
        shortName={getUserShortName(user)}
        style={styles.avatar}
        avatar={user.avatar}
      />

      {user.online && (
        <View accessibilityLabel={'onlineMark'} style={dotStyle} />
      )}

      <Vertical style={styles.textContainer}>
        <AppText
          style={[styles.title, {color: colors.bodyText}]}
          numberOfLines={1}
          ellipsizeMode={'tail'}>
          {fullName(user)}
        </AppText>
        <AppText
          style={[styles.description, {color: colors.secondaryBodyText}]}
          numberOfLines={1}>
          {user.online ? t('online') : timeAgo(user.lastSeen ?? 0, true)}
        </AppText>
      </Vertical>

      <AppTouchableOpacity
        style={[styles.roomButton, {backgroundColor: colors.accentSecondary}]}
        accessibilityLabel={'inviteIntoRoomButton'}
        onPress={onInviteIntoRoom}>
        <AppText
          style={[styles.roomButtonTitle, {color: colors.accentPrimary}]}>
          {t('inviteIntoPrivateRoom')}
        </AppText>
        <AppIcon type={'icLock'} />
      </AppTouchableOpacity>
    </AppTouchableOpacity>
  )
}

export default AvailableToChatListItem

const styles = StyleSheet.create({
  dotView: {
    position: 'absolute',
    top: ms(39),
    left: ms(43),
    width: ms(14),
    height: ms(14),
    borderRadius: ms(7),
    overflow: 'hidden',
    borderWidth: ms(2),
  },

  avatar: {
    width: ms(38),
    height: ms(38),
  },

  listItem: {
    paddingHorizontal: ms(16),
    flexDirection: 'row',
    height: ms(62),
    alignItems: 'center',
    overflow: 'hidden',
  },

  textContainer: {
    marginStart: ms(16),
    flex: 1,
    marginEnd: ms(8),
  },

  title: {
    fontSize: ms(14),
    fontWeight: '500',
  },

  description: {
    fontSize: ms(12),
    marginTop: ms(2),
  },

  roomButton: {
    paddingEnd: ms(8),
    paddingStart: ms(12),
    height: ms(28),
    borderRadius: ms(28 / 2),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  roomButtonTitle: {
    fontSize: ms(12),
    fontWeight: '600',
  },
})

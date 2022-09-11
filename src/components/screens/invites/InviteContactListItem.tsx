import React, {memo} from 'react'
import {useTranslation} from 'react-i18next'
import {Image, StyleSheet} from 'react-native'

import {InviteContactModel} from '../../../models'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {shortFromDisplayName} from '../../../utils/userHelper'
import AppAvatar from '../../common/AppAvatar'
import AppText from '../../common/AppText'
import Horizontal from '../../common/Horizontal'
import Vertical from '../../common/Vertical'
import InviteButton, {InvitePressHandler} from './InviteButton'

interface Props {
  readonly user: InviteContactModel
  readonly onContactSelectedPress?: InvitePressHandler
  readonly isPending?: boolean
}

const InviteContactListItem: React.FC<Props> = (props) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  const status = props.user.status
  const secondary = {color: colors.secondaryBodyText}
  const avatar = props.user.thumbnail

  const isPending = props.isPending ?? false

  return (
    <Horizontal style={styles.listItem}>
      {!!avatar && (
        <Image
          source={{uri: avatar}}
          style={styles.avatar}
          resizeMode={'contain'}
        />
      )}
      {!avatar && (
        <AppAvatar
          size={ms(32)}
          avatar={undefined}
          style={styles.avatar}
          shortName={
            status === 'unknown'
              ? '📞'
              : shortFromDisplayName(props.user.displayName)
          }
        />
      )}
      <Vertical style={styles.textContainer}>
        <AppText style={[styles.displayName, {color: colors.bodyText}]}>
          {/*{props.user.additionalPhones.length} {props.user.displayName}*/}
          {props.user.displayName}
        </AppText>
        {props.user.countInAnotherUsers > 0 && (
          <AppText style={[styles.friendsCount, secondary]}>
            {t('invitesScreenFriendsCount', {
              count: props.user.countInAnotherUsers,
            })}
          </AppText>
        )}

        {isPending && (
          <AppText style={[styles.friendsCount, secondary]}>
            {t('invitesPendingScreenInvited')}
          </AppText>
        )}
      </Vertical>
      {props.onContactSelectedPress && (
        <InviteButton
          isPending={isPending}
          displayName={props.user.displayName}
          onContactSelectedPress={props.onContactSelectedPress}
          phones={props.user.additionalPhones}
          isJoined={status === 'invited'}
        />
      )}
    </Horizontal>
  )
}

export default memo(InviteContactListItem)

const styles = StyleSheet.create({
  listItem: {
    height: ms(56),
    alignItems: 'center',
    paddingHorizontal: ms(16),
  },

  textContainer: {
    flex: 1,
    justifyContent: 'center',
    marginStart: ms(8),
  },

  displayName: {
    fontSize: ms(12),
    fontWeight: 'bold',
  },

  friendsCount: {
    fontSize: ms(12),
  },

  avatar: {
    width: ms(32),
    height: ms(32),
    borderRadius: ms(32 / 2),
    overflow: 'hidden',
    resizeMode: 'contain',
  },
})

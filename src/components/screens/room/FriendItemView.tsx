import React from 'react'
import {StyleProp, StyleSheet, ViewStyle} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {InviteFriendUserModel} from '../../../stores/PingFriendsStore'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {getUserShortName} from '../../../utils/userHelper'
import AppAvatar from '../../common/AppAvatar'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  readonly user: InviteFriendUserModel
  readonly index: number
  readonly style?: StyleProp<ViewStyle>
  readonly onUserPress: (id: string, index: number) => void
}

const avatarSize = ms(66)
const FriendItemView: React.FC<Props> = ({user, style, onUserPress, index}) => {
  const {colors} = useTheme()

  const opacityStyle = {opacity: user.isInvited ? 0.5 : 1}
  const onInvite = user.isInvited
    ? undefined
    : () => onUserPress(user.user.id, index)

  return (
    <AppTouchableOpacity
      accessibilityLabel={'inviteFriendButton'}
      style={[styles.listItem, style]}
      activeOpacity={user.isInvited ? 1 : 0.8}
      onPress={onInvite}>
      <AppAvatar
        avatar={user.user.avatar}
        style={[opacityStyle, {width: avatarSize, height: avatarSize}]}
        shortName={getUserShortName(user.user)}
        size={avatarSize}
      />
      <AppText
        style={[styles.title, {color: colors.bodyText}, opacityStyle]}
        numberOfLines={1}>
        {user.user.name?.trim()}
      </AppText>
      {__DEV__ && <AppText style={styles.id}>{user.user.id}</AppText>}
      {user.isInvited && (
        <AppIcon type={'icInvited'} style={styles.invitedIcon} />
      )}
    </AppTouchableOpacity>
  )
}

export default FriendItemView

const styles = StyleSheet.create({
  listItem: {
    marginBottom: ms(16),
    alignItems: 'center',
    flexDirection: 'row',
    maxWidth: avatarSize,
  },

  title: {
    marginTop: ms(6),
    fontSize: ms(13),
    fontWeight: '500',
    textAlign: 'center',
  },

  id: {
    position: 'absolute',
    top: 0,
    color: 'white',
    backgroundColor: 'black',
    fontSize: ms(8),
  },

  invitedIcon: {
    position: 'absolute',
    top: avatarSize - ms(20),
    start: 0,
  },
})

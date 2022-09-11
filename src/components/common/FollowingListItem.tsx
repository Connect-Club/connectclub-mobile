import {observer} from 'mobx-react'
import React, {useCallback} from 'react'
import {StyleSheet} from 'react-native'

import {UserModel} from '../../models'
import {storage} from '../../storage'
import {commonStyles, useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import {getUserShortName} from '../../utils/userHelper'
import ConnectButton from '../screens/profileScreen/ConnectButton'
import MarkdownHyperlink from '../screens/profileScreen/MarkdownHyperlink'
import AppAvatar from './AppAvatar'
import AppText from './AppText'
import AppTouchableOpacity from './AppTouchableOpacity'
import Vertical from './Vertical'

interface Props {
  readonly user: UserModel
  readonly index: number
  readonly onSelect: (userId: string) => void
  readonly onStateChanged: (isFollowing: boolean, index: number) => void
}

const FollowingListItem: React.FC<Props> = ({
  user,
  onSelect,
  index,
  onStateChanged,
}) => {
  const {colors} = useTheme()
  const currentUserId = storage.currentUser?.id

  const onFollowingStateChanged = useCallback(
    (isFollowing: boolean) => onStateChanged(isFollowing, index),
    [onStateChanged, index],
  )

  return (
    <AppTouchableOpacity
      style={styles.base}
      accessibilityLabel={'followItem'}
      onPress={() => onSelect(user.id)}>
      <AppAvatar
        style={styles.avatar}
        avatar={user.avatar}
        size={ms(40)}
        shortName={getUserShortName(user)}
      />
      <Vertical style={styles.textContainer}>
        <AppText
          style={[styles.displayName, {color: colors.bodyText}]}
          numberOfLines={1}>
          {user.displayName}
        </AppText>
        {!!user.about && (
          <MarkdownHyperlink linkStyle={commonStyles.link}>
            <AppText
              style={[styles.about, {color: colors.secondaryBodyText}]}
              numberOfLines={2}>
              {user.about?.trim()}
            </AppText>
          </MarkdownHyperlink>
        )}
      </Vertical>
      {currentUserId !== user.id && (
        <ConnectButton
          mode={'list'}
          user={user}
          onFollowingStateChanged={onFollowingStateChanged}
        />
      )}
    </AppTouchableOpacity>
  )
}

export default observer(FollowingListItem)

const styles = StyleSheet.create({
  base: {
    flex: 1,
    height: ms(56),
    alignItems: 'center',
    flexDirection: 'row',
  },

  avatar: {
    width: ms(40),
    height: ms(40),
  },

  textContainer: {
    flex: 1,
    flexWrap: 'nowrap',
    overflow: 'hidden',
    marginEnd: ms(8),
    marginStart: ms(16),
  },

  displayName: {
    fontWeight: 'bold',
    fontSize: ms(12),
  },

  about: {
    fontSize: ms(12),
    lineHeight: ms(16),
  },

  followButton: {
    paddingHorizontal: ms(16),
    position: 'relative',
  },

  followButtonText: {
    fontSize: ms(12),
  },
})

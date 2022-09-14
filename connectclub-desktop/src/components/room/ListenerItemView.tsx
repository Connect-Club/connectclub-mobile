import React, {memo} from 'react'
import {StyleSheet, Text} from 'react-native'

import AppAvatar from '../../../../src/components/common/AppAvatar'
import AppTouchableOpacity from '../../../../src/components/common/AppTouchableOpacity'
import {
  EmojiType,
  PopupUser,
} from '../../../../src/components/screens/room/models/jsonModels'

import {ms} from '../../../../src/utils/layout.utils'
import {profileShortName} from '../../../../src/utils/userHelper'

import {useTheme} from '../../../../src/theme/appTheme'

import ReactionIcon from '../ReactionIcon'
import UserIcons from '../UserIcons'

interface Props {
  readonly listener: PopupUser
  readonly onUserPress: (user: PopupUser) => void
  readonly reaction?: EmojiType
}

const memoChecker = (prevProps: Props, nextProps: Props) => {
  if (prevProps.listener.name !== nextProps.listener.name) return false
  if (prevProps.listener.avatar !== nextProps.listener.avatar) return false
  if (prevProps.listener.isAdmin !== nextProps.listener.isAdmin) return false
  // noinspection RedundantIfStatementJS
  if (prevProps.listener.reaction !== nextProps.listener.reaction) return false
  return true
}

const ListenerItemView: React.FC<Props> = ({
  listener,
  onUserPress,
  reaction,
}) => {
  const {colors} = useTheme()
  const avatarSize = 66

  const hasReaction = reaction != null && reaction !== EmojiType.none

  return (
    <AppTouchableOpacity
      style={[styles.listItem]}
      onPress={() => onUserPress(listener)}>
      <AppAvatar
        size={avatarSize}
        avatar={listener.avatar}
        shortName={profileShortName(listener.name, listener.surname)}
      />

      <Text
        style={[
          styles.title,
          {color: colors.secondaryHeader, maxWidth: avatarSize},
        ]}
        numberOfLines={2}>
        {listener.name.length > 0 ? listener.name : 'N/A'}
      </Text>

      {listener.isAdmin && !hasReaction && (
        <UserIcons
          isAdmin
          isMediaIconsVisible={false}
          isAudioEnabled={false}
          isVideoEnabled={false}
          parentSize={avatarSize}
          scale={0.31}
        />
      )}

      {hasReaction && (
        <ReactionIcon
          parentSize={avatarSize}
          scale={0.5}
          reaction={reaction!}
        />
      )}
    </AppTouchableOpacity>
  )
}

export default memo(ListenerItemView, memoChecker)

const styles = StyleSheet.create({
  listItem: {
    marginTop: 4,
    marginBottom: 8,
    alignItems: 'center',
    marginStart: ms(16),
    marginEnd: ms(16),
    flexDirection: 'column',
  },

  title: {
    marginTop: 4,
    fontSize: 12,
    textAlign: 'center',
  },

  id: {
    position: 'absolute',
    top: 0,
    color: 'white',
    backgroundColor: 'black',
    fontSize: 8,
  },
})

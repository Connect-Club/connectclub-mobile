import {observer} from 'mobx-react'
import React from 'react'
import {StyleSheet} from 'react-native'

import EmojiView from './EmojiView'
import {RoomManager} from './jitsi/RoomManager'
import UserReactionsViewNative from './nativeview/RTCUserReactionsView'
import UserReactionsStore from './store/UserReactionsStore'

interface Props {
  readonly parentSize: number
  readonly roomManager?: RoomManager
  readonly userId: string
  readonly scale: number
  readonly absoluteSize?: number
  readonly offset?: number
  readonly zIndex: number
  readonly reactionStore: UserReactionsStore
  readonly isVisible?: boolean
}

const UserReactionView: React.FC<Props> = (props) => {
  const reaction = props.reactionStore.reactions.get(props.userId)
  const size = props.absoluteSize
    ? props.absoluteSize
    : props.parentSize * props.scale
  const start = props.offset
    ? props.parentSize - size - props.offset
    : props.parentSize - props.parentSize * 0.3
  const top = props.absoluteSize ? 0 : size * -0.42

  return (
    <UserReactionsViewNative
      accessibilityLabel={'UserReactionView'}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          top: top,
          start: start,
          zIndex: props.zIndex,
        },
        styles.reaction,
      ]}>
      {reaction && <EmojiView style={styles.emojiView} type={reaction.type} />}
    </UserReactionsViewNative>
  )
}

const styles = StyleSheet.create({
  emojiView: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reaction: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    elevation: 4,
  },
})

export default observer(UserReactionView)

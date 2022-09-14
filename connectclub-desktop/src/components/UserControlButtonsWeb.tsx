import {observer} from 'mobx-react'
import React from 'react'
import {ScrollView, StyleProp, StyleSheet, View, ViewStyle} from 'react-native'

import Horizontal from '../../../src/components/common/Horizontal'
import BackToStageButton from '../../../src/components/screens/room/BackToStageButton'
import EmojiButton from '../../../src/components/screens/room/EmojiButton'
import InviteFriendToRoomButton from '../../../src/components/screens/room/InviteFriendToRoomButton'
import LeaveButton from '../../../src/components/screens/room/LeaveButton'
import ManageRoomButton from '../../../src/components/screens/room/ManageRoomButton'
import {WsCurrentUser} from '../../../src/components/screens/room/models/jsonModels'
import {LocalMediaState} from '../../../src/components/screens/room/models/localModels'
import RaisedHandsButton from '../../../src/components/screens/room/RaisedHandsButton'
import UserReactionsStore from '../../../src/components/screens/room/store/UserReactionsStore'

import {ms} from '../../../src/utils/layout.utils'

import ToggleVideoAudioButtonsWeb from './ToggleVideoAudioButtonsWeb'

interface Props {
  containerWidth: number
  withSpeakers: boolean
  isConnected: boolean
  currentUser: WsCurrentUser | null
  currentUserId: string
  raisedHandsCount: number
  userReactionsStore?: UserReactionsStore
  readonly onLeavePress: () => void
  readonly onEmojiPress: () => void
  readonly onInviteFriendsToRoomPress: () => void
  readonly onRaiseHandPress: () => void
  readonly onMoveToStage: () => void
  readonly onManageRoomPress: () => void
  readonly onAudioToggle: () => void
  readonly onVideoToggle: () => void
  readonly currentUserMediaState: LocalMediaState
}

const UserControlButtonsWeb: React.FC<Props> = ({
  containerWidth,
  withSpeakers,
  isConnected,
  currentUser,
  currentUserId,
  raisedHandsCount,
  userReactionsStore,
  onLeavePress,
  onEmojiPress,
  onInviteFriendsToRoomPress,
  onRaiseHandPress,
  onMoveToStage,
  onManageRoomPress,
  onAudioToggle,
  onVideoToggle,
  currentUserMediaState,
}) => {
  const style: StyleProp<ViewStyle> = [
    styles.buttons,
    {
      bottom: withSpeakers ? 0 : 20,
      left: withSpeakers ? containerWidth / 2 : '50%',
    },
    // @ts-ignore
    {
      position: 'fixed',
      transform: withSpeakers ? `translate(-50%, 0)` : 'translate(-50%, 0)',
    },
  ]

  return (
    <View style={style}>
      <Horizontal style={styles.container}>
        {isConnected && (
          <ScrollView
            horizontal
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}>
            <Horizontal>
              <div>
                <EmojiButton
                  currentUserId={currentUserId}
                  onPress={onEmojiPress}
                  reactionsStore={userReactionsStore}
                />
              </div>

              <InviteFriendToRoomButton
                roomId={undefined}
                onPress={onInviteFriendsToRoomPress}
              />

              {currentUser!.mode === 'room' && (
                <ToggleVideoAudioButtonsWeb
                  onAudioToggle={onAudioToggle}
                  onVideoToggle={onVideoToggle}
                  currentUserMediaState={currentUserMediaState}
                />
              )}

              {currentUser!.mode === 'popup' && currentUser!.isAdmin && (
                <BackToStageButton
                  roomId={undefined}
                  currentUser={currentUser}
                  onMoveToStage={onMoveToStage}
                />
              )}

              {withSpeakers && (
                <RaisedHandsButton
                  roomId={undefined}
                  currentUser={currentUser!}
                  raisedHandsCount={raisedHandsCount}
                  onPress={onRaiseHandPress}
                  handUp={onRaiseHandPress}
                  handDown={onRaiseHandPress}
                />
              )}

              {currentUser!.isAdmin && (
                <ManageRoomButton
                  onPress={onManageRoomPress}
                  showPrivacyBadge={false}
                />
              )}
            </Horizontal>
          </ScrollView>
        )}
        <View style={styles.leaveButtonContainer}>
          <LeaveButton onPress={onLeavePress} />
        </View>
      </Horizontal>
    </View>
  )
}

export default observer(UserControlButtonsWeb)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },

  leaveButtonContainer: {
    height: ms(70),
    width: ms(48 + 16),
    justifyContent: 'center',
  },

  buttons: {
    height: ms(72),
    flexDirection: 'row',
    zIndex: 1000,
  },

  scrollView: {
    height: ms(72),
  },

  scrollViewContent: {
    height: ms(72),
    alignItems: 'center',
  },
})

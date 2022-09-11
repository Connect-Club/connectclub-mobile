import {observer} from 'mobx-react'
import React from 'react'
import {ScrollView, StyleProp, StyleSheet, View, ViewStyle} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {commonStyles, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import Horizontal from '../../common/Horizontal'
import AbsoluteSpeakerButton from './AbsoluteSpeakerButton'
import BackToStageButton from './BackToStageButton'
import CollapseRoomButton from './CollapseRoomButton'
import EmojiButton from './EmojiButton'
import InviteFriendToRoomButton from './InviteFriendToRoomButton'
import {RoomManager} from './jitsi/RoomManager'
import UserManager from './jitsi/UserManager'
import LeaveButton from './LeaveButton'
import ManageRoomButton from './ManageRoomButton'
import RaisedHandsButton from './RaisedHandsButton'
import SelfieButton from './SelfieButton'
import UserReactionsStore from './store/UserReactionsStore'
import ToggleCameraButton from './ToggleCameraButton'
import ToggleVideoAudioButtons from './ToggleVideoAudioButtons'

interface Props {
  roomManager: RoomManager
  userManager: UserManager
  reactionsStore: UserReactionsStore
  readonly onCollapsePress: () => void
  readonly leaveRoomPress: () => void
  readonly onEmojiPress: () => void
  readonly onSelfiePress: () => void
  readonly onToggleCameraPress: () => void
  readonly onManageRoomPress: () => void
  readonly openRaisedHandsBottomSheet: () => void
  readonly onInviteFriendsToRoomPress: () => void
}

const UserControlButtons: React.FC<Props> = (props) => {
  const inset = useSafeAreaInsets()
  const mode = props.userManager.user?.mode
  const isAdmin = props.userManager.user?.isAdmin === true
  const isConnected = props.userManager.isConnected
  const isVideoEnabled = props.userManager.currentUser?.video === true
  const isToggleCameraVisible = props.userManager.currentUser?.mode === 'room'
  const withSpeakers = props.roomManager.withSpeakers
  const height = ms(72)
  const {colors} = useTheme()

  const style: StyleProp<ViewStyle> = [
    styles.buttons,
    {
      height: height + inset.bottom,
      paddingBottom: inset.bottom,
      borderTopWidth: withSpeakers ? ms(1) : undefined,
      borderTopColor: withSpeakers ? colors.separator : undefined,
      backgroundColor: withSpeakers ? colors.systemBackground : undefined,
    },
  ]

  return (
    <View style={[commonStyles.wizardContainer, style]}>
      {isConnected && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}>
          <Horizontal style={commonStyles.alignCenter}>
            <CollapseRoomButton onPress={props.onCollapsePress} />
            <EmojiButton
              currentUserId={props.userManager.currentUserId}
              onPress={props.onEmojiPress}
              reactionsStore={props.reactionsStore}
            />
            <InviteFriendToRoomButton
              onPress={props.onInviteFriendsToRoomPress}
            />
            {mode === 'popup' && isAdmin && (
              <BackToStageButton
                roomId={props.roomManager.getCurrentRoomId()}
                eventId={props.roomManager.roomEventId}
                currentUser={props.userManager.user}
                onMoveToStage={() =>
                  props.roomManager.moveToStage(props.userManager.currentUserId)
                }
              />
            )}

            {mode === 'room' && (
              <ToggleVideoAudioButtons
                userManager={props.userManager}
                roomId={props.roomManager.getCurrentRoomId()}
                eventId={props.roomManager.roomEventId}
              />
            )}

            {withSpeakers && (
              <RaisedHandsButton
                roomId={props.roomManager.getCurrentRoomId()}
                eventId={props.roomManager.roomEventId}
                currentUser={props.userManager.user}
                raisedHandsCount={props.roomManager.raisedHandsCount}
                onPress={props.openRaisedHandsBottomSheet}
                handDown={props.roomManager.handDown}
                handUp={props.roomManager.handUp}
                silentMode={props.roomManager.isSilentModeEnabled}
              />
            )}

            {mode === 'room' &&
              props.roomManager.isAbsoluteSpeakerSupported() &&
              isAdmin && (
                <AbsoluteSpeakerButton
                  isEnabled={props.roomManager.isAbsoluteSpeakerEnabled}
                  isAvailable={props.roomManager.isAbsoluteSpeakerAvailable}
                  onPress={props.roomManager.absoluteSpeakerMode}
                />
              )}

            <SelfieButton onPress={props.onSelfiePress} />

            {isAdmin && (
              <ManageRoomButton
                onPress={props.onManageRoomPress}
                showPrivacyBadge={props.roomManager.isPrivateRoom}
              />
            )}

            {isToggleCameraVisible && (
              <ToggleCameraButton
                onPress={isVideoEnabled ? props.onToggleCameraPress : undefined}
                roomId={props.roomManager.getCurrentRoomId()}
                eventId={props.roomManager.roomEventId}
              />
            )}

            <LeaveButton onPress={props.leaveRoomPress} />
          </Horizontal>
        </ScrollView>
      )}
    </View>
  )
}

export default observer(UserControlButtons)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },

  buttons: {
    width: '100%',
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
  },
  scrollView: {
    height: ms(72),
  },
  scrollViewContent: {
    height: ms(72),
    alignItems: 'center',
    paddingEnd: ms(16),
  },
})

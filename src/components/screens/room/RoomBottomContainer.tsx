import React from 'react'
import {Image, StyleSheet} from 'react-native'

import {requireRasterIcon} from '../../../assets/rasterIcons'
import {BottomSheetUserEvent} from '../../../models'
import {commonStyles} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {useBottomSafeArea} from '../../../utils/safeArea.utils'
import {RoomManager} from './jitsi/RoomManager'
import UserManager from './jitsi/UserManager'
import {emojiIconsMap} from './models/jsonModels'
import ListenersBottomSheet from './nativeview/RTCListenersBottomSheet'
import UserReactionsStore from './store/UserReactionsStore'
import UserControlButtons from './UserControlButtons'

interface Props {
  roomManager: RoomManager
  userManager: UserManager
  readonly reactionsStore: UserReactionsStore
  readonly onCollapsePress: () => void
  readonly leaveRoomPress: () => void
  readonly onEmojiPress: () => void
  readonly onSelfiePress: () => void
  readonly onUserPress: (event: BottomSheetUserEvent) => void
  readonly openRaisedHandsBottomSheet: () => void
  readonly onManageRoomPress: () => void
  readonly onInviteFriendsToRoomPress: () => void
  readonly onToggleCameraPress: () => void
  readonly onInvitePress?: () => void
}

const iconSpecialGuestUri = Image.resolveAssetSource(
  requireRasterIcon('ic_star_orange_16'),
).uri

const iconBadgedGuestUri = Image.resolveAssetSource(
  requireRasterIcon('ic_special_guest'),
).uri

const iconSpecialModeratorUri = Image.resolveAssetSource(
  requireRasterIcon('ic_special_moderator'),
).uri

const iconNewbieUri = Image.resolveAssetSource(
  requireRasterIcon('ic_newbie'),
).uri

const RoomBottomContainer: React.FC<Props> = (props) => {
  const inset = useBottomSafeArea()
  return (
    <>
      <ListenersBottomSheet
        emojiIcons={emojiIconsMap}
        minSheetHeight={ms(72 + 28) + inset}
        middleSheetHeight={0.27}
        onUserTap={props.onUserPress}
        specialGuestBadgeIcon={iconSpecialGuestUri}
        specialModeratorBadgeIcon={iconSpecialModeratorUri}
        badgedGuestBadgeIcon={iconBadgedGuestUri}
        newbieBadgeIcon={iconNewbieUri}
        style={[commonStyles.wizardContainer, styles.listenersLayout]}>
        {/*<RoomInviteBlockView
          onInvitePress={props.onInvitePress}
          roomManager={props.roomManager}
          userManager={props.userManager}
          roomSettings={props.roomManager.roomSettings}
        />*/}
      </ListenersBottomSheet>
      <UserControlButtons
        onSelfiePress={props.onSelfiePress}
        onInviteFriendsToRoomPress={props.onInviteFriendsToRoomPress}
        openRaisedHandsBottomSheet={props.openRaisedHandsBottomSheet}
        roomManager={props.roomManager}
        userManager={props.userManager}
        reactionsStore={props.reactionsStore}
        onToggleCameraPress={props.onToggleCameraPress}
        onManageRoomPress={props.onManageRoomPress}
        onCollapsePress={props.onCollapsePress}
        leaveRoomPress={props.leaveRoomPress}
        onEmojiPress={props.onEmojiPress}
      />
    </>
  )
}

const styles = StyleSheet.create({
  listenersLayout: {
    height: '100%',
    position: 'absolute',
    alignSelf: 'center',
  },
})

export default RoomBottomContainer

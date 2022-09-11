import {observer} from 'mobx-react'
import React, {useMemo} from 'react'
import {StyleProp, StyleSheet, View, ViewProps, ViewStyle} from 'react-native'

import {BottomSheetImage, BottomSheetUserEvent} from '../../../models'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {getCircleBadgeIcon, profileShortName} from '../../../utils/userHelper'
import AppText from '../../common/AppText'
import {RoomManager} from './jitsi/RoomManager'
import UserManager from './jitsi/UserManager'
import {Participant} from './models/jsonModels'
import CircleVideoView from './nativeview/CircleVideoView'
import AvatarView from './nativeview/RTCAvatarView'
import RadarView from './nativeview/RTCRadarView'
import {SpeakerVideoViewContainer} from './nativeview/RTCSpeakerVideoViewContainer'
import SpeakerView from './nativeview/RTCSpeakerView'
import RoomObjectImage from './RoomObjectImage'
import ShareScreenRoomObject from './ShareScreenRoomObject'
import UserReactionsStore from './store/UserReactionsStore'
import TimeBoxRoomObject from './TimeBoxRoomObject'
import UserBadgeView from './UserBadgeView'
import UserConnectionAnimationView from './UserConnectionAnimationView'
import UserOnCallView from './UserOnCallView'
import UserPathTarget from './UserPathTarget'
import UserReactionView from './UserReactionView'
import UserScreenShareView from './UserScreenShareView'
import UserSpeakerView from './UserSpeakerView'
import UserTogglesView from './UserTogglesView'

interface UserItemProps {
  user: Participant
  readonly roomManager: RoomManager
  readonly index: number
  readonly reactionStore: UserReactionsStore
  readonly onUserPress: (event: BottomSheetUserEvent) => void
}

const Item: React.FC<ViewProps & UserItemProps> = observer((props) => {
  const {colors} = useTheme()
  const {user} = props

  const isExpired = user.isExpired
  const iconsScale = 0.31
  let borderColor = user.isLocal ? colors.accentPrimary : colors.activeAccent
  if (!user.isLocal) {
    if (user.inRadar) borderColor = colors.activeAccent
    else if (!user.inRadar) borderColor = colors.chatBgMyMessage
  }
  const borderWidth = user.size / 40
  const viewRatio = (user.size - borderWidth * 2) / 80
  const animatedStyle: StyleProp<ViewStyle> = useMemo(
    () => ({
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      width: user.size,
      height: user.size,
      zIndex: props.index,
    }),
    [user.size, props.index],
  )

  const videoViewContainerStyle: StyleProp<ViewStyle> = useMemo(
    () => ({
      width: user.size,
      height: user.size,
      borderRadius: user.size / 2,
      borderColor,
    }),
    [user.size, borderColor],
  )
  const fontSize = viewRatio * 24
  const avatarSize = user.size - borderWidth * 2
  const badgeIcon =
    getCircleBadgeIcon(user.badges, user.isAdmin, user.isSpecialGuest) ??
    'ic_crown'

  return (
    <SpeakerView
      style={animatedStyle}
      userId={user.id}
      onClick={props.onUserPress}>
      <AvatarView
        style={[styles.avatarView, {width: avatarSize, height: avatarSize}]}
        fontSize={fontSize}
        avatar={user.avatar}
        initials={profileShortName(user.name, user.surname)}
      />
      <SpeakerVideoViewContainer
        style={[
          videoViewContainerStyle,
          styles.videoViewContainer,
          {borderWidth: ms(borderWidth)},
        ]}>
        <CircleVideoView
          trackId={user.id}
          isMirror={user.isLocal}
          width={user.size}
          height={user.size}
          zIndex={props.index}
        />
      </SpeakerVideoViewContainer>

      {isExpired && (
        <UserConnectionAnimationView
          iconHidden={false}
          borderWidth={ms(borderWidth)}
          parentSize={user.size}
          pointerEvents={'none'}
        />
      )}

      {!isExpired && user.phoneCall && (
        <UserOnCallView
          parentSize={user.size}
          borderWidth={ms(borderWidth)}
          scale={iconsScale}
        />
      )}

      <UserBadgeView
        zIndex={props.index + 2}
        parentSize={user.size}
        scale={iconsScale}
        icon={badgeIcon}
      />

      <UserSpeakerView
        parentSize={user.size}
        scale={iconsScale}
        isAbsoluteSpeaker={user.isAbsoluteSpeaker}
      />

      <UserReactionView
        userId={user.id}
        roomManager={props.roomManager}
        parentSize={user.size}
        scale={0.5}
        zIndex={props.index}
        reactionStore={props.reactionStore}
      />

      <UserScreenShareView parentSize={user.size} scale={iconsScale} />

      <UserTogglesView
        parentSize={user.size}
        scale={iconsScale}
        zIndex={props.index}
      />
      {__DEV__ && (
        <AppText style={[styles.devText, {fontSize: user.size / 8}]}>
          [{`${user.id}`}]
        </AppText>
      )}
    </SpeakerView>
  )
})

interface UsersListProps {
  userManager: UserManager
  width: number
  height: number
  readonly roomManager: RoomManager
  readonly reactionsStore: UserReactionsStore
  readonly onUserPress: (event: BottomSheetUserEvent) => void
  readonly onImagePress: (image: BottomSheetImage) => void
}

const UsersList: React.FC<ViewProps & UsersListProps> = observer((p) => {
  let users = p.userManager.roomUsers
  const isCurrentUserOnScene = p.userManager.user?.mode === 'room'
  const targetSize = p.userManager.currentUser?.size
  const hasRadar = p.userManager.currentUser?.hasRadar === true
  const radar = p.roomManager.radar
  const radarBorderWidth = (radar.radius * 2) / 105 // Proportion from figma (420 radar size / 4 border width)
  return (
    <View
      style={[styles.usersList, {width: p.width, height: p.height}]}
      accessibilityLabel={p.accessibilityLabel}>
      {/* Art Gallery Image Objects */}
      {p.roomManager.imageObjects && (
        <RoomObjectImage
          imageObjects={p.roomManager.imageObjects}
          widthMultiplier={1}
          onImagePress={p.onImagePress}
        />
      )}
      {hasRadar && (
        <RadarView
          accessibilityLabel='radarView'
          pointerEvents={'none'}
          style={[
            styles.radar,
            {
              borderRadius: radar.radius,
              borderWidth: radarBorderWidth,
              width: radar.radius * 2,
              height: radar.radius * 2,
              opacity: radar.isSubscriber ? 0.4 : 0.3,
            },
          ]}
        />
      )}

      {users.map((user) => {
        return (
          <Item
            onUserPress={p.onUserPress}
            key={user.id}
            user={user}
            roomManager={p.roomManager}
            index={user.isLocal ? 11 : 10}
            reactionStore={p.reactionsStore}
          />
        )
      })}

      {p.roomManager.shareScreenPosition && (
        <ShareScreenRoomObject
          allowToShare={isCurrentUserOnScene}
          userManager={p.userManager}
          roomManager={p.roomManager}
          zIndex={0}
        />
      )}

      {/* TimeBox */}
      {p.roomManager.timeBoxPosition && (
        <TimeBoxRoomObject
          roomManager={p.roomManager}
          userManager={p.userManager}
        />
      )}

      {hasRadar && targetSize !== undefined && (
        <UserPathTarget size={targetSize} zIndex={0} />
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  avatarView: {
    position: 'absolute',
  },
  videoViewContainer: {
    position: 'absolute',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    width: '100%',
    height: '100%',
    paddingBottom: ms(2),
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: ms(11),
    fontWeight: 'bold',
  },
  usersList: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 3,
  },
  radar: {
    position: 'absolute',
    zIndex: 0,
    borderColor: 'white',
    shadowColor: 'white',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 1.0,
  },
  devText: {
    fontSize: ms(8),
    color: 'white',
    bottom: ms(6),
    position: 'absolute',
    backgroundColor: 'black',
    textAlign: 'center',
  },
})

export default UsersList

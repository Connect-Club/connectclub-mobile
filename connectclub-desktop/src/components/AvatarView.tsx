import React, {CSSProperties, useEffect, useMemo, useRef} from 'react'
import {Animated, StyleProp, StyleSheet, View, ViewStyle} from 'react-native'

import AppTouchableOpacity from '../../../src/components/common/AppTouchableOpacity'
import {
  EmojiType,
  Participant,
} from '../../../src/components/screens/room/models/jsonModels'
import {RadarState} from '../../../src/components/screens/room/models/localModels'
import UserPathTarget from '../../../src/components/screens/room/UserPathTarget'
import UserScreenShareView from '../../../src/components/screens/room/UserScreenShareView'

import {setSizeForAvatar} from '../../../src/utils/avatar.utils'
import {profileShortName} from '../../../src/utils/userHelper'

import {useTheme} from '../../../src/theme/appTheme'

import {ParticipantState} from '../models/ParticipantState'
import ReactionIcon from './ReactionIcon'
import UserIcons from './UserIcons'

const BORDER_WIDTH_DELIMITER = 40

interface Props {
  readonly user: Participant
  readonly participantState: ParticipantState
  readonly reaction: EmojiType | undefined
  readonly mediaStream: MediaStream | null
  readonly isCurrentUser: boolean
  readonly isSharingScreen: boolean
  readonly hasRadar: boolean
  readonly radar: RadarState
  readonly onPress: () => void
  readonly scale: number
}

const AvatarView: React.FC<Props> = ({
  user,
  participantState,
  reaction,
  mediaStream,
  isCurrentUser,
  hasRadar,
  radar,
  onPress,
  isSharingScreen,
  scale,
}) => {
  const {colors} = useTheme()
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const scaleAnim = useRef(new Animated.Value(1)).current

  const videoElement = videoRef.current
  if (videoElement) {
    if (mediaStream == null) {
      videoElement.pause()
      videoElement.srcObject = null
    } else if (videoElement.srcObject == null) {
      videoElement.srcObject = mediaStream
    }
  }

  // we should render audio only if a user has disabled video
  // otherwise, video element handles sound
  // P.S. audio from the current user is always muted!
  const shouldRenderAudio =
    mediaStream != null && !user.video && user.audio && !isCurrentUser

  const audioElement = audioRef.current
  if (audioElement) {
    if (mediaStream == null || user.video) {
      audioElement.pause()
      audioElement.srcObject = null
    } else if (audioElement.srcObject == null) {
      audioElement.srcObject = mediaStream
    }
  }

  const iconsScale = 0.2
  let borderColor = user.isLocal ? colors.accentPrimary : colors.activeAccent
  if (!user.isLocal) {
    if (user.inRadar) borderColor = colors.activeAccent
    else if (!user.inRadar) borderColor = colors.chatBgMyMessage
  }

  // browsers work badly with float values in styles
  // so, all values must be even before all manipulations to have even values for all styles
  const toClosestEven = (value: number): number => 2 * Math.round(value / 2)

  const roundedUserSize = toClosestEven(user.size)

  const borderWidth = toClosestEven(roundedUserSize / BORDER_WIDTH_DELIMITER)
  const avatarSize = roundedUserSize - borderWidth * 2
  const borderRadius = roundedUserSize / 2

  const {x, y, duration, audioLevel} = participantState

  console.log('audio level of ', user.id, 'is', audioLevel)

  const viewContainerStyle: StyleProp<ViewStyle> = useMemo(
    () => ({
      borderColor,
      borderWidth,
      borderRadius,
      transition: `left ${duration}s linear, top ${duration}s linear`,
      // transform: [{scale: scaleAnim ?? 1}],
      left: `${x}%`,
      top: `${y}%`,
    }),
    [borderColor, borderWidth, borderRadius, x, y, duration],
  )

  useEffect(() => {
    Animated.timing(scaleAnim, {
      toValue: audioLevel ?? 1,
      duration: 300,
      useNativeDriver: false,
    }).start()
  }, [audioLevel])

  const videoStyle: StyleProp<CSSProperties> = useMemo(
    () => ({
      width: avatarSize,
      height: avatarSize,
      position: 'absolute',
      zIndex: 1,
      objectFit: 'cover',
      transform: 'rotateY(180deg)',
    }),
    [avatarSize],
  )

  const userAvatar = useMemo(() => {
    const uri = setSizeForAvatar(
      user.avatar,
      avatarSize * scale,
      avatarSize * scale,
    )

    return <img src={uri} alt={`${user.name} ${user.surname}`} />
  }, [avatarSize])

  const targetPath = useMemo(() => {
    if (!hasRadar) return null

    return (
      <View style={[styles.target, {left: `${x}%`, top: `${y}%`}]}>
        <UserPathTarget size={roundedUserSize} zIndex={0} />
      </View>
    )
  }, [x, y, hasRadar, avatarSize])

  const renderAvatarContent = (): React.ReactNode => {
    if (!user.avatar) {
      return (
        <div
          style={{
            backgroundColor: 'white',
            borderRadius,
            textAlign: 'center',
            lineHeight: `${avatarSize}px`,
          }}>
          {profileShortName(user.name, user.surname)}
        </div>
      )
    }

    return userAvatar
  }

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          viewContainerStyle,
          {transform: [{scale: scaleAnim}]},
        ]}>
        {shouldRenderAudio && (
          <audio
            style={{
              display: 'none',
            }}
            ref={audioRef}
            autoPlay={true}
            playsInline={true}
            controls={false}
          />
        )}

        <AppTouchableOpacity onPress={onPress}>
          <View
            style={[
              styles.avatarContainer,
              {
                width: avatarSize,
                height: avatarSize,
                borderRadius,
              },
            ]}>
            {renderAvatarContent()}

            {mediaStream && user.video && (
              <video
                style={videoStyle}
                ref={videoRef}
                muted={isCurrentUser}
                autoPlay
                playsInline
                controls={false}
              />
            )}
          </View>
        </AppTouchableOpacity>

        {!reaction && (
          <UserIcons
            isMediaIconsVisible
            parentSize={roundedUserSize}
            scale={iconsScale}
            isAdmin={user.isAdmin}
            isVideoEnabled={user.video}
            isAudioEnabled={user.audio}
          />
        )}

        {reaction && (
          <ReactionIcon
            parentSize={roundedUserSize}
            scale={0.5}
            reaction={reaction}
          />
        )}

        {hasRadar && (
          <View
            style={[
              styles.radar,
              {
                width: radar.radius * 2,
                height: radar.radius * 2,
                top: -radar.radius + avatarSize / 2,
                left: -radar.radius + avatarSize / 2,
                borderRadius: radar.radius,
                opacity: radar.isSubscriber ? 0.3 : 0.2,
              },
            ]}
          />
        )}

        {isSharingScreen && (
          <UserScreenShareView parentSize={user.size} scale={0.35} />
        )}
      </Animated.View>

      {hasRadar && targetPath}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 2,
  },
  target: {
    position: 'absolute',
    zIndex: 1,
  },
  avatarContainer: {
    overflow: 'hidden',
  },
  radar: {
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    position: 'absolute',
    zIndex: -1,
    pointerEvents: 'none',
  },
})

export default AvatarView

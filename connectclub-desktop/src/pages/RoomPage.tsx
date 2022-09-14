import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import i18n from 'i18next'
import {observer} from 'mobx-react'
import React, {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {Image, StyleSheet, View} from 'react-native'
import {
  ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
} from 'react-zoom-pan-pinch'

import {api} from '../../../src/api/api'

import BaseInlineBottomSheet, {
  AppBottomSheet,
} from '../../../src/components/BaseInlineBottomSheet'
import LoadRoomView from '../../../src/components/common/LoadRoomView'
import {ProfileRoomBottomButtonsProps} from '../../../src/components/screens/profileScreen/ProfileRoomBottomButtons'
import EmojisListView, {
  emojiListItemHeight,
} from '../../../src/components/screens/room/EmojisListView'
import FriendsBottomSheetListView from '../../../src/components/screens/room/FriendsBottomSheetListView'
import UserManager from '../../../src/components/screens/room/jitsi/UserManager'
import ManageRoomListView from '../../../src/components/screens/room/ManageRoomListView'
import {
  EmojiType,
  Participant,
} from '../../../src/components/screens/room/models/jsonModels'
import {logJS} from '../../../src/components/screens/room/modules/Logger'
import RaisedHandsListView from '../../../src/components/screens/room/RaisedHandsListView'
import RoomObjectImage from '../../../src/components/screens/room/RoomObjectImage'

import {OnChangeRoomParams} from '../../../src/models'

import {
  askLeaveAsLastModerator,
  askLeaveAsLastModeratorWithSpeakers,
  LeaveDialogResult,
} from '../../../src/utils/alerts'
import {ms} from '../../../src/utils/layout.utils'
import {popToTop} from '../../../src/utils/navigation.utils'
import {getRoomLink, shareLink} from '../../../src/utils/sms.utils'
import {toastHelper} from '../../../src/utils/ToastHelper'

import {
  appEventEmitter,
  hideLoading,
  roomHasEndedFor,
  roomHasEndedForParticipants,
} from '../../../src/appEventEmitter'
import {storage} from '../../../src/storage'

import AvatarView from '../components/AvatarView'
import ShareScreenRoomObjectWeb from '../components/room/ShareScreenRoomObjectWeb'
import StagePanel from '../components/room/StagePanel'
import UserControlButtonsWeb from '../components/UserControlButtonsWeb'
import {ParticipantState} from '../models/ParticipantState'
import {RoomStore} from '../stores/RoomStore'
import {getRelativeParticipantState} from '../utils/user-position.utils'
import {useRoomDependencies} from './roomDependencies'

interface ScreenProps {
  id: string
  pass: string
}

type ScreenRouteProp = RouteProp<{Screen: ScreenProps}, 'Screen'>

const transformWrapperStyle: CSSProperties = {
  maxWidth: '100%',
  maxHeight: '100vh',
}

const prepareForLeave = async (
  roomStore: RoomStore,
  userManager: UserManager,
): Promise<'logoutAndExit' | 'exit' | 'destroyRoomAndExit' | 'cancel'> => {
  if (userManager.isNotAdmin) return 'logoutAndExit'

  if (await roomStore.isThereOtherAdmin()) return 'logoutAndExit'
  const otherSpeaker = roomStore.isThereOtherSpeaker()
  let res: LeaveDialogResult

  if (otherSpeaker) {
    // Есть другой спикер
    res = await askLeaveAsLastModeratorWithSpeakers(i18n.t.bind(i18n))
  } else {
    // Никого больше нет
    res = await askLeaveAsLastModerator(i18n.t.bind(i18n))
  }

  switch (res) {
    case 'quietly':
      // Передача полномочий
      if (otherSpeaker) roomStore.addAdmin(otherSpeaker)
      await roomStore.destroy()
      return 'exit'
    case 'end':
      return 'destroyRoomAndExit'
    case 'cancel':
      return 'cancel'
  }
}

const RoomPage: React.FC = () => {
  const currentUser = storage.currentUser

  const emojisBottomSheetRef = useRef<AppBottomSheet>(null)
  const bottomSheetRaisedHandsRef = useRef<AppBottomSheet>(null)
  const inviteBottomSheetRef = useRef<AppBottomSheet>(null)
  const manageRoomBottomSheetRef = useRef<AppBottomSheet>(null)
  const zoomViewRef = useRef<ReactZoomPanPinchRef>(null)

  const {params} = useRoute<ScreenRouteProp>()
  const navigation = useNavigation()
  const fullyDestroyed = useRef(false)
  const userIdWhoEndRoom = useRef<string | null>(null)
  const leaveRoomManually = useRef(false)
  const isBackgroundPanning = useRef(false)
  const imageRef = useRef<Image>(null)

  const [isBackgroundLoaded, setBackgroundLoaded] = useState(false)
  const [isWebSocketsLoading, setWebSocketsLoading] = useState(true)

  const {deps, destroyDeps} = useRoomDependencies(currentUser?.id ?? null)

  const {roomStore, userManager, reactionsStore, mediaStore} = deps

  useEffect(() => {
    if (!currentUser)
      return () => logJS('error', 'RoomPage no current user - destroy room')

    const establishConnection = async (userId: string) => {
      const response = await roomStore.connect({
        roomId: params.id,
        roomPass: params.pass,
        endpoint: userId,
      })

      if (response === 'connected') {
        return setWebSocketsLoading(false)
      }
      if (response === 'notPermitted') return logoutAndExit()
      simpleQuitRoom()
    }

    establishConnection(currentUser.id)

    const finishCleaner = appEventEmitter.once('finishRoom', simpleQuitRoom)
    const leaveRoomCleaner = appEventEmitter.once('leaveRoom', leaveRoom)

    const onChangeRoomCleaner = appEventEmitter.once(
      'onChangeRoom',
      async (changeRoomParams: OnChangeRoomParams) => {
        if (!api.isConnectedToNetwork) {
          return toastHelper.error('notAllowedToLogout')
        }
        const isRoomTheSame =
          !fullyDestroyed.current &&
          roomStore.getCurrentRoomId() === changeRoomParams.roomId
        if (isRoomTheSame) {
          hideLoading()
          logJS('debug', 'RoomScreen.onChangeRoomCleaner', 'roomIsTheSame')
          return
        }

        const isAllowGoToNextRoom = true
        let error: any = null

        const result = await prepareForLeave(roomStore, userManager)
        logJS(
          'warning',
          'RoomScreen.onChangeRoomCleaner',
          'prepareForLeave result',
          result,
        )
        switch (result) {
          case 'cancel':
            return hideLoading()
          case 'destroyRoomAndExit':
            await destroyRoomAndExit()
            break
          case 'exit':
            await exit()
            break
          case 'logoutAndExit':
            await logoutAndExit()
            break
        }
        changeRoomParams.callback(isAllowGoToNextRoom, error)
      },
    )

    return () => {
      console.log('cleanup room screen', params)

      finishCleaner()
      onChangeRoomCleaner()
      leaveRoomCleaner()
      appEventEmitter.trigger('roomDestroyed')
    }
  }, [])

  const logoutAndExit = useCallback(async () => {
    logJS('debug', 'RoomScreen.logoutAndExit')
    await destroyDeps()
    exit()
  }, [])

  const exit = useCallback(() => {
    // appEventEmitter.trigger('closeRoom')
    popToTop(navigation)
    appEventEmitter.trigger('refreshMainFeed')
  }, [])

  const destroyRoomAndExit = useCallback(async () => {
    if (!api.isConnectedToNetwork) {
      toastHelper.error('notAllowedToLogout')
      return
    }

    manageRoomBottomSheetRef.current?.dismiss()
    userIdWhoEndRoom.current = userManager.currentUserId
    await destroyDeps()
    await api.endRoom(params.id)
    fullyDestroyed.current = true
    exit()
  }, [])

  const simpleQuitRoom = useCallback(() => {
    logJS(
      'debug',
      'RoomScreen.simpleQuitRoom',
      'leaveRoomManually',
      leaveRoomManually.current,
    )
    hideLoading()
    if (userIdWhoEndRoom.current === deps.userManager.currentUserId) {
      roomHasEndedFor()
    } else {
      roomHasEndedForParticipants()
    }
    if (!leaveRoomManually.current) logoutAndExit()
  }, [])

  const leaveRoom = async () => {
    logJS('debug', 'RoomScreen.leaveRoom', userManager.user)
    if (!api.isConnectedToNetwork) {
      return toastHelper.error('notAllowedToLogout')
    }

    leaveRoomManually.current = true
    const result = await prepareForLeave(roomStore, deps.userManager)
    switch (result) {
      case 'cancel':
        return
      case 'destroyRoomAndExit':
        return destroyRoomAndExit()
      case 'exit':
        return exit()
      case 'logoutAndExit':
        return logoutAndExit()
    }
  }

  const onUserPress = useCallback(
    (userId: string): void => {
      const userAsSpeaker = userManager.findSpeakerById(userId)
      const user =
        userAsSpeaker ?? roomStore.listeners.find((x) => x.id === userId)

      if (user == null) return

      const roomParams: ProfileRoomBottomButtonsProps = {
        userId: user.id,
        roomType: roomStore.getRoomType(),
        isCurrentUser: user.id === currentUser?.id,
        isUserAdmin: user.isAdmin,
        isUserOwner: roomStore.getOwnerId() === user.id,
        userMode: userAsSpeaker != null ? 'room' : 'popup',
        userIsLocal: user.isLocal,
        isCurrentUserAdmin: userManager!.isAdmin,
        audioEnabled: userAsSpeaker?.audio === true,
        videoEnabled: userAsSpeaker?.video === true,
      }

      navigation.navigate('ProfileScreenModal', {
        userId: userId,
        roomName: roomStore.getCurrentRoomId(),
        roomBottomProps: roomParams,
        navigationRoot: 'RoomScreen',
      })
    },
    [currentUser?.id, navigation, roomStore, userManager],
  )

  const onUserPressInternal = useCallback(
    ({userId}) => {
      onUserPress(userId)
    },
    [onUserPress],
  )

  const background = roomStore.roomBackground

  const onClickHandler = (evt: any): void => {
    if (isBackgroundPanning.current) return

    evt.preventDefault()

    if (background == null) return

    const zoomState = zoomViewRef.current?.state
    if (zoomState == null) return

    const {scale} = zoomState

    const target = imageRef.current as any
    const rect = target.getBoundingClientRect()
    const relX = (evt.clientX - rect.left) / scale
    const relY = (evt.clientY - rect.top) / scale

    if (currentUser) {
      roomStore.moveUser(relX, relY)
    }
  }

  const getUserPosition = (user: Participant): ParticipantState => {
    const userPosition = roomStore.participantStates[user.id]

    if (userPosition == null || background == null) {
      return {x: 5, y: 5}
    }

    const {adaptiveWidth, adaptiveHeight} = background

    return getRelativeParticipantState(
      userPosition,
      user.size,
      adaptiveWidth,
      adaptiveHeight,
    )
  }

  const onInviteFriendsToRoomPress = useCallback(() => {
    inviteBottomSheetRef.current?.present()
  }, [])

  const onManageRoomPress = useCallback(() => {
    manageRoomBottomSheetRef.current?.present()
  }, [])

  const handsProvider = useCallback(() => {
    return roomStore.hands()
  }, [roomStore])

  const adminsProvider = useCallback(() => {
    return roomStore.admins()
  }, [roomStore])

  const onRaiseHandPress = () => {
    const user = userManager?.user

    if (user == null) return

    if (user.isAdmin) {
      bottomSheetRaisedHandsRef.current?.present()
    } else {
      if (user.isHandRaised) {
        roomStore.handDown('user')
      } else {
        roomStore.handUp()
      }
    }
  }

  const onShowEmojisList = useCallback(() => {
    const {currentUserId} = userManager

    if (reactionsStore.hasReaction(currentUserId)) {
      reactionsStore.resetReaction(currentUserId)
      roomStore.sendEndReaction(currentUserId)
      return
    }

    emojisBottomSheetRef.current?.present()
  }, [])

  const makeRoomPublic = useCallback(() => {
    roomStore.makeRoomPublic()
  }, [])

  const onEmojiItemPress = (type: EmojiType) => {
    emojisBottomSheetRef.current?.dismiss()

    roomStore.sendReaction(type)
    reactionsStore.setReaction(currentUser!.id, type, 10)
  }

  const roomImageHeight = background?.adaptiveHeight ?? 1
  const roomImageWidth = background?.adaptiveWidth ?? 1
  const roomUsers = userManager.roomUsers ?? []

  const imageBackground = useMemo(() => {
    if (background?.source == null) {
      return null
    }

    return (
      <Image
        source={background.source}
        ref={imageRef}
        onLoadEnd={() => setBackgroundLoaded(true)}
        resizeMode={'contain'}
        style={[
          StyleSheet.absoluteFill,
          {
            height: roomImageHeight,
            width: roomImageWidth,
          },
        ]}
      />
    )
  }, [background])

  const transformWrapperContentStyle: CSSProperties = useMemo(
    () => ({
      height: roomImageHeight,
      width: roomImageWidth,
      flex: 1,
      position: 'relative',
      justifyContent: 'center',
    }),
    [roomImageHeight, roomImageWidth],
  )

  const isLoadingInProgress = isWebSocketsLoading || !isBackgroundLoaded

  return (
    <>
      {isLoadingInProgress && <LoadRoomView />}

      <View style={styles.container}>
        {background != null && (
          <div onClick={(e) => onClickHandler(e)}>
            <TransformWrapper
              ref={zoomViewRef}
              limitToBounds
              onPanningStart={() => {
                // Cleanup `isBackgroundPanning` in `onPanningStart` because this event fires before `onClickHandler` (it is mousedown, actually)
                // For example, panning is done and `isBackgroundPanning === true`. The next click happens: `onPanningStart` will be called before `onClickHandler`
                // Cleanup cannot be placed in:
                // - `onPanningStop` - because it fires before `onClickHandler`
                // - `onClickHandler` - because sometimes panning can be finished outside the window and cleanup won't be done at all, so the next click won't fire

                isBackgroundPanning.current = false
              }}
              onPanning={() => (isBackgroundPanning.current = true)}
              initialScale={
                background.initialZoom === 0 ? 1 : background.initialZoom
              }
              minScale={background.minZoom}
              maxScale={background.maxZoom}
              doubleClick={{
                disabled: true,
              }}
              wheel={{
                step: background.multiplier,
                touchPadDisabled: true,
              }}>
              <TransformComponent
                wrapperStyle={transformWrapperStyle}
                contentStyle={transformWrapperContentStyle}>
                {imageBackground}

                {!isLoadingInProgress && (
                  <>
                    {roomUsers.map((user) => {
                      const isCurrentUser =
                        user.id === userManager.currentUserId
                      const mediaStream = isCurrentUser
                        ? mediaStore.currentUserStream
                        : mediaStore.streams[user.id]
                      const isScreenSharingUser =
                        user.id === mediaStore.screenSharingUserId

                      const hasRadar =
                        isCurrentUser &&
                        userManager.currentUser?.hasRadar === true

                      const reaction = reactionsStore.reactions.get(
                        user.id,
                      )?.type

                      return (
                        <AvatarView
                          key={user.id}
                          user={user}
                          scale={background?.maxZoom ?? 1}
                          participantState={getUserPosition(user)}
                          reaction={reaction}
                          isCurrentUser={isCurrentUser}
                          hasRadar={hasRadar}
                          radar={roomStore.radar}
                          mediaStream={mediaStream}
                          isSharingScreen={isScreenSharingUser}
                          onPress={() => onUserPress(user.id)}
                        />
                      )
                    })}

                    {roomStore.shareScreenPosition && (
                      <ShareScreenRoomObjectWeb
                        roomId={params.id}
                        settings={roomStore.shareScreenPosition}
                        allowToShare={userManager.user.mode === 'room'}
                        heightMultiplier={background!.multiplier}
                        widthMultiplier={background!.multiplier}
                        mediaStream={mediaStore.getScreenShareStream()}
                      />
                    )}

                    {roomStore.imageObjects && (
                      <RoomObjectImage
                        imageObjects={roomStore.imageObjects}
                        widthMultiplier={background!.multiplier}
                      />
                    )}
                  </>
                )}
              </TransformComponent>
            </TransformWrapper>
          </div>
        )}

        {!isLoadingInProgress && (
          <>
            <UserControlButtonsWeb
              containerWidth={roomImageWidth}
              withSpeakers={roomStore.withSpeakers}
              isConnected={userManager.isConnected}
              currentUserId={currentUser!.id}
              userReactionsStore={reactionsStore}
              onLeavePress={leaveRoom}
              onInviteFriendsToRoomPress={onInviteFriendsToRoomPress}
              onEmojiPress={onShowEmojisList}
              currentUser={userManager?.user ?? null}
              raisedHandsCount={roomStore.raisedHandsCount}
              onRaiseHandPress={onRaiseHandPress}
              onMoveToStage={() => roomStore.moveToStage(currentUser!.id)}
              onManageRoomPress={onManageRoomPress}
              onAudioToggle={mediaStore.toggleAudio}
              onVideoToggle={mediaStore.toggleVideo}
              currentUserMediaState={mediaStore.currentUserMediaState}
            />

            {roomStore.withSpeakers && (
              <View style={styles.stagePanel}>
                <StagePanel
                  roomDescription={roomStore.getRoomDescription()}
                  speakers={roomUsers}
                  listeners={roomStore.listeners ?? []}
                  onUserPress={onUserPressInternal}
                  reactions={reactionsStore.reactions}
                />
              </View>
            )}

            <BaseInlineBottomSheet
              ref={bottomSheetRaisedHandsRef}
              snaps={['90%']}>
              <RaisedHandsListView
                handsProvider={handsProvider}
                callToStage={(userId) => roomStore.callToStage(userId)}
                userManager={userManager!}
              />
            </BaseInlineBottomSheet>

            <BaseInlineBottomSheet
              ref={emojisBottomSheetRef}
              height={emojiListItemHeight + ms(16)}>
              <EmojisListView onEmojiPress={onEmojiItemPress} />
            </BaseInlineBottomSheet>

            <BaseInlineBottomSheet snaps={['90%']} ref={inviteBottomSheetRef}>
              <FriendsBottomSheetListView roomId={params.id} />
            </BaseInlineBottomSheet>

            <BaseInlineBottomSheet
              snaps={['90%']}
              ref={manageRoomBottomSheetRef}>
              <ManageRoomListView
                ownerId={roomStore.getOwnerId()}
                isPrivateRoom={roomStore.isPrivateRoom}
                adminsProvider={adminsProvider}
                endRoom={destroyRoomAndExit}
                userManager={userManager}
                makeRoomPublic={makeRoomPublic}
              />
            </BaseInlineBottomSheet>
          </>
        )}
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    // @ts-ignore
    // for some reason, if the component is used as part of react navigation - the scroll bar doesn't appear
    overflow: 'auto',
  },
  image: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
  },
  stagePanel: {
    flex: 1,
    height: '100%',
  },
})

export default observer(RoomPage)

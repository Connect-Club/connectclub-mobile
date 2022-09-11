import {useFocusEffect} from '@react-navigation/native'
import i18n from 'i18next'
import {observer} from 'mobx-react'
import moment from 'moment'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {BackHandler, Dimensions, StatusBar, StyleSheet} from 'react-native'
import ImagePicker from 'react-native-image-crop-picker'
import InAppReview from 'react-native-in-app-review'
import Share from 'react-native-share'

import {analytics} from '../Analytics'
import {api} from '../api/api'
import {
  appEventEmitter,
  hideLoading,
  roomHasEndedFor,
  roomHasEndedForParticipants,
  showEventDialog,
} from '../appEventEmitter'
import BaseInlineBottomSheet, {
  AppBottomSheet,
} from '../components/BaseInlineBottomSheet'
import LoadRoomView from '../components/common/LoadRoomView'
import {ProfileRoomBottomButtonsProps} from '../components/screens/profileScreen/ProfileRoomBottomButtons'
import AppStateManager from '../components/screens/room/AppStateManager'
import EmojisListView, {
  emojiListItemHeight,
} from '../components/screens/room/EmojisListView'
import FriendsBottomSheetListView from '../components/screens/room/FriendsBottomSheetListView'
import {useActiveRoom} from '../components/screens/room/hooks/useActiveRoom'
import {RoomManager} from '../components/screens/room/jitsi/RoomManager'
import UserManager from '../components/screens/room/jitsi/UserManager'
import ManageRoomListView from '../components/screens/room/ManageRoomListView'
import {EmojiType} from '../components/screens/room/models/jsonModels'
import {CaptureScreenShot} from '../components/screens/room/modules/CaptureScreenShot'
import {logJS} from '../components/screens/room/modules/Logger'
import FloatingReactions from '../components/screens/room/nativeview/RTCFloatingReactionsView'
import RoomBackgroundView from '../components/screens/room/nativeview/RTCRoomBackground'
import RoomLayoutView from '../components/screens/room/nativeview/RTCZoomView'
import RaisedHandsListView from '../components/screens/room/RaisedHandsListView'
import RoomBottomContainer from '../components/screens/room/RoomBottomContainer'
import {useRoomDeps} from '../components/screens/room/roomDeps'
// @ts-ignore
import UserControlButtons from '../components/screens/room/UserControlButtons'
import UsersList from '../components/screens/room/UsersList'
import {screenScale} from '../components/screens/room/Utils'
import {Clipboard} from '../components/webSafeImports/webSafeImports'
import {
  BottomSheetImage,
  BottomSheetUserEvent,
  OnChangeRoomParams,
} from '../models'
import {storage} from '../storage'
import {useTheme} from '../theme/appTheme'
import {
  askLeaveAsLastModerator,
  askLeaveAsLastModeratorWithSpeakers,
  LeaveDialogResult,
} from '../utils/alerts'
import {ms} from '../utils/layout.utils'
import {getEventLink, getRoomLink, shareLink} from '../utils/sms.utils'
import {toastHelper} from '../utils/ToastHelper'
import RoomImageBottomSheetScreen from './RoomImageBottomSheetScreen'

const prepareForLeave = async (
  roomManager: RoomManager,
  userManager: UserManager,
): Promise<'logoutAndExit' | 'exit' | 'destroyRoomAndExit' | 'cancel'> => {
  if (userManager.isNotAdmin) return 'logoutAndExit'
  // There's another admin
  if (await roomManager.isThereOtherAdmin()) return 'logoutAndExit'
  const otherSpeaker = roomManager.isThereOtherSpeaker()
  let res: LeaveDialogResult
  if (otherSpeaker) {
    // There's someone left
    res = await askLeaveAsLastModeratorWithSpeakers(i18n.t.bind(i18n))
  } else {
    // No one else in the room
    res = await askLeaveAsLastModerator(i18n.t.bind(i18n))
  }
  logJS(
    'debug',
    'RoomScreen Leave room result:',
    res,
    'otherSpeaker',
    otherSpeaker,
  )
  switch (res) {
    case 'quietly':
      // Передача полномочий
      if (otherSpeaker) roomManager.addAdmin(otherSpeaker)
      await roomManager.destroy()
      return 'exit'
    case 'end':
      return 'destroyRoomAndExit'
    case 'cancel':
      return 'cancel'
  }
}

const getRoomLinkInternal = (
  roomId: string,
  roomPass: string,
  roomManager: RoomManager,
  inviteCode?: string,
) => {
  if (roomManager.roomEventId) {
    logJS('debug', 'get room event link', roomManager.roomEventId)
    return getEventLink(
      roomManager.roomEventId,
      roomManager.roomClubId?.slug,
      roomManager.roomClubId?.id,
      'share_event_room',
      inviteCode,
    )
  }
  logJS('debug', 'get room link', roomManager.roomEventId)
  return getRoomLink(roomId, roomPass, inviteCode)
}

export interface RoomParams {
  roomId: string
  roomPass: string
  eventScheduleId?: string
}

const RoomScreen: React.FC<RoomParams> = (params) => {
  const {colors} = useTheme()
  const currentUser = storage.currentUser
  const fullyDestroyed = useRef(false)
  const leaveRoomManually = useRef(false)

  const bottomSheetRaisedHandsRef = useRef<AppBottomSheet>(null)
  const emojisBottomSheetRef = useRef<AppBottomSheet>(null)
  const inviteBottomSheetRef = useRef<AppBottomSheet>(null)
  const imageBottomSheetRef = useRef<AppBottomSheet>(null)
  const manageRoomBottomSheetRef = useRef<AppBottomSheet>(null)
  const userIdWhoEndRoom = useRef<string | null>(null)

  const [roomImage, setRoomImage] = useState<BottomSheetImage | null>(null)
  const [isBackgroundLoaded, setBackgroundLoaded] = useState(false)
  const [isWebSocketsLoading, setWebSocketsLoading] = useState(true)
  const isFocus = useRef(false)

  const {deps, destroyDeps} = useRoomDeps()
  useActiveRoom(params.roomId)

  // Init
  useEffect(() => {
    if (!currentUser)
      return () => logJS('error', 'RoomScreen no currentUser, destroy room')

    const backListener = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (!isFocus.current) return false
        leaveRoom()
        return true
      },
    )

    if (roomImage) imageBottomSheetRef.current?.present()

    const establishConnection = async (userId: string) => {
      const response = await deps.roomManager.connect({
        roomId: params.roomId,
        roomPass: params.roomPass,
        endpoint: userId,
      })
      logJS(
        'debug',
        `RoomScreen.establishConnection for userId:`,
        userId,
        `response:`,
        response,
      )

      if (response.type === 'connected') return setWebSocketsLoading(false)
      if (response.type === 'notPermitted') return logoutAndExit()
      if (response.type === 'nft_required') {
        logoutAndExit()
        if (response.eventId) {
          showEventDialog(response.eventId)
        }
        return
      }
      simpleQuiteRoom()
    }

    if (isWebSocketsLoading) {
      establishConnection(currentUser.id)
    }

    const finishCleaner = appEventEmitter.once('finishRoom', simpleQuiteRoom)

    const leaveRoomCleaner = appEventEmitter.once('leaveRoom', () => {
      console.log('leave handle')
      leaveRoom()
    })

    const onChangeRoomCleaner = appEventEmitter.once(
      'onChangeRoom',
      async (changeRoomParams: OnChangeRoomParams) => {
        if (!api.isConnectedToNetwork) {
          return toastHelper.error('notAllowedToLogout')
        }
        const isRoomTheSame =
          !fullyDestroyed.current &&
          deps.roomManager.getCurrentRoomId() === changeRoomParams.roomId
        if (isRoomTheSame) {
          hideLoading()
          logJS('debug', 'RoomScreen.onChangeRoomCleaner', 'roomIsTheSame')
          return
        }

        const isAllowGoToNextRoom = true
        let error: any = null

        const result = await prepareForLeave(deps.roomManager, deps.userManager)
        logJS(
          'debug',
          'RoomScreen.onChangeRoomCleaner',
          'prepareForLeave result:',
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
      backListener.remove()
      onChangeRoomCleaner()
      leaveRoomCleaner()
      appEventEmitter.trigger('roomDestroyed')
    }
  }, [roomImage])

  useFocusEffect(
    useCallback(() => {
      isFocus.current = true
      return () => (isFocus.current = false)
    }, []),
  )

  function sendEventWithRoomInfo(eventName: string) {
    analytics.sendEvent(eventName, {
      roomId: params.roomId,
      eventId: params.eventScheduleId,
    })
  }

  const destroyRoomAndExit = useCallback(async () => {
    if (!api.isConnectedToNetwork) {
      toastHelper.error('notAllowedToLogout')
      return
    }
    manageRoomBottomSheetRef.current?.dismiss()
    userIdWhoEndRoom.current = deps.userManager.currentUserId
    await destroyDeps()
    await api.endRoom(params.roomId)
    fullyDestroyed.current = true
    logJS('debug', 'RoomScreen.destroyRoomAndExit')
    exit()
  }, [])

  const simpleQuiteRoom = useCallback(() => {
    logJS(
      'debug',
      'RoomScreen.simpleQuiteRoom',
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

  const exit = useCallback(() => {
    logJS(
      'debug',
      'In exit, app view available for user?',
      InAppReview.isAvailable(),
      'last dialog shown',
      storage.lastShownRateAppDialog,
    )
    if (InAppReview.isAvailable()) {
      if (
        storage.lastShownRateAppDialog === -1 ||
        moment().diff(moment.unix(storage.lastShownRateAppDialog), 'days') >= 15
      )
        InAppReview.RequestInAppReview()
          .then((hasFlowFinishedSuccessfully) => {
            logJS(
              'debug',
              'got presented with in app review?',
              hasFlowFinishedSuccessfully,
            )
            if (hasFlowFinishedSuccessfully) {
              storage.setLastShownRateAppDialog(moment().unix())
            }
          })
          .catch((e) => {
            logJS('error', e)
          })
    }
    appEventEmitter.trigger('closeRoom')
    appEventEmitter.trigger('refreshMainFeed')
  }, [])

  const onEmojiPress = useCallback(async () => {
    sendEventWithRoomInfo('click_emoji_button')
    const currentUserId = deps.userManager.currentUserId
    if (deps.reactionsStore.hasReaction(currentUserId)) {
      deps.reactionsStore.resetReaction(currentUserId)
      deps.roomManager.sendEndReaction(currentUserId)
      return
    }
    emojisBottomSheetRef.current?.present()
  }, [])

  const onSelfiePress = useCallback(async () => {
    sendEventWithRoomInfo('click_take_screenshot_button')
    try {
      const {width, height} = Dimensions.get('window')
      await deps.roomManager.appModule.switchScreenShotMode(true)
      const screenShot = await CaptureScreenShot.takeScreenShot()
      await deps.roomManager.appModule.switchScreenShotMode(false)
      const response = await ImagePicker.openCropper({
        path: screenShot,
        width: width * screenScale,
        height: height * screenScale,
        mediaType: 'photo',
        compressImageQuality: 1,
        freeStyleCropEnabled: true,
      })
      await Share.open({
        title: deps.roomManager.roomSettings?.description ?? '',
        message: deps.roomManager.roomSettings?.description ?? '',
        url: response.path,
      })
    } catch {}
  }, [])

  const logoutAndExit = useCallback(async () => {
    logJS('debug', 'RoomScreen.logoutAndExit')
    await destroyDeps()
    exit()
  }, [])

  const leaveRoom = async () => {
    logJS('debug', 'RoomScreen.leaveRoom user:', deps.userManager.user)
    if (!api.isConnectedToNetwork) {
      return toastHelper.error('notAllowedToLogout')
    }

    leaveRoomManually.current = true
    const result = await prepareForLeave(deps.roomManager, deps.userManager)
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

  const collapseRoom = useCallback(() => {
    sendEventWithRoomInfo('click_collapse_room_button')
    appEventEmitter.trigger('collapseRoom', true)
  }, [])

  const leaveRoomPress = useCallback(() => {
    sendEventWithRoomInfo('click_leave_room_button')
    appEventEmitter.trigger('leaveRoom')
  }, [])

  const backgroundLoaded = () => {
    setBackgroundLoaded(true)
  }

  const openRaisedHandsBottomSheet = useCallback(() => {
    bottomSheetRaisedHandsRef.current?.present()
  }, [])

  const onManageRoomPress = useCallback(() => {
    sendEventWithRoomInfo('click_manage_room_button')
    manageRoomBottomSheetRef.current?.present()
  }, [])

  const onToggleCameraPress = () => {
    sendEventWithRoomInfo('click_toggle_camera_button')
    deps.roomManager.appModule.switchCamera()
  }

  const onEmojiItemPress = useCallback(
    async (type: EmojiType) => {
      analytics.sendEvent('click_choose_emoji_button', {
        roomId: params.roomId,
        eventId: params.eventScheduleId,
        type,
      })
      emojisBottomSheetRef.current?.dismiss()
      deps.roomManager.sendReaction(type)
      deps.reactionsStore.setReaction(currentUser?.id!, type, 10)
    },
    [currentUser, deps.reactionsStore, deps.roomManager, params.roomId],
  )

  const onUserPress = useCallback(
    ({nativeEvent: {user}}: BottomSheetUserEvent) => {
      const speaker = deps.userManager.usersMap.get(user.id)
      logJS('debug', 'RoomScreen.onUserPress userId:', user.id)
      const roomParams: ProfileRoomBottomButtonsProps = {
        userId: user.id,
        roomType: deps.roomManager.getRoomType(),
        isCurrentUser: user.id === storage.currentUser?.id.toString(),
        isUserAdmin: user.isAdmin,
        isUserOwner: user.isOwner,
        userMode: user.mode,
        userIsLocal: user.isLocal,
        isCurrentUserAdmin: deps.userManager.isAdmin,
        audioEnabled: speaker?.audio === true,
        videoEnabled: speaker?.video === true,
      }

      appEventEmitter.trigger('navigate', 'ProfileScreenModal', {
        userId: user.id,
        roomName: deps.roomManager.getCurrentRoomId(),
        roomBottomProps: roomParams,
      })
    },
    [],
  )

  const onImagePress = useCallback((image: BottomSheetImage) => {
    logJS('debug', 'RoomScreen.onImagePress uri:', image.imageUri)
    setRoomImage(image)
  }, [])

  const onInviteFriendsToRoomPress = useCallback(() => {
    sendEventWithRoomInfo('click_invite_friends_button')
    logJS('info', 'RoomScreen.onInviteFriendsToRoomPress')
    inviteBottomSheetRef.current?.present()
  }, [])

  const onShareRoom = useCallback(
    (inviteCode?: string) => {
      sendEventWithRoomInfo('click_share_room_link')
      logJS('info', 'RoomScreen.onShareRoom')
      shareLink(
        getRoomLinkInternal(
          params.roomId,
          params.roomPass,
          deps.roomManager,
          inviteCode,
        ),
      )
    },
    [deps.roomManager, params.roomId, params.roomPass],
  )

  const onCopyRoomLink = useCallback(
    (inviteCode?: string) => {
      logJS('info', 'RoomScreen.onCopyRoomLink')
      Clipboard.setString(
        getRoomLinkInternal(
          params.roomId,
          params.roomPass,
          deps.roomManager,
          inviteCode,
        ),
      )
    },
    [deps.roomManager, params.roomId, params.roomPass],
  )

  const adminsProvider = useCallback(() => {
    return deps.roomManager.appModule.admins()
  }, [deps.roomManager])

  const handsProvider = useCallback(() => {
    return deps.roomManager.appModule.hands()
  }, [deps.roomManager])

  const roomBackground = deps.roomManager.roomBackground
  const withSpeakers = deps.roomManager.withSpeakers

  const isLoadingInProgress = isWebSocketsLoading || !isBackgroundLoaded

  return (
    <>
      <AppStateManager roomManager={deps.roomManager} />
      {!!roomBackground && (
        <RoomLayoutView
          accessibilityLabel={'RoomLayoutView'}
          options={{
            width: roomBackground!.realWidth,
            height: roomBackground!.realHeight,
            multiplier: roomBackground!.multiplier,
            minZoom: roomBackground!.minZoom,
            maxZoom: roomBackground!.maxZoom,
          }}
          style={[
            styles.roomLayout,
            {backgroundColor: colors.supportBackground},
          ]}>
          <RoomBackgroundView
            accessibilityLabel={'bgImage'}
            onBackgroundLoaded={backgroundLoaded}
            imageSource={roomBackground!.source.uri}
            bgSize={roomBackground!.bgSize}
          />
          <UsersList
            onUserPress={onUserPress}
            onImagePress={onImagePress}
            width={roomBackground!.realWidth}
            height={roomBackground!.realHeight}
            accessibilityLabel={'UsersList'}
            reactionsStore={deps.reactionsStore}
            roomManager={deps.roomManager}
            userManager={deps.userManager}
          />
        </RoomLayoutView>
      )}

      {!isLoadingInProgress && (
        <>
          <StatusBar
            barStyle='light-content'
            backgroundColor='transparent'
            translucent={true}
          />
          {withSpeakers && (
            <>
              <FloatingReactions
                pointerEvents={'none'}
                accessibilityLabel={'FloatingReactions'}
                style={styles.reactionsContainer}
              />
              <RoomBottomContainer
                onSelfiePress={onSelfiePress}
                onInviteFriendsToRoomPress={onInviteFriendsToRoomPress}
                onInvitePress={onInviteFriendsToRoomPress}
                reactionsStore={deps.reactionsStore}
                onManageRoomPress={onManageRoomPress}
                onToggleCameraPress={onToggleCameraPress}
                openRaisedHandsBottomSheet={openRaisedHandsBottomSheet}
                onEmojiPress={onEmojiPress}
                onCollapsePress={collapseRoom}
                leaveRoomPress={leaveRoomPress}
                onUserPress={onUserPress}
                roomManager={deps.roomManager}
                userManager={deps.userManager}
              />
            </>
          )}
          {!withSpeakers && (
            <UserControlButtons
              onSelfiePress={onSelfiePress}
              onInviteFriendsToRoomPress={onInviteFriendsToRoomPress}
              openRaisedHandsBottomSheet={openRaisedHandsBottomSheet}
              roomManager={deps.roomManager}
              userManager={deps.userManager}
              onToggleCameraPress={onToggleCameraPress}
              reactionsStore={deps.reactionsStore}
              onManageRoomPress={onManageRoomPress}
              onCollapsePress={collapseRoom}
              leaveRoomPress={leaveRoomPress}
              onEmojiPress={onEmojiPress}
            />
          )}
          <BaseInlineBottomSheet
            ref={bottomSheetRaisedHandsRef}
            snaps={['90%']}>
            <RaisedHandsListView
              handsProvider={handsProvider}
              callToStage={(userId) => deps.roomManager.callToStage(userId)}
              userManager={deps.userManager}
            />
          </BaseInlineBottomSheet>

          <BaseInlineBottomSheet
            ref={emojisBottomSheetRef}
            height={emojiListItemHeight * 2 + ms(16)}>
            <EmojisListView onEmojiPress={onEmojiItemPress} />
          </BaseInlineBottomSheet>

          <BaseInlineBottomSheet snaps={['90%']} ref={manageRoomBottomSheetRef}>
            <ManageRoomListView
              endRoom={destroyRoomAndExit}
              roomManager={deps.roomManager}
              adminsProvider={adminsProvider}
              userManager={deps.userManager}
            />
          </BaseInlineBottomSheet>

          <BaseInlineBottomSheet snaps={['90%']} ref={inviteBottomSheetRef}>
            <FriendsBottomSheetListView
              onShareRoomPress={onShareRoom}
              onCopyRoomLinkPress={onCopyRoomLink}
              roomId={params.roomId}
              eventId={deps.roomManager.roomEventId}
            />
          </BaseInlineBottomSheet>

          {roomImage && (
            <BaseInlineBottomSheet
              snaps={['90%']}
              ref={imageBottomSheetRef}
              onDismiss={() => {
                setRoomImage(null)
              }}>
              <RoomImageBottomSheetScreen imageInfo={roomImage} />
            </BaseInlineBottomSheet>
          )}
        </>
      )}

      {isLoadingInProgress && <LoadRoomView />}
    </>
  )
}

const styles = StyleSheet.create({
  roomLayout: {
    height: '100%',
  },
  reactionsContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  usersList: {
    zIndex: 1,
  },
  roomSwitcher: {
    position: 'absolute',
    zIndex: 2,
    opacity: 0.8,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
  },
})

export default observer(RoomScreen)

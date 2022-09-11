/* eslint-disable prettier/prettier */
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { analytics } from '../Analytics'
import { api } from '../api/api'
import { appEventEmitter, hideLoading, showLoading, updateUserAvatar } from '../appEventEmitter'
import ContentLoadingView from '../components/common/ContentLoadingView'
import Horizontal from '../components/common/Horizontal'
import PrivateMeetingPopup from '../components/common/PrivateMeetingPopup'
import Vertical from '../components/common/Vertical'
import BioView from '../components/screens/profileScreen/BioView'
import FollowedByView from '../components/screens/profileScreen/FollowedByView'
import JoinedByView from '../components/screens/profileScreen/JoinedByView'
import JoinedIntoClubBy from '../components/screens/profileScreen/JoinedIntoClubBy'
import MemberOfClubView from '../components/screens/profileScreen/MemberOfClubView'
import ProfileNavigation from '../components/screens/profileScreen/ProfileNavigation'
import ProfileRoomBottomButtons, {
  isProfileButtonsVisible,
  profileRoomBottomButtonsHeightBase,
  ProfileRoomBottomButtonsProps,
} from '../components/screens/profileScreen/ProfileRoomBottomButtons'
import ProfileScreenHeader, { ClubControls } from '../components/screens/profileScreen/ProfileScreenHeader'
import ProfileSocialNetworkLinks from '../components/screens/profileScreen/ProfileSocialNetworkLinks'
import ProfileTagView from '../components/screens/profileScreen/ProfileTagView'
import { logJS } from '../components/screens/room/modules/Logger'
import { alert, AppModal } from '../components/webSafeImports/webSafeImports'
import { FullUserModel, UserModel, UserTag } from '../models'
import { storage } from '../storage'
import { ProfileScreenStore } from '../stores/ProfileScreenStore'
import { commonStyles, useTheme } from '../theme/appTheme'
import { ms } from '../utils/layout.utils'
import { push } from '../utils/navigation.utils'
import { toastHelper } from '../utils/ToastHelper'
import { useViewModel } from '../utils/useViewModel'

export interface ClubOptions {
  readonly joinRequestId?: string
}

export interface InvitationOptions {
  readonly waitingInvitation: boolean
  readonly activityId?: string
}

export interface ProfileScreenProps {
  readonly userId?: string
  readonly username?: string
  navigationRoot?: string
  readonly clubOptions?: ClubOptions
  readonly roomName?: string
  readonly roomBottomProps?: ProfileRoomBottomButtonsProps
  readonly showCloseButton?: boolean
  readonly invitationOptions?: InvitationOptions
}

type ScreenRouteProp = RouteProp<{Screen: ProfileScreenProps}, 'Screen'>

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation()
  const {t} = useTranslation()
  const {colors} = useTheme()
  const {params} = useRoute<ScreenRouteProp>()
  const inset = useSafeAreaInsets()

  const [clubOptions, setClubOptions] = useState(params?.clubOptions)
  const [privateMeetingPopupVisible, setPrivateMeetingPopupVisible] = useState(false)
  const store = useViewModel(() => new ProfileScreenStore(new UserTag(params.userId, params.username)))
  const profileStore = store.profileStore
  const isFromClub = !!profileStore.user?.invitedTo
  const isWaitingInvitation = params.invitationOptions?.waitingInvitation

  const onInvitePersonPress = useCallback(async () => {
    analytics.sendEvent('click_approve_person_with_invitation_code')
    logJS('debug', 'ProfileScreen', 'invite person pressed')
    const isInvited = await profileStore.inviteUser()
    if (isInvited) {
      toastHelper.showJoinRequestApprovedToast({
        body: t('invitationRequestedApprovedBody'),
        title: t('invitationRequestedApprovedTitle', {name: profileStore.user?.displayName}),
        clubId: '',
      })
      navigation.goBack()
    }
  }, [navigation, profileStore, t])

  const onSkipInvitePersonPress = useCallback(async () => {
    analytics.sendEvent('click_skip_person_with_invitation_code')
    const isSkipped = await profileStore.skipUserInvitation(params.invitationOptions?.activityId)
    if (isSkipped) {
      navigation.goBack()
    }
  }, [navigation, params.invitationOptions?.activityId, profileStore])

  const clubControls = useMemo(() => {
    if (isWaitingInvitation) {
      return {
        onAccept: onInvitePersonPress,
        onReject: onSkipInvitePersonPress,
      }
    }

    const joinRequestId = clubOptions?.joinRequestId
    if (!joinRequestId) return undefined
    const controls: ClubControls = {
      onAccept: () => profileStore.acceptClubJoinRequest(profileStore.userId, joinRequestId),
      onReject: () => profileStore.rejectClubJoinRequest(profileStore.userId, joinRequestId),
    }
    return controls
  }, [clubOptions?.joinRequestId, profileStore])

  useEffect(() => {
    return navigation.addListener('focus', store.fetch)
  })

  useEffect(() => {
    return appEventEmitter.on('updateClubJoinedState', () => {
      if (!clubOptions) return
      const newClubOptions: ClubOptions = {
        ...clubOptions,
        joinRequestId: undefined,
      }
      navigation.setOptions({clubOptions: newClubOptions})
      setClubOptions(newClubOptions)
    })
  }, [navigation, clubOptions, setClubOptions])

  const onClubsPress = useCallback(() => {
    const isCurrentUser = storage.currentUser!.id === params.userId
    if (isCurrentUser || (profileStore.user?.memberOf?.length ?? 0) > 0) {
      const navArgs = {userId: params.userId, userDisplayName: !isCurrentUser && profileStore.user?.name}
      navigation.navigate('ClubListScreen', navArgs)
    }
  }, [navigation, params.userId, profileStore.user?.memberOf?.length, profileStore.user?.name])

  const onMemberOfClubPress = useCallback((clubId: string) => {
    push(navigation, 'ProfileScreenModal', {initialScreen: 'ClubScreen', clubId, isModal: true})
  }, [navigation])

  const onToggleBlockUser = useCallback(async () => {
    if (!profileStore.user) return
    if (!profileStore.user.isBlocked) {
      const onBlockConfirmed = async () => {
        if (await profileStore.blockUser()) {
          await store.fetch()
        }
      }
      alert(t('blockThisUserTitle'), t('blockThisUserText'), [
        {text: t('Cancel')},
        {
          text: t('blockButton'),
          style: 'destructive',
          onPress: onBlockConfirmed,
        },
      ])
      return
    }
    const onUnblockConfirmed = async () => {
      if (await profileStore.unblockUser()) {
        await store.fetch()
      }
    }
    alert(t('unblockThisUserTitle'), t('unblockThisUserText'), [
      {text: t('Cancel')},
      {
        text: t('unblockButton'),
        style: 'destructive',
        onPress: onUnblockConfirmed,
      },
    ])
  }, [profileStore, store, t])

  const onFollowersPress = useCallback(
    (user: FullUserModel) => {
      push(navigation, 'FollowersScreen', {
        user: user,
        purposeToConnectOnEmptyScreen: true,
        navigationRoot: params?.navigationRoot,
      })
    },
    [navigation, params?.navigationRoot],
  )

  const onFollowingPress = useCallback(
    (user: FullUserModel) => {
      push(navigation, 'FollowingScreen', {
        user: user,
        navigationRoot: params?.navigationRoot,
      })
    },
    [navigation, params?.navigationRoot],
  )

  const setAvatar = useCallback(
    async (url: string) => {
      showLoading()
      const uploadResponse = await api.uploadAvatar(url)
      hideLoading()
      if (uploadResponse.error) return toastHelper.error(uploadResponse.error)
      if (!uploadResponse.data) return
      await storage.saveAvatar(uploadResponse.data!.avatar!)
      profileStore.updateAvatar(uploadResponse.data!.avatar!)
      updateUserAvatar()
    },
    [profileStore],
  )

  const onConnectEstablished = useCallback( () => {
    setPrivateMeetingPopupVisible(true)
  }, [])

  const onPrivateMeetingPress = (user: UserModel) => {
    analytics.sendEvent('click_private_meeting_profile_screen')
    setPrivateMeetingPopupVisible(false)
    navigation.navigate('CreateEventScreen', {
      navigationRoot: 'LocalCreateEventScreen',
      isModal: true,
      privateMeetingUser: user,
    })
  }

  const onContextMenuPress = () => {
    navigation.navigate('ProfileSettingsScreen', {
      navigationRoot: params?.navigationRoot,
    })
  }

  const badges = profileStore.user?.badges
  const isCrownVisible = params.roomBottomProps?.isUserOwner === true

  const isConnected = profileStore.user?.isFollowing === true && profileStore.user?.isFollows === true

  const isBottomButtonsVisible = isProfileButtonsVisible(
    profileStore.userId,
    isConnected,
    params.roomBottomProps,
  )

  const roomBottomProps = params.roomBottomProps

  const showMediaToggles =
    roomBottomProps &&
    !roomBottomProps.isCurrentUser &&
    roomBottomProps.isCurrentUserAdmin &&
    roomBottomProps.userMode === 'room'

  const scrollViewMarginBottom = isBottomButtonsVisible ? profileRoomBottomButtonsHeightBase : 0
  const scrollViewPaddingBottom = isBottomButtonsVisible ? 0 : inset.bottom

  return (
    <AppModal contentStyle={commonStyles.webScrollingContainer} isScrolling={false}>
      <ContentLoadingView
        style={[commonStyles.wizardContainer, commonStyles.flexOne]}
        onRetry={store.fetch}
        error={profileStore.error}
        loading={store.isLoading}>
        {profileStore.user && privateMeetingPopupVisible && (
          <PrivateMeetingPopup meetingUser={profileStore.user} onArrangeMeetingPress={onPrivateMeetingPress}/>
        )}
        <View style={[commonStyles.wizardContainer, commonStyles.flexOne]}>
          <Vertical style={[commonStyles.flexOne]}>
            <ProfileNavigation
              store={profileStore}
              roomName={params.roomName}
              isUserAdmin={roomBottomProps?.isUserAdmin ?? false}
              isCurrentUserAdmin={roomBottomProps?.isCurrentUserAdmin ?? false}
              onContextMenuPress={onContextMenuPress}
              showCloseInsteadOfBack={params?.showCloseButton}
              onToggleBlockUser={onToggleBlockUser}
              isWaitingInvitation={isWaitingInvitation}
            />
            <ScrollView
              style={{
                marginBottom: scrollViewMarginBottom,
                paddingBottom: scrollViewPaddingBottom,
              }}>
              <Vertical
                style={[commonStyles.flexOne, {paddingBottom: inset.bottom}]}>
                <ProfileScreenHeader
                  manageProfileCallbacks={clubControls}
                  isCrownVisible={isCrownVisible}
                  setAvatar={setAvatar}
                  onFollowersPress={onFollowersPress}
                  onFollowingPress={onFollowingPress}
                  onUnblockUserPress={onToggleBlockUser}
                  onConnectEstablished={onConnectEstablished}
                  store={profileStore}
                  counters={store.countersStore.counters}
                  showMediaToggles={showMediaToggles}
                  videoEnabled={roomBottomProps?.videoEnabled}
                  audioEnabled={roomBottomProps?.audioEnabled}
                  isWaitingInvitation={isWaitingInvitation}
                />
                {badges && badges.length > 0 && (
                  <Horizontal style={styles.tags}>
                    {badges.includes('team') && (
                      <ProfileTagView
                        icon={'icTeamTag'}
                        title={t('team')}
                        tint={'#41B4FF'}
                      />
                    )}
                    {badges.includes('press') && (
                      <ProfileTagView
                        icon={'icPressTag'}
                        title={t('press')}
                        tint={'#56DE35'}
                      />
                    )}
                    {badges.includes('speaker') && (
                      <ProfileTagView
                        icon={'icSpeakerTag'}
                        title={t('speaker')}
                        tint={'#FF6E00'}
                      />
                    )}
                    {badges.includes('new') && (
                      <ProfileTagView
                        icon={'icNewbieTag'}
                        title={t('newbie')}
                        tint={'#8458FF'}
                      />
                    )}
                  </Horizontal>
                )}
                <View
                  style={[
                    styles.separator,
                    {backgroundColor: colors.separator},
                  ]}
                />
                <MemberOfClubView
                  isSelf={params.userId === storage.currentUser?.id}
                  onMemberOfClubPress={onMemberOfClubPress}
                  onMyClubsPress={onClubsPress}
                  clubsInfo={profileStore.user?.memberOf}
                />
                {!isWaitingInvitation && (<View
                  style={[
                    styles.separator,
                    {backgroundColor: colors.separator},
                  ]}
                />)}
                {profileStore.user && (<BioView
                  user={profileStore.user}
                  onPress={() =>
                    navigation.navigate('UpdateProfileBioScreenInModal', {
                      userId: profileStore.userId,
                      about: profileStore.user?.about ?? '',
                      navigationRoot: params.navigationRoot,
                    })
                  }
                  allowToEdit={profileStore.isCurrentUser}
                />)}
                <ProfileSocialNetworkLinks store={profileStore}/>
                <FollowedByView
                  userId={profileStore.userId}
                  info={profileStore.followedByShortInfo}
                />

                {!isFromClub && profileStore.user?.joinedBy && (
                  <>
                    <View
                      style={[
                        styles.separator,
                        {backgroundColor: colors.separator},
                      ]}
                    />
                    <JoinedByView
                      user={profileStore.user}
                      joinedByUser={profileStore.user.joinedBy}
                    />
                  </>
                )}
                {isFromClub && profileStore.user?.invitedTo && (
                  <>
                    <View
                      style={[
                        styles.separator,
                        {backgroundColor: colors.separator},
                      ]}
                    />
                    <JoinedIntoClubBy invitedInfo={profileStore.user.invitedTo} />
                  </>
                )}
              </Vertical>
            </ScrollView>
          </Vertical>
          {isBottomButtonsVisible && (
            <ProfileRoomBottomButtons params={roomBottomProps!} isConnected={isConnected} onPrivateMeetingPress={() => onPrivateMeetingPress(profileStore.user!)} />
          )}
        </View>
      </ContentLoadingView>
    </AppModal>
  )
}

export default ProfileScreen

const styles = StyleSheet.create({
  separator: {
    height: ms(1),
    marginHorizontal: ms(16),
    marginTop: ms(16),
    marginBottom: ms(16),
  },

  tags: {
    marginTop: ms(24),
    marginStart: ms(8),
  },

  meetingContainer: {
    marginBottom: ms(32),
    marginHorizontal: ms(16),
    height: ms(100),
  },
})

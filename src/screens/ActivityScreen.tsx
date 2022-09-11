import {useNavigation} from '@react-navigation/native'
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack'
import {observer} from 'mobx-react'
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import {analytics} from '../Analytics'
import {showUserProfile} from '../appEventEmitter'
import BaseFlatList from '../components/common/BaseFlatList'
import PrivateMeetingPopup from '../components/common/PrivateMeetingPopup'
import ActivityClubInviteListItem from '../components/screens/activity/ActivityClubInviteListItem'
import ActivityCustomView from '../components/screens/activity/ActivityCustomView'
import ActivityIntroView from '../components/screens/activity/ActivityIntroView'
import ActivityJoinDiscordListItem from '../components/screens/activity/ActivityJoinDiscordListItem'
import ActivityUserAskInviteListItem from '../components/screens/activity/ActivityUserAskInviteListItem'
import ActivityUserRegisteredListItem from '../components/screens/activity/ActivityUserRegisteredListItem'
import ActivityUserScheduleEventListItem from '../components/screens/activity/ActivityUserScheduleEventListItem'
import ActivityVideoRoomStartedListItem from '../components/screens/activity/ActivityVideoRoomStartedListItem'
import UpcomingEventBottomDialog from '../components/screens/mainFeed/UpcomingEventBottomDialog'
import {CustomTitles} from '../components/screens/profileScreen/ConnectButton'
import {
  ActivityAskInviteModel,
  ActivityClubInviteModel,
  ActivityClubRequestModel,
  ActivityCustomModel,
  ActivityIntroModel,
  ActivityModel,
  ActivityModelType,
  ActivityUserRegisteredModel,
  ActivityUserScheduleEventModel,
  ActivityVideoRoomStartedModel,
  UserModel,
} from '../models'
import {ActivityStore} from '../stores/ActivityStore'
import MyCountersStore from '../stores/MyCountersStore'
import {commonStyles, useTheme} from '../theme/appTheme'
import {baseNavigationScreenOptions} from '../theme/navigationTheme'
import {ms} from '../utils/layout.utils'
import {push, useTitle} from '../utils/navigation.utils'
import {toastHelper} from '../utils/ToastHelper'
import {useViewModel} from '../utils/useViewModel'

const Stack = createStackNavigator()

const ActivityScreen: React.FC = () => {
  const {colors} = useTheme()

  return (
    <Stack.Navigator
      mode={'modal'}
      //@ts-ignore
      screenOptions={baseNavigationScreenOptions(colors)}>
      <Stack.Screen
        name={'LocalActivityScreen'}
        component={ObservedLocalActivityScreen}
        options={{
          ...TransitionPresets.ModalPresentationIOS,
        }}
      />

      <Stack.Screen
        name={'ProfileScreenModal'}
        getComponent={() => require('./ProfileScreenModal').default}
        options={{
          ...TransitionPresets.ModalPresentationIOS,
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  )
}
const LocalActivityScreen: React.FC = () => {
  const {t} = useTranslation()
  const navigation = useNavigation()
  const countersStore = useContext(MyCountersStore)
  const store = useViewModel(() => new ActivityStore())
  const [privateMeetingPopupVisible, setPrivateMeetingPopupVisible] =
    useState(false)
  const meetingUserRef = useRef<UserModel | null>(null)

  useTitle(t('activityTitle'))

  useEffect(() => {
    store.fetch().then(countersStore.updateCounters)
  }, [store, countersStore])

  const activities = store.activities
  const customConnectButtonTitles = useMemo<CustomTitles>(
    () => ({NotConnected: t('connectButtonStateNotConnectedBack')}),
    [t],
  )

  const onShowUserProfile = useCallback((item: ActivityAskInviteModel) => {
    if (item.relatedUsers.length < 1) return
    const user = item.relatedUsers[0]
    showUserProfile(user.username, user.id, {
      invitationOptions: {activityId: item.id, waitingInvitation: true},
    })
  }, [])

  const onInviteUserById = useCallback(
    async (item: ActivityAskInviteModel) => {
      if (item.relatedUsers.length < 1) return
      const isInvited = await store.inviteUserById(item.relatedUsers[0].id)
      if (isInvited) {
        toastHelper.showJoinRequestApprovedToast({
          body: t('invitationRequestedApprovedBody'),
          title: t('invitationRequestedApprovedTitle', {
            name: item.relatedUsers[0].displayName,
          }),
          clubId: '',
        })
        await store.fetch()
        countersStore.updateCounters()
      }
    },
    [countersStore, store, t],
  )

  const onConnectBack = (user: UserModel) => {
    meetingUserRef.current = user
    setPrivateMeetingPopupVisible(true)
  }

  const onPrivateMeetingPress = (user: UserModel) => {
    setPrivateMeetingPopupVisible(false)
    navigation.navigate('ProfileScreenModal', {
      initialScreen: 'CreateEventScreen',
      navigationRoot: 'LocalCreateEventScreen',
      isModal: true,
      privateMeetingUser: user,
    })
  }

  return (
    <>
      {privateMeetingPopupVisible && meetingUserRef.current && (
        <PrivateMeetingPopup
          meetingUser={meetingUserRef.current}
          onArrangeMeetingPress={onPrivateMeetingPress}
        />
      )}
      <BaseFlatList<ActivityModel>
        data={activities}
        refreshing={store.isLoading}
        onEndReached={store.fetchMore}
        onRefresh={store.fetch}
        style={commonStyles.wizardContainer}
        contentContainerStyle={styles.listContent}
        initialNumToRender={20}
        renderItem={({item, index}) => {
          switch (item.type) {
            case ActivityModelType.askInvite:
              return (
                <ActivityUserAskInviteListItem
                  accessibilityLabel={'activity'}
                  item={item as ActivityAskInviteModel}
                  acceptText={t('letInButton')}
                  onAccept={() =>
                    store.inviteUser(
                      item.id,
                      (item as ActivityAskInviteModel).phone,
                    )
                  }
                  onReject={() => store.deleteActivity(item.id)}
                />
              )
            case ActivityModelType.newUserRegisteredByInviteCode:
              return (
                <ActivityUserAskInviteListItem
                  accessibilityLabel={'activity'}
                  item={item as ActivityAskInviteModel}
                  acceptText={t('approveButton')}
                  onPress={onShowUserProfile}
                  onAccept={onInviteUserById}
                  onReject={() => store.deleteActivity(item.id)}
                />
              )
            case ActivityModelType.newClubRequest:
              return (
                <ActivityUserAskInviteListItem
                  accessibilityLabel={'activity'}
                  item={item as ActivityAskInviteModel}
                  acceptText={t('moderateClubButton')}
                  onAccept={() => {
                    const request = item as ActivityClubRequestModel
                    if (!request.clubId) return
                    push(navigation, 'ClubScreen', {
                      initialScreen: 'ClubMembersScreen',
                      clubId: request.clubId,
                      navigationRoot: 'MainFeedListScreen',
                      initialTab: 'requests',
                    })
                  }}
                  onReject={() => {
                    store.deleteActivity(item.id)
                  }}
                />
              )
            case ActivityModelType.newClubInvite:
              const activity = item as ActivityClubInviteModel
              const navigateToClub = () => {
                analytics.sendEvent('activity_new_club_invite_view_click', {
                  clubId: activity.clubId,
                })
                if (!activity.clubId) return
                navigation.navigate('ClubScreen', {clubId: activity.clubId})
              }
              return (
                <ActivityUserAskInviteListItem
                  accessibilityLabel={'activity'}
                  item={item as ActivityAskInviteModel}
                  acceptText={t('viewClubAction')}
                  onPress={navigateToClub}
                  onAccept={navigateToClub}
                  onReject={() => {
                    store.deleteActivity(item.id)
                  }}
                />
              )
            case ActivityModelType.joinOurDiscord:
              return (
                <ActivityJoinDiscordListItem
                  item={item}
                  activityStore={store}
                  countersStore={countersStore}
                />
              )
            case ActivityModelType.userClubScheduleEvent:
            case ActivityModelType.userScheduleEvent:
            case ActivityModelType.registeredAsCoHost:
            case ActivityModelType.userClubRegisteredAsCoHost:
            case ActivityModelType.registeredAsSpeaker:
            case ActivityModelType.privateMeetingChanged:
            case ActivityModelType.privateMeetingApproved:
            case ActivityModelType.privateMeetingCreated:
            case ActivityModelType.privateMeetingCancelled:
              return (
                <ActivityUserScheduleEventListItem
                  store={store}
                  accessibilityLabel={'activity'}
                  item={item as ActivityUserScheduleEventModel}
                  index={index}
                  onPress={store.showEvent}
                />
              )
            case ActivityModelType.userRegistered:
              return (
                <ActivityUserRegisteredListItem
                  store={store}
                  accessibilityLabel={'activity'}
                  item={item as ActivityUserRegisteredModel}
                  index={index}
                />
              )
            case ActivityModelType.newFollower:
              return (
                <ActivityUserRegisteredListItem
                  store={store}
                  accessibilityLabel={'activity'}
                  item={item as ActivityUserRegisteredModel}
                  index={index}
                  customConnectButtonTitles={customConnectButtonTitles}
                  onConnectedBack={onConnectBack}
                />
              )
            case ActivityModelType.connectYouBack:
              return (
                <ActivityUserRegisteredListItem
                  store={store}
                  accessibilityLabel={'activity'}
                  item={item as ActivityUserRegisteredModel}
                  index={index}
                  withoutButtons={true}
                />
              )
            case ActivityModelType.clubRoomStarted:
            case ActivityModelType.roomStarted:
            case ActivityModelType.followBecomeSpeaker:
            case ActivityModelType.inviteOnBoarding:
            case ActivityModelType.welcomeOnBoardingFriend:
            case ActivityModelType.invitePrivateVideoRoom:
              return (
                <ActivityVideoRoomStartedListItem
                  store={store}
                  item={item as ActivityVideoRoomStartedModel}
                  index={index}
                />
              )
            case ActivityModelType.joinClubApproved:
              return (
                <ActivityClubInviteListItem
                  item={item as ActivityClubRequestModel}
                />
              )
            case ActivityModelType.intro:
              return (
                <ActivityIntroView
                  store={store}
                  item={item as ActivityIntroModel}
                  index={index}
                />
              )
            case ActivityModelType.custom:
              return (
                <ActivityCustomView
                  store={store}
                  item={item as ActivityCustomModel}
                  index={index}
                />
              )
          }
        }}
      />
      {store.bottomSheetEvent && (
        <UpcomingEventBottomDialog
          isEditSupported={false}
          dismissOnMemberPress={false}
          onDismiss={store.dismissEvent}
          event={store.bottomSheetEvent}
        />
      )}
    </>
  )
}
const ObservedLocalActivityScreen = observer(LocalActivityScreen)

export default ActivityScreen

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: ms(16),
  },
})

import {useNavigation} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useCallback, useContext, useEffect, useState} from 'react'
import {InteractionManager, Platform, StyleSheet, View} from 'react-native'

import {analytics} from '../Analytics'
import {
  appEventEmitter,
  hideLoading,
  showEventDialog,
  showLoading,
} from '../appEventEmitter'
import AppNavigationHeader from '../components/common/AppNavigationHeader'
import AppText from '../components/common/AppText'
import AppTouchableOpacity from '../components/common/AppTouchableOpacity'
import EventBottomSheet from '../components/common/EventBottomSheet'
import Horizontal from '../components/common/Horizontal'
import MainFeedCalendarHeader from '../components/screens/mainFeed/calendar/MainFeedCalendarHeader'
import ChooseDefaultLanguageView from '../components/screens/mainFeed/ChooseDefaultLanguageView'
import MainFeedList from '../components/screens/mainFeed/list/MainFeedList'
import MainFeedStartRoomButton from '../components/screens/mainFeed/MainFeedStartRoomButton'
import NavigationExploreButton from '../components/screens/mainFeed/NavigationExploreButton'
import NavigationFestivalButton from '../components/screens/mainFeed/NavigationFestivalButton'
import NavigationIconButton from '../components/screens/mainFeed/NavigationIconButton'
import NavigationInviteFriendsButton from '../components/screens/mainFeed/NavigationInviteFriendsButton'
import NavigationMyNetworkButton from '../components/screens/mainFeed/NavigationMyNetworkButton'
import NavigationUserButton from '../components/screens/mainFeed/NavigationUserButton'
import PushHandler from '../components/screens/mainFeed/PushHandler'
import RingView from '../components/screens/mainFeed/RingView'
import UpcomingEventBottomDialog from '../components/screens/mainFeed/UpcomingEventBottomDialog'
import BaseRoomScreen from '../components/screens/room/BaseRoomScreen'
import CollapsedRoomHeader from '../components/screens/room/collapsedToomHeader/CollapsedRoomHeader'
import {logJS} from '../components/screens/room/modules/Logger'
import {useCreateNewRoom} from '../components/screens/startRoom/useCreateNewRoom'
import {
  ClubInfoModel,
  ClubParams,
  EventModel,
  LanguageModel,
  MainFeedItemModel,
  RoomParams,
  Unknown,
} from '../models'
import {MainFeedStore} from '../stores/MainFeedStore'
import MyCountersStore from '../stores/MyCountersStore'
import UpcomingEventsStore from '../stores/UpcomingEventsStore'
import {
  COLLAPSED_ROOM_HEADER_HEIGHT,
  commonStyles,
  useTheme,
} from '../theme/appTheme'
import {bottomInset} from '../utils/inset.utils'
import {ms} from '../utils/layout.utils'
import {push} from '../utils/navigation.utils'
import {useBottomSafeArea} from '../utils/safeArea.utils'
import {useDeepLinkNavigation} from '../utils/useDeepLinkNaivgation'
import useReleaseNotes from '../utils/useReleaseNotes'
import {useViewModel} from '../utils/useViewModel'
import {BottomPanelHeight} from './MainFeedListScreenConsts'
import MainFeedListScreenStack from './MainFeedListScreenStack'

const MainFeedListScreen: React.FC = () => {
  const navigation = useNavigation()
  const deepLinkNavigation = useDeepLinkNavigation()
  useEffect(() => {
    const onRoomDeeplinkReceivedDisposable = appEventEmitter.once(
      'onRoomDeeplinkReceived',
      (params: RoomParams) => {
        const room = params.room
        const pswd = params.pswd
        if (room && pswd) {
          setTimeout(
            () => moveToRoom(room, pswd, params.eventId ?? undefined),
            0,
          )
        } else if (params.eventId) {
          showEventDialog(params.eventId)
        }
      },
    )
    const onClubDeeplinkReceivedDisposable = appEventEmitter.on(
      'onClubDeeplinkReceived',
      (params: ClubParams) => {
        push(navigation, 'ClubScreen', {clubId: params.clubId})
      },
    )
    const onClubRequestDeeplinkReceivedDisposable = appEventEmitter.on(
      'onClubRequestDeeplinkReceived',
      async (params: ClubParams) => {
        logJS('debug', 'club requests open for clubId:', params.clubId)
        navigation.navigate('ClubScreen', {
          initialScreen: 'ClubMembersScreen',
          clubId: params.clubId,
          navigationRoot: 'MainFeedListScreen',
          initialTab: 'requests',
        })
      },
    )
    const onShowUserProfileDisposable = appEventEmitter.on(
      'showUserProfile',
      (params) => {
        navigation.navigate('ProfileScreenModal', {
          ...params.additionalProps,
          userId: params.userId,
          username: params.username,
        })
      },
    )
    deepLinkNavigation.onMainNavigationReady()

    return () => {
      onRoomDeeplinkReceivedDisposable()
      onClubDeeplinkReceivedDisposable()
      onClubRequestDeeplinkReceivedDisposable()
      onShowUserProfileDisposable()
    }
  }, [deepLinkNavigation, navigation])

  const moveToRoom = async (
    roomId: string,
    roomPass: string,
    eventScheduleId: string | undefined,
  ) => {
    logJS(
      'debug',
      'Move to room with roomId:',
      roomId,
      'roomPass:',
      roomPass,
      'event id',
      eventScheduleId,
    )
    appEventEmitter.trigger('openRoom', roomId, roomPass, eventScheduleId)
  }

  return (
    <>
      <MainFeedListScreenStack />
      <EventBottomSheet />
    </>
  )
}
export default MainFeedListScreen

export const LocalMainFeedListScreen: React.FC = observer(() => {
  const navigation = useNavigation()
  const {colors} = useTheme()
  const store = useViewModel(() => new MainFeedStore())
  const countersStore = useContext(MyCountersStore)
  const eventsStore = useContext(UpcomingEventsStore)
  const [showEvent, setShowEvent] = useState<EventModel | null>(null)
  const [isRoomCollapsed, setRoomCollapsed] = useState(false)
  const showReleaseNotes = useReleaseNotes()

  useCreateNewRoom(store)

  const inset = useBottomSafeArea()
  const bottomContainerHeight =
    bottomInset(inset) +
    BottomPanelHeight +
    (isRoomCollapsed ? COLLAPSED_ROOM_HEADER_HEIGHT : 0)

  const fetch = useCallback(async () => {
    await countersStore.updateCounters()
    await eventsStore.fetchUpcomingEvents()
    await store.fetch()
  }, [countersStore, eventsStore, store])

  useEffect(() => {
    analytics.sendEvent('start_page_open')
    fetch()
    const refreshCleaner = appEventEmitter.once('refreshMainFeed', onRefresh)
    const createCleaner = appEventEmitter.once(
      'startRoomFromEvent',
      async (
        eventId: string,
        eventTitle: string,
        language: LanguageModel,
        isPrivate: boolean,
      ) => {
        navigation.navigate('StartRoomScreenModal', {
          backScreen: 'LocalMainFeedListScreen',
          eventId,
          eventTitle,
          selectedLanguage: language,
          isPrivate,
        })
      },
    )
    const createChatCleaner = appEventEmitter.once(
      'startRoomForChat',
      async (userId: string) => {
        navigation.navigate('StartRoomScreenModal', {
          backScreen: 'LocalMainFeedListScreen',
          isPrivate: true,
          userId,
        })
      },
    )
    const collapseCleaner = appEventEmitter.on('collapseRoom', (isCollapse) => {
      setRoomCollapsed(isCollapse)
      onRefresh()
    })
    const closeCleaner = appEventEmitter.on('closeRoom', () =>
      setRoomCollapsed(false),
    )
    const startCleaner = appEventEmitter.once('joinRoom', onRoomPress)
    const appStateCleaner = appEventEmitter.on('appInForeground', onRefresh)
    return () => {
      appStateCleaner()
      collapseCleaner()
      closeCleaner()
      refreshCleaner()
      startCleaner()
      createCleaner()
      createChatCleaner()
    }
  }, [])

  useEffect(() => {
    if (store.isFirstLoading || store.isLoading || store.error) return
    InteractionManager.runAfterInteractions(() => {
      showReleaseNotes()
    })
  }, [showReleaseNotes, store.isLoading])

  const onStartRoomPress = async () => {
    navigation.navigate('StartRoomScreenModal', {
      backScreen: 'LocalMainFeedListScreen',
    })
  }

  const onRoomPress = async (model: MainFeedItemModel | Unknown) => {
    if (!model) return
    logJS(
      'debug',
      'On room press with roomId:',
      model.roomId,
      'roomPass:',
      model.roomPass,
    )
    // @ts-ignore
    appEventEmitter.trigger(
      'openRoom',
      model.roomId,
      model.roomPass,
      model.eventScheduleId,
    )
  }

  const onRoomDetailsPress = async (model: MainFeedItemModel | Unknown) => {
    if (!model) return
    if (!model.eventScheduleId) return
    logJS(
      'debug',
      'On room details press with roomId:',
      model.roomId,
      'roomPass:',
      model.roomPass,
      'eventId:',
      model.eventScheduleId,
    )
    await showEventDialog(model.eventScheduleId)
  }

  const onEventPress = (e: EventModel) => {
    analytics.sendEvent('main_feed_show_event_click', {
      eventId: e.id,
      eventName: e.title,
    })
    console.log(e.title)
    setShowEvent(e)
  }

  const onClubPress = (club: ClubInfoModel) => {
    navigation.navigate('ClubScreen', {clubId: club.id, isModal: false})
  }

  const onEventDialogDismiss = () => setShowEvent(null)

  const headerRight = (
    <Horizontal>
      <NavigationInviteFriendsButton />
      <NavigationIconButton
        accessibilityLabel={'calendarButton'}
        icon={'icCalendar'}
        tint={colors.accentIcon}
        onPress={() => navigation.navigate('UpcomingEventsScreen')}
      />
      <RingView />
      <NavigationUserButton />
    </Horizontal>
  )

  const headerLeft = (
    <Horizontal style={{alignItems: 'center'}}>
      <NavigationMyNetworkButton store={countersStore} />
      <NavigationExploreButton />

      <NavigationFestivalButton />
      {Platform.OS === 'web' && (
        <AppTouchableOpacity
          style={[
            styles.refreshButton,
            {backgroundColor: colors.accentSecondary},
          ]}
          activeOpacity={0.8}
          onPress={() => onRefresh(true)}>
          <AppText
            style={[styles.refreshButtonTitle, {color: colors.accentPrimary}]}>
            {'Refresh'}
          </AppText>
        </AppTouchableOpacity>
      )}
    </Horizontal>
  )

  const onRefresh = useCallback(
    async (withLoading?: boolean) => {
      if (withLoading) showLoading()

      await Promise.all([
        ...(store.isLoading ? [] : [fetch()]),
        countersStore.updateCounters(),
      ])

      hideLoading()
    },
    [countersStore, fetch, store.isLoading],
  )

  return (
    <>
      <PushHandler />
      <View
        style={[commonStyles.wizardContainer, commonStyles.flexOne]}
        key={1}>
        <AppNavigationHeader
          topInset={true}
          headerLeft={headerLeft}
          headerRight={headerRight}
        />

        <MainFeedList
          isCalendarEventsEmpty={eventsStore.upcomingEvents.length === 0}
          isFirstLoading={store.isFirstLoading}
          onRefresh={onRefresh}
          isRefreshing={store.isLoading}
          onLoadMore={store.fetchEventsMore}
          paddingBottom={bottomContainerHeight}
          feed={store.feed}
          onPress={onRoomPress}
          onDetailsPress={onRoomDetailsPress}>
          <ChooseDefaultLanguageView />
          {/*<MainFeedFollowSuggestsHeader users={store.followSuggests} />*/}
          <MainFeedCalendarHeader
            onEventPress={onEventPress}
            onClubPress={onClubPress}
            events={eventsStore.upcomingEvents}
          />
        </MainFeedList>

        <MainFeedStartRoomButton
          height={bottomContainerHeight}
          onPress={onStartRoomPress}
        />
        {Platform.OS !== 'web' && <CollapsedRoomHeader />}
      </View>

      {showEvent && (
        <UpcomingEventBottomDialog
          isEditSupported={false}
          dismissOnMemberPress={false}
          onDismiss={onEventDialogDismiss}
          event={showEvent}
        />
      )}
      <BaseRoomScreen />
    </>
  )
})

const styles = StyleSheet.create({
  refreshButton: {
    paddingHorizontal: ms(12),
    height: ms(28),
    borderRadius: ms(28 / 2),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  refreshButtonTitle: {
    fontSize: ms(12),
    fontWeight: '600',
  },
})

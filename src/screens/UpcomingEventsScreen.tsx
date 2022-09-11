import {useNavigation} from '@react-navigation/native'
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack'
import {observer} from 'mobx-react'
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleProp, StyleSheet, TextStyle, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {
  PagerViewOnPageScrollEvent,
  PagerViewOnPageSelectedEvent,
  PageScrollStateChangedNativeEvent,
} from 'react-native-pager-view/src/types'

import {analytics} from '../Analytics'
import AppNavigationHeader from '../components/common/AppNavigationHeader'
import AppText from '../components/common/AppText'
import ContentLoadingView from '../components/common/ContentLoadingView'
import Tabs, {TabRef} from '../components/common/tabs/Tabs'
import NavigationIconButton from '../components/screens/mainFeed/NavigationIconButton'
import UpcomingEventBottomDialog from '../components/screens/mainFeed/UpcomingEventBottomDialog'
import MyEventsView from '../components/screens/upcomingEvents/MyEventsView'
import UpcomingEventsView from '../components/screens/upcomingEvents/UpcomingEventsView'
import {useUpcomingEventsViewModel} from '../components/screens/upcomingEvents/UpcomingEventsViewModel'
import {useUpcomingEventActions} from '../components/screens/upcomingEvents/UseUpcomingEventActions'
import PagerView from '../components/webSafeImports/PagerView'
import {EventModel, UserModel} from '../models'
import ProfileScreenModal from '../screens/ProfileScreenModal'
import {commonStyles, useTheme} from '../theme/appTheme'
import {baseNavigationScreenOptions} from '../theme/navigationTheme'
import {ms} from '../utils/layout.utils'
import {stackScreenConfigs} from '../utils/navigation.utils'

const RootStack = createStackNavigator()

const UpcomingEventsScreen: React.FC = () => {
  const {colors} = useTheme()

  return (
    <RootStack.Navigator
      mode={'modal'}
      screenOptions={baseNavigationScreenOptions(colors)}>
      {upcomingEventsStackScreens.map((s) => (
        <RootStack.Screen
          key={s.name}
          name={s.name}
          component={s.component}
          //@ts-ignore
          options={{...s.options, ...stackScreenConfigs}}
        />
      ))}
    </RootStack.Navigator>
  )
}
export default UpcomingEventsScreen

const LocalUpcomingEventsScreen: React.FC = () => {
  const {t} = useTranslation()
  const navigation = useNavigation()
  const {colors} = useTheme()
  const [selectedEvent, setEvent] = useState<EventModel | null>(null)
  const [isVisibleBottomSheet, setVisibleBottomSheet] = useState(false)
  const tabsRef = useRef<TabRef>(null)
  const pagerRef = useRef<PagerView>(null)

  const {onMemberPress, onClubPress} = useUpcomingEventActions()
  const store = useUpcomingEventsViewModel()

  const titles = useMemo(
    () => [
      (titleStyle: StyleProp<TextStyle>) => (
        <AppText style={titleStyle}>{t('recommendedTab')}</AppText>
      ),
      (titleStyle: StyleProp<TextStyle>) => (
        <AppText style={titleStyle}>{t('myEventsTab')}</AppText>
      ),
    ],
    [t],
  )

  useEffect(() => {
    store.load()
  }, [store])

  const onPageChange = useCallback((index: number) => {
    const pager = pagerRef.current
    if (!pager) return
    pager.setPage(index)
  }, [])

  const onPageScroll = useCallback(
    (e: PagerViewOnPageScrollEvent) =>
      tabsRef.current?.onPagerScroll?.(
        e.nativeEvent.position,
        e.nativeEvent.offset,
      ),
    [],
  )
  const onScrollStateChanged = useCallback(
    (e: PageScrollStateChangedNativeEvent) =>
      tabsRef.current?.onPagerScrollStateChanged?.(
        e.nativeEvent.pageScrollState === 'idle',
      ),
    [],
  )
  const onPageSelected = useCallback(
    (e: PagerViewOnPageSelectedEvent) =>
      tabsRef.current?.onPageSelected(e.nativeEvent.position),
    [],
  )

  const onEventMemberPress = useCallback(
    (event: EventModel, user: UserModel) => {
      analytics.sendEvent('upcoming_event_member_click', {
        eventId: event.id,
        userId: user.id,
      })
      onMemberPress(user, false)
    },
    [onMemberPress],
  )

  const onEventPress = useCallback((event: EventModel) => {
    analytics.sendEvent('upcoming_show_event_click', {
      eventId: event.id,
      eventName: event.title,
    })
    setEvent(event)
    setVisibleBottomSheet(true)
  }, [])

  const insets = useSafeAreaInsets()

  const headerRight = (
    <NavigationIconButton
      tint={colors.accentPrimary}
      icon={'icAddEvent'}
      onPress={() =>
        navigation.navigate('CreateEventScreen', {
          navigationRoot: 'UpcomingEventsScreen',
        })
      }
    />
  )
  return (
    <>
      <ContentLoadingView
        loading={store.isLoading}
        error={store.error}
        onRetry={store.load}
        style={{paddingBottom: insets.bottom}}>
        <AppNavigationHeader
          topInset={true}
          headerRight={headerRight}
          title={t('upcomingEventsScreenTitle')}
        />
        <Tabs
          ref={tabsRef}
          style={styles.tabs}
          tabsStyle={styles.tab}
          titlesStyle={[styles.titlesStyle, {color: colors.thirdBlack}]}
          highlightedTitleStyle={[
            styles.titlesStyle,
            {color: colors.primaryClickable},
          ]}
          initialPage={0}
          showSeparators={false}
          titles={titles}
          onChange={onPageChange}
        />
        <View style={[styles.separator, {backgroundColor: colors.separator}]} />
        <PagerView
          ref={pagerRef}
          style={[commonStyles.flexOne, {flexGrow: 1}]}
          onPageSelected={onPageSelected}
          onPageScroll={onPageScroll}
          onPageScrollStateChanged={onScrollStateChanged}
          initialPage={0}>
          <View style={commonStyles.webScrollingContainer}>
            <UpcomingEventsView
              store={store.upcomingEventsStore}
              onEventPress={onEventPress}
              onClubPress={onClubPress}
              onMemberPress={onEventMemberPress}
            />
          </View>
          <View style={commonStyles.webScrollingContainer}>
            <MyEventsView
              store={store.personalEventsStore}
              onEventPress={onEventPress}
              onClubPress={onClubPress}
              onMemberPress={onEventMemberPress}
            />
          </View>
        </PagerView>
      </ContentLoadingView>
      {!!selectedEvent && isVisibleBottomSheet && (
        <UpcomingEventBottomDialog
          isEditSupported={true}
          dismissOnMemberPress={false}
          onDismiss={() => {
            setVisibleBottomSheet(false)
          }}
          event={selectedEvent}
        />
      )}
    </>
  )
}

export const upcomingEventsScreen = observer(LocalUpcomingEventsScreen)

const upcomingEventsStackScreens = [
  {
    name: 'LocalUpcomingEventsScreen',
    component: upcomingEventsScreen,
    options: {headerShown: false},
  },

  {
    name: 'ProfileScreenModal',
    component: ProfileScreenModal,
    options: {headerShown: false, ...TransitionPresets.ModalPresentationIOS},
  },
]

const styles = StyleSheet.create({
  tabs: {
    alignSelf: 'center',
  },
  tab: {
    height: ms(42),
  },
  separator: {
    height: ms(1),
  },
  titlesStyle: {
    fontSize: ms(15),
    fontWeight: '600',
    lineHeight: ms(18),
  },
})

import {useNavigation} from '@react-navigation/native'
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack'
import {observer} from 'mobx-react'
import React, {useCallback, useContext, useEffect, useMemo, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {Keyboard, StyleProp, StyleSheet, TextStyle, View} from 'react-native'
import Animated from 'react-native-reanimated'

import {
  PagerViewOnPageScrollEvent,
  PagerViewOnPageSelectedEvent,
  PageScrollStateChangedNativeEvent,
} from 'react-native-pager-view/src/types'

import {appEventEmitter} from '../appEventEmitter'
import AppNavigationHeader from '../components/common/AppNavigationHeader'
import AppText from '../components/common/AppText'
import {
  resetKeyboardMode,
  setKeyboardMode,
} from '../components/common/DecorConfigModule'
import Tabs, {TabRef} from '../components/common/tabs/Tabs'
import ConnectingPeopleView from '../components/screens/followers/ConnectingPeopleView'
import FollowersView from '../components/screens/followers/FollowersView'
import AvailableToChatPage from '../components/screens/mainFeed/AvailableToChatPage'
import PagerView from '../components/webSafeImports/PagerView'
import {storage} from '../storage'
import {AvailableToChatStore} from '../stores/AvailableToChatStore'
import {FollowersStore} from '../stores/FollowersStore'
import {FollowingStore} from '../stores/FollowingStore'
import MyCountersStore from '../stores/MyCountersStore'
import {commonStyles, useTheme} from '../theme/appTheme'
import {baseNavigationScreenOptions} from '../theme/navigationTheme'
import {isWeb} from '../utils/device.utils'
import {ms} from '../utils/layout.utils'
import {push} from '../utils/navigation.utils'
import {useUpByMarginAnimation} from '../utils/reanimated.utils'
import {useViewModel} from '../utils/useViewModel'

const INITIAL_PAGE = 0
const Stack = createStackNavigator()

const MyNetworkScreen: React.FC = () => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  return (
    <Stack.Navigator
      mode={'modal'}
      //@ts-ignore
      screenOptions={baseNavigationScreenOptions(colors)}>
      <Stack.Screen
        name={'MyNetworkScreenLocal'}
        component={ObservedMyNetworkScreenLocal}
        options={{
          title: t('myNetworkScreenTitle'),
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

const MyNetworkScreenLocal: React.FC = () => {
  const {colors} = useTheme()
  const {t} = useTranslation()
  const navigation = useNavigation()
  const pagerRef = useRef<PagerView>(null)
  const tabsRef = useRef<TabRef>(null)
  const titles = useMemo(
    () => [
      (titleStyle: StyleProp<TextStyle>) => (
        <ConnectionTab titleStyle={titleStyle} />
      ),
      (titleStyle: StyleProp<TextStyle>) => (
        <AppText style={titleStyle}>
          {t('myNetworkPendingConnectionsTab')}
        </AppText>
      ),
      (titleStyle: StyleProp<TextStyle>) => (
        <AppText style={titleStyle}>
          {t('connectButtonStateIRequested')}
        </AppText>
      ),
    ],
    [t],
  )
  const availableToChatStore = useViewModel(() => new AvailableToChatStore())

  const pendingFollowersStore = useViewModel(
    () => new FollowersStore(storage.currentUser!.id, {pendingOnly: true}),
  )

  const connectingStore = useViewModel(
    () => new FollowingStore(storage.currentUser!.id, true),
  )

  const headerAnimation = useUpByMarginAnimation({
    initialValue: 0,
    downValue: 0,
    upValue: -ms(46),
    duration: 600,
  })

  useEffect(() => {
    availableToChatStore.refresh()
    setKeyboardMode('overlay')
    pendingFollowersStore.internalStore.load()
    connectingStore.internalStore.load()
    const backgroundWatcherDisposable = appEventEmitter.on(
      'appInBackground',
      Keyboard.dismiss,
    )
    return () => {
      resetKeyboardMode()
      backgroundWatcherDisposable()
    }
  }, [availableToChatStore, pendingFollowersStore, connectingStore])

  const onChange = useCallback((index: number) => {
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
  const onUserSelect = useCallback(
    (userId) => {
      push(navigation, 'ProfileScreenModal', {
        userId: userId,
        showCloseButton: false,
      })
    },
    [navigation],
  )

  return (
    <View style={[commonStyles.flexOne, commonStyles.wizardContainer]}>
      {isWeb && (
        <AppNavigationHeader
          topInset={true}
          title={t('myNetworkScreenTitle')}
        />
      )}
      <Animated.View style={[commonStyles.alignCenter, headerAnimation.style]}>
        <Tabs
          ref={tabsRef}
          style={styles.tabs}
          tabsStyle={styles.tab}
          titlesStyle={[styles.titlesStyle, {color: colors.thirdBlack}]}
          highlightedTitleStyle={[
            styles.titlesStyle,
            {color: colors.primaryClickable},
          ]}
          initialPage={INITIAL_PAGE}
          showSeparators={false}
          titles={titles}
          onChange={onChange}
        />
      </Animated.View>
      <PagerView
        ref={pagerRef}
        style={commonStyles.flexOne}
        onPageSelected={onPageSelected}
        onPageScroll={onPageScroll}
        onPageScrollStateChanged={onScrollStateChanged}
        initialPage={INITIAL_PAGE}>
        <View>
          {/* Connections */}
          <AvailableToChatPage
            style={[
              commonStyles.wizardContainer,
              commonStyles.webScrollingContainer,
            ]}
            users={availableToChatStore.list}
            isRefreshing={availableToChatStore.isRefreshing}
            onRefresh={availableToChatStore.refresh}
            onLoadMore={() => availableToChatStore.loadMore()}
          />
        </View>
        <View style={commonStyles.webScrollingContainer}>
          {/* Pending connections */}
          <FollowersView
            emptyViewConfig={{title: t('pendingConnectionsEmptyView')}}
            store={pendingFollowersStore}
            countersStore={null}
            onUserSelect={onUserSelect}
          />
        </View>
        <View>
          {/* Connecting with me */}
          <ConnectingPeopleView
            emptyViewConfig={{title: t('connectingEmptyView')}}
            store={connectingStore}
            countersStore={null}
            onUserSelect={onUserSelect}
          />
        </View>
      </PagerView>
    </View>
  )
}

const ObservedMyNetworkScreenLocal = observer(MyNetworkScreenLocal)

export default observer(MyNetworkScreen)

type TabProps = {
  titleStyle?: StyleProp<TextStyle>
}

const ConnectionTab: React.FC<TabProps> = observer(({titleStyle}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()
  const countersStore = useContext(MyCountersStore)
  return (
    <View style={{paddingEnd: ms(8)}}>
      <AppText
        style={[styles.titlesStyle, {color: colors.thirdBlack}, titleStyle]}>
        {t('myNetworkConnectionsTab')}
      </AppText>
      {countersStore.counters.countOnlineFriends > 0 && (
        <View
          style={[
            styles.connectionsIndicator,
            {backgroundColor: colors.activeAccent},
          ]}
        />
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  tabs: {
    paddingBottom: ms(4),
  },
  tab: {
    height: ms(42),
  },
  titlesStyle: {
    fontSize: ms(12),
    fontWeight: '600',
    lineHeight: ms(18),
  },
  connectionsIndicator: {
    position: 'absolute',
    top: -ms(4),
    right: 0,
    width: ms(8),
    height: ms(8),
    borderRadius: 100,
  },
})

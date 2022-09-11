import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {createStackNavigator, TransitionPresets} from '@react-navigation/stack'
import {observer} from 'mobx-react'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {LayoutChangeEvent, ScrollView, View} from 'react-native'
import Animated from 'react-native-reanimated'

import AppNavigationHeader from '../components/common/AppNavigationHeader'
import CancelableSearchBar from '../components/common/CancelableSearchBar'
import ContentLoadingView from '../components/common/ContentLoadingView'
import {
  resetKeyboardMode,
  setKeyboardMode,
} from '../components/common/DecorConfigModule'
import Horizontal from '../components/common/Horizontal'
import {NavigationBackButton} from '../components/common/NavigationBackButton'
import ExploreProvider, {
  useExploreContext,
} from '../components/screens/explore/ExploreContext'
import ExploreEmptyView from '../components/screens/explore/ExploreEmptyView'
import ExploreList from '../components/screens/explore/ExploreList'
import ExploreTabsView from '../components/screens/explore/ExploreTabsView'
import RecommendedClubsView from '../components/screens/explore/RecommendedClubsView'
import RecommendedPeopleView from '../components/screens/myNetwork/RecommendedPeopleView'
import {HandleComponent} from '../components/screens/room/CommonBottomSheet'
import {commonStyles, useTheme} from '../theme/appTheme'
import {baseNavigationScreenOptions} from '../theme/navigationTheme'
import {useLogRenderCount} from '../utils/debug.utils'

const Stack = createStackNavigator()

interface Props {
  isModal?: boolean
}

type ScreenRouteProp = RouteProp<{Screen: Props}, 'Screen'>

const ExploreScreen: React.FC = () => {
  const {params} = useRoute<ScreenRouteProp>()
  const {colors} = useTheme()
  const {t} = useTranslation()
  const isModal = params?.isModal ?? false

  return (
    <Stack.Navigator
      mode={'modal'}
      //@ts-ignore
      screenOptions={baseNavigationScreenOptions(colors)}>
      <Stack.Screen
        name={'ExploreScreenLocal'}
        component={ExploreScreenLocal}
        initialParams={params}
        options={{
          title: t('exploreScreenTitle'),
          ...TransitionPresets.ModalPresentationIOS,
          headerShown: !isModal,
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

const ExploreScreenLocal: React.FC<Props> = () => {
  const {params} = useRoute<ScreenRouteProp>()

  return (
    <ExploreProvider>
      <ExploreScreenView {...params} />
    </ExploreProvider>
  )
}

const ExploreScreenView: React.FC<Props> = observer((props) => {
  const {t} = useTranslation()
  const navigation = useNavigation()
  const {searchStore, exploreAnimations} = useExploreContext()
  const [isSearchSetUp, setSearchSetUp] = useState(false)
  const isSearchSetUpRef = useRef(isSearchSetUp)
  const [scrollViewWidth, setScrollViewWidth] = useState(0)
  const peopleViewPos = scrollViewWidth
  const clubsViewPos = scrollViewWidth * 2
  const scrollRef = useRef<ScrollView | null>(null)

  useLogRenderCount('ExploreScreen')

  useEffect(() => {
    isSearchSetUpRef.current = isSearchSetUp
  }, [isSearchSetUp])

  useEffect(() => {
    searchStore.onLoad()
    setKeyboardMode('overlay')
    return () => resetKeyboardMode()
  }, [searchStore])

  const onScrollViewLayout = useCallback((e: LayoutChangeEvent) => {
    setScrollViewWidth(e.nativeEvent.layout.width)
  }, [])

  const scrollToView = useCallback(
    (type: 'default' | 'people' | 'clubs') => {
      let position = 0
      switch (type) {
        case 'people':
          position = peopleViewPos
          break
        case 'clubs':
          position = clubsViewPos
          break
        default:
          break
      }
      scrollRef.current?.scrollTo({
        x: position,
        animated: false,
      })
    },
    [clubsViewPos, peopleViewPos],
  )

  useEffect(() => {
    if (!isSearchSetUpRef.current) return
    switch (searchStore.mode) {
      case 'people':
        exploreAnimations.runEnterSearchPeopleAnimation()
        scrollToView(searchStore.mode)
        break
      case 'clubs':
        exploreAnimations.runEnterSearchClubsAnimation()
        scrollToView(searchStore.mode)
        break
      default:
        break
    }
  }, [searchStore.mode, scrollToView, exploreAnimations])

  const onRetryLoad = useCallback(() => {
    setSearchSetUp(false)
    searchStore.onLoad()
  }, [searchStore])

  useEffect(() => {
    if (!searchStore.isRetrying) return
    exploreAnimations.runEnterExploreModeAnimation()
    scrollToView('default')
    searchStore.setMode('people')
  }, [exploreAnimations, scrollToView, searchStore.isRetrying])

  const onTextChanged = useCallback(
    (text: string) => {
      searchStore.setSearchMode(text.length > 0)
      searchStore.onSearchTextChange(text)
    },
    [searchStore],
  )

  const handleOnSetSearchMode = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        await exploreAnimations.runExitExploreModeAnimation()
        scrollToView(searchStore.mode)
        await exploreAnimations.runEnterSearchModeAnimation()
        return
      }
      await exploreAnimations.runExitSearchModeAnimation()
      scrollToView('default')
      await exploreAnimations.runEnterExploreModeAnimation()
    },
    [exploreAnimations, scrollToView, searchStore.mode],
  )

  const onSearchModeChanged = useCallback(
    (enabled: boolean) => {
      if (!enabled) searchStore.setSearchMode(false)
      setSearchSetUp(enabled)
    },
    [searchStore],
  )

  const placeholderTextActivated =
    searchStore.mode === 'people'
      ? t('selectInterestsFindPeople')
      : t('findClubs')

  const emptyViewNeed =
    !searchStore.isLoading &&
    searchStore.peopleExploreStore.list.length === 0 &&
    searchStore.clubsExploreStore.list.length === 0

  return (
    <View style={[commonStyles.flexOne, commonStyles.wizardContainer]}>
      {props.isModal && (
        <>
          <HandleComponent />
          <AppNavigationHeader
            topInset={false}
            title={t('exploreScreenTitle')}
            headerLeft={<NavigationBackButton onPress={navigation.goBack} />}
          />
        </>
      )}
      {!searchStore.error && (
        <CancelableSearchBar
          searchMode={isSearchSetUp}
          placeholderText={t('findClubsAndPeople')}
          placeholderTextActivated={placeholderTextActivated}
          isLoading={searchStore.searchMode && searchStore.isInProgress}
          onChangeText={onTextChanged}
          focusAfterAnimationMode={true}
          clickableOverlayEnabled={!isSearchSetUp}
          onSearchModeChanged={onSearchModeChanged}
          onSetSearchModeHandler={handleOnSetSearchMode}
        />
      )}
      <ScrollView
        ref={scrollRef}
        horizontal
        onLayout={onScrollViewLayout}
        keyboardShouldPersistTaps={'always'}
        scrollEnabled={false}>
        {scrollViewWidth > 0 && (
          <Horizontal style={{width: scrollViewWidth * 3}}>
            <Animated.View
              style={[
                exploreAnimations.sectionListStyle,
                {width: scrollViewWidth},
              ]}>
              <ContentLoadingView
                style={{width: scrollViewWidth}}
                onRetry={onRetryLoad}
                error={searchStore.error}
                loading={searchStore.isLoading}>
                <>
                  {emptyViewNeed && <ExploreEmptyView />}
                  {!emptyViewNeed && <ExploreList />}
                </>
              </ContentLoadingView>
            </Animated.View>
            <Animated.View
              style={[
                exploreAnimations.searchResultsStyle,
                {width: scrollViewWidth * 2},
              ]}>
              <Horizontal style={commonStyles.flexOne}>
                <ContentLoadingView
                  style={{width: scrollViewWidth}}
                  animated={false}
                  showLoader={false}
                  onRetry={onRetryLoad}
                  error={searchStore.error}
                  loading={searchStore.isLoading}>
                  <ExploreTabsView
                    selectedMode={searchStore.mode}
                    onSearchModeChange={searchStore.setMode}
                  />
                  <Animated.View
                    style={[
                      exploreAnimations.searchPeopleStyle,
                      commonStyles.flexOne,
                    ]}>
                    <RecommendedPeopleView
                      isActivated={
                        isSearchSetUp && searchStore.mode === 'people'
                      }
                      store={searchStore.peopleStore}
                      style={{width: scrollViewWidth}}
                    />
                  </Animated.View>
                </ContentLoadingView>
                <ContentLoadingView
                  style={{width: scrollViewWidth}}
                  animated={false}
                  showLoader={false}
                  onRetry={onRetryLoad}
                  error={searchStore.error}
                  loading={searchStore.isLoading}>
                  <ExploreTabsView
                    selectedMode={searchStore.mode}
                    onSearchModeChange={searchStore.setMode}
                  />
                  <Animated.View
                    style={[
                      exploreAnimations.searchClubsStyle,
                      commonStyles.flexOne,
                    ]}>
                    <RecommendedClubsView
                      store={searchStore.clubsStore}
                      style={{
                        width: scrollViewWidth,
                      }}
                      isActivated={
                        isSearchSetUp && searchStore.mode === 'clubs'
                      }
                    />
                  </Animated.View>
                </ContentLoadingView>
              </Horizontal>
            </Animated.View>
          </Horizontal>
        )}
      </ScrollView>
    </View>
  )
})

export default observer(ExploreScreen)

import {useNavigation} from '@react-navigation/native'
import React, {
  createContext,
  memo,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react'
import {Dimensions, ListRenderItem, StyleProp, ViewStyle} from 'react-native'
import {useAnimatedStyle, useSharedValue} from 'react-native-reanimated'

import {analytics} from '../../../Analytics'
import {ClubModel, UserModel} from '../../../models'
import ExploreSearchStore from '../../../stores/ExploreSearchStore'
import {useLogRenderCount} from '../../../utils/debug.utils'
import {animateNumberValues} from '../../../utils/reanimated.utils'
import {useViewModel} from '../../../utils/useViewModel'
import FollowingListItem from '../../common/FollowingListItem'
import ExploreClubListItem from './ExploreClubListItem'

type ExploreAnimationControl = {
  readonly sectionListStyle: StyleProp<ViewStyle>
  readonly searchResultsStyle: StyleProp<ViewStyle>
  readonly searchPeopleStyle: StyleProp<ViewStyle>
  readonly searchClubsStyle: StyleProp<ViewStyle>
  readonly runEnterExploreModeAnimation: () => Promise<void>
  readonly runExitExploreModeAnimation: () => Promise<void>
  readonly runEnterSearchModeAnimation: () => Promise<void>
  readonly runExitSearchModeAnimation: () => Promise<void>
  readonly runEnterSearchClubsAnimation: () => Promise<void>
  readonly runEnterSearchPeopleAnimation: () => Promise<void>
}

type ExploreContextType = {
  readonly searchStore: ExploreSearchStore
  readonly renderClubListItem: ListRenderItem<ClubModel> | null | undefined
  readonly renderUserItem: ListRenderItem<UserModel> | null | undefined
  readonly exploreAnimations: ExploreAnimationControl
}

const ExploreContext = createContext<ExploreContextType | null>(null)

export const useExploreContext = () => {
  const explore = useContext(ExploreContext)
  if (!explore) throw 'useExplore() cannot be used outside of explore context'
  return explore
}

const windowHeight = Dimensions.get('window').height
const listTranslationOffset = windowHeight * 0.1

const useExploreSearchAnimation = (): ExploreAnimationControl => {
  const sectionListOpacity = useSharedValue(1)
  const sectionListTranslation = useSharedValue(0)
  const searchResultsOpacity = useSharedValue(0)
  const searchResultsTranslation = useSharedValue(windowHeight)
  const searchPeopleOpacity = useSharedValue(1)
  const searchClubsOpacity = useSharedValue(0)
  const isSearchModeAnimRunning = useRef(false)

  const runEnterExploreModeAnimation = useCallback(async () => {
    if (isSearchModeAnimRunning.current) return
    const opacityConfig = {
      sharedValue: sectionListOpacity,
      duration: 200,
      from: 0,
      to: 1,
    }
    const translationConfig = {
      sharedValue: sectionListTranslation,
      duration: 140,
      from: listTranslationOffset,
      to: 0,
    }
    isSearchModeAnimRunning.current = true
    await animateNumberValues(opacityConfig, translationConfig)
    isSearchModeAnimRunning.current = false
  }, [sectionListOpacity, sectionListTranslation])

  const runExitExploreModeAnimation = useCallback(async () => {
    const opacityConfig = {
      sharedValue: sectionListOpacity,
      duration: 140,
      from: 1,
      to: 0,
    }
    const translationConfig = {
      sharedValue: sectionListTranslation,
      duration: 140,
      from: 0,
      to: listTranslationOffset,
    }
    await animateNumberValues(opacityConfig, translationConfig)
  }, [sectionListOpacity, sectionListTranslation])

  const runEnterSearchModeAnimation = useCallback(async () => {
    const opacityConfig = {
      sharedValue: searchResultsOpacity,
      duration: 200,
      from: 0,
      to: 1,
    }
    const translationConfig = {
      sharedValue: searchResultsTranslation,
      duration: 140,
      from: listTranslationOffset,
      to: 0,
    }
    isSearchModeAnimRunning.current = true
    await animateNumberValues(opacityConfig, translationConfig)
    isSearchModeAnimRunning.current = false
  }, [searchResultsOpacity, searchResultsTranslation])

  const runExitSearchModeAnimation = useCallback(async () => {
    const opacityConfig = {
      sharedValue: searchResultsOpacity,
      duration: 140,
      from: 1,
      to: 0,
    }
    const translationConfig = {
      sharedValue: searchResultsTranslation,
      duration: 400,
      from: 0,
      to: windowHeight,
    }
    await animateNumberValues(opacityConfig, translationConfig)
  }, [searchResultsOpacity, searchResultsTranslation])

  const runEnterSearchPeopleAnimation = useCallback(async () => {
    if (isSearchModeAnimRunning.current) return
    const inOpacityConfig = {
      sharedValue: searchPeopleOpacity,
      duration: 120,
      from: 0,
      to: 1,
    }
    const outOpacityConfig = {
      sharedValue: searchClubsOpacity,
      duration: 120,
      from: 1,
      to: 0,
    }
    await animateNumberValues(inOpacityConfig, outOpacityConfig)
  }, [searchClubsOpacity, searchPeopleOpacity])

  const runEnterSearchClubsAnimation = useCallback(async () => {
    const inOpacityConfig = {
      sharedValue: searchClubsOpacity,
      duration: 120,
      from: 0,
      to: 1,
    }
    const outOpacityConfig = {
      sharedValue: searchPeopleOpacity,
      duration: 120,
      from: 1,
      to: 0,
    }
    await animateNumberValues(outOpacityConfig, inOpacityConfig)
  }, [searchClubsOpacity, searchPeopleOpacity])

  const sectionListStyle = useAnimatedStyle(() => {
    return {
      opacity: sectionListOpacity.value,
      transform: [{translateY: sectionListTranslation.value}],
    }
  }, [])

  const searchResultsStyle = useAnimatedStyle(() => {
    return {
      opacity: searchResultsOpacity.value,
      transform: [{translateY: searchResultsTranslation.value}],
    }
  }, [])

  const searchPeopleStyle = useAnimatedStyle(() => {
    return {
      opacity: searchPeopleOpacity.value,
    }
  }, [])

  const searchClubsStyle = useAnimatedStyle(() => {
    return {
      opacity: searchClubsOpacity.value,
    }
  }, [])

  return {
    sectionListStyle,
    searchResultsStyle,
    searchPeopleStyle,
    searchClubsStyle,
    runEnterExploreModeAnimation,
    runExitExploreModeAnimation,
    runEnterSearchModeAnimation,
    runExitSearchModeAnimation,
    runEnterSearchPeopleAnimation,
    runEnterSearchClubsAnimation,
  }
}

const ExploreProvider: React.FC<PropsWithChildren<any>> = ({children}) => {
  const navigation = useNavigation()
  const searchStore = useViewModel(() => new ExploreSearchStore())

  const exploreAnimations = useExploreSearchAnimation()
  useLogRenderCount('ExploreProvider')

  const onOwnerPress = useCallback(
    (user) => {
      navigation.navigate('ProfileScreenModal', {
        userId: user.id,
        navigationRoot: 'ExploreScreen',
      })
    },
    [navigation],
  )

  const onClubPress = useCallback(
    (club) => {
      analytics.sendEvent('explore_open_club_profile', {})
      navigation.navigate('ProfileScreenModal', {
        clubId: club.id,
        isModal: true,
        initialScreen: 'ClubScreen',
        navigationRoot: 'ExploreScreen',
      })
    },
    [navigation],
  )

  const onUserSelect = useCallback(
    (user) => {
      analytics.sendEvent('explore_open_person_profile', {})
      navigation.navigate('ProfileScreenModal', {
        userId: user,
        showCloseButton: false,
      })
    },
    [navigation],
  )

  const renderClubListItem = useCallback(
    ({item}) => {
      return (
        <ExploreClubListItem
          club={item}
          onClubPress={onClubPress}
          onOwnerPress={onOwnerPress}
        />
      )
    },
    [onClubPress, onOwnerPress],
  )

  const renderUserItem = useCallback(
    ({item, index}) => {
      return (
        <FollowingListItem
          key={`${searchStore.peopleStore.searchMode}-${item.id}`}
          index={index}
          user={item}
          onStateChanged={searchStore.peopleStore.onFollowingStateChanged}
          onSelect={onUserSelect}
        />
      )
    },
    [searchStore.peopleStore, onUserSelect],
  )

  const contextValue: ExploreContextType = useMemo(() => {
    return {
      renderClubListItem,
      renderUserItem,
      searchStore,
      exploreAnimations,
    }
  }, [renderClubListItem, renderUserItem, searchStore, exploreAnimations])

  return (
    <ExploreContext.Provider value={contextValue}>
      {children}
    </ExploreContext.Provider>
  )
}

export default memo(ExploreProvider)

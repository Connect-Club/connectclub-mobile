import {useCallback, useEffect, useMemo} from 'react'
import {ImageStyle, TextStyle, ViewStyle} from 'react-native'
import {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'

import {animateNumberValues} from '../../../utils/reanimated.utils'
import {appNavigationHeaderHeight} from '../../common/AppNavigationHeader'
import {ReanimatedStyleProp} from '../../webSafeImports/webSafeImports'

const CANCEL_BUTTON_DURATION = 400
const TOOLBAR_SHOW_DURATION = 600
const TOOLBAR_HIDE_DURATION = 200
const SEARCHBAR_DURATION = 400

interface HeaderAnimations {
  readonly toggleToolbar: (visible: boolean) => Promise<void>
  readonly toolbarAnimatedStyle: ReanimatedStyleProp<
    ViewStyle | ImageStyle | TextStyle
  >
  readonly searchbarAnimatedStyle: ReanimatedStyleProp<
    ViewStyle | ImageStyle | TextStyle
  >
}

export const useRecommendedHeaderAnimations = (cancelButtonWidth: number) => {
  const deps = [cancelButtonWidth.toFixed()]
  const toolbarOpacity = useSharedValue(1)
  const searchContainerOffset = useSharedValue(0)
  const searchbarMargin = useSharedValue(0)
  const toolbarAnimatedStyle = useAnimatedStyle(() => ({
    opacity: toolbarOpacity.value,
  }))
  const searchbarAnimatedStyle = useAnimatedStyle(() => ({
    flexBasis: '100%',
    marginRight: -searchbarMargin.value,
    paddingRight: searchbarMargin.value,
  }))

  const cancelAllAnimations = useCallback(() => {
    cancelAnimation(searchContainerOffset)
    cancelAnimation(toolbarOpacity)
    cancelAnimation(searchbarMargin)
  }, [])
  useEffect(() => {
    return cancelAllAnimations
  }, [])
  const showToolbar = useCallback(() => {
    cancelAllAnimations()
    return animateNumberValues(
      {
        sharedValue: toolbarOpacity,
        from: 0,
        to: 1,
        duration: TOOLBAR_SHOW_DURATION,
      },
      {
        sharedValue: searchContainerOffset,
        from: -appNavigationHeaderHeight,
        to: 0,
        duration: SEARCHBAR_DURATION,
      },
      {
        sharedValue: searchbarMargin,
        from: cancelButtonWidth,
        to: 0,
        duration: CANCEL_BUTTON_DURATION,
      },
    )
  }, deps)
  const hideToolbar = useCallback(() => {
    cancelAllAnimations()
    return animateNumberValues(
      {
        sharedValue: toolbarOpacity,
        from: 1,
        to: 0,
        duration: TOOLBAR_HIDE_DURATION,
      },
      {
        sharedValue: searchContainerOffset,
        from: 0,
        to: -appNavigationHeaderHeight,
        duration: SEARCHBAR_DURATION,
      },
      {
        sharedValue: searchbarMargin,
        from: 0,
        to: cancelButtonWidth,
        duration: CANCEL_BUTTON_DURATION,
      },
    )
  }, deps)
  const toggleToolbar = useCallback(
    (visible: boolean) => {
      if (visible) return showToolbar()
      else return hideToolbar()
    },
    [showToolbar, hideToolbar],
  )

  return useMemo<HeaderAnimations>(
    () => ({
      toggleToolbar,
      toolbarAnimatedStyle,
      searchbarAnimatedStyle,
    }),
    [toggleToolbar, toolbarAnimatedStyle, searchbarAnimatedStyle],
  )
}

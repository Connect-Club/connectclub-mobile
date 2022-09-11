import {observer} from 'mobx-react'
import React, {useCallback, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Platform, StyleSheet, View} from 'react-native'
import Animated from 'react-native-reanimated'

import {useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import AppSearchBar, {AppSearchBarRef} from '../screens/AppSearchBar'
import {useRecommendedHeaderAnimations} from '../screens/myNetwork/recommendedScreenAnimations'
import {appNavigationHeaderHeight} from './AppNavigationHeader'
import AppText from './AppText'
import AppTouchableOpacity from './AppTouchableOpacity'
import {clearWindowFocus} from './DecorConfigModule'

interface Props {
  readonly searchMode: boolean
  readonly placeholderText: string
  readonly placeholderTextActivated?: string
  readonly isLoading: boolean
  readonly onChangeText: (text: string) => void
  /** To waiting for animations that need to play before mode has been changed */
  readonly onSetSearchModeHandler?: (enabled: boolean) => Promise<void>
  readonly onSearchModeChanged?: (enabled: boolean) => void
  readonly focusAfterAnimationMode?: boolean
  readonly clickableOverlayEnabled?: boolean
}

const CancelableSearchBar: React.FC<Props> = ({
  searchMode,
  placeholderText,
  placeholderTextActivated,
  isLoading,
  onChangeText,
  onSetSearchModeHandler,
  onSearchModeChanged,
  focusAfterAnimationMode,
  clickableOverlayEnabled,
}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  const searchInputRef = useRef<AppSearchBarRef>(null)
  const [cancelButtonWidth, setCancelButtonWidth] = useState(0)
  const headerAnimations = useRecommendedHeaderAnimations(cancelButtonWidth)
  const isInToggleSearchMode = useRef(false)

  const cancelButtonWidthReceiver = useCallback(
    (e) => setCancelButtonWidth(e.nativeEvent.layout.width),
    [setCancelButtonWidth],
  )
  const toggleSearchMode = useCallback(
    async (enabled: boolean) => {
      if (searchMode === enabled) return
      isInToggleSearchMode.current = true
      await Promise.all([
        onSetSearchModeHandler?.(enabled),
        headerAnimations.toggleToolbar(!enabled),
      ])
      if (focusAfterAnimationMode && enabled) {
        // Manual requesting of a focus
        if (Platform.OS === 'ios') {
          setTimeout(() => searchInputRef.current?.focus(), 200)
        } else {
          searchInputRef.current?.focus()
        }
      }
      if (!enabled) searchInputRef.current?.blur()
      isInToggleSearchMode.current = false
      onSearchModeChanged?.(enabled)
    },
    [
      headerAnimations,
      onSetSearchModeHandler,
      onSearchModeChanged,
      searchMode,
      focusAfterAnimationMode,
    ],
  )
  const onFocus = useCallback(() => {
    if (isInToggleSearchMode.current) return
    toggleSearchMode(true)
  }, [toggleSearchMode])
  const onClickToFocus = useCallback(() => {
    if (isInToggleSearchMode.current) return
    toggleSearchMode(true)
  }, [toggleSearchMode])
  const onCancelSearchMode = useCallback(async () => {
    const clear = () => {
      searchInputRef?.current?.clear()
      searchInputRef?.current?.blur()
      clearWindowFocus()
    }
    toggleSearchMode(false).then(clear)
    clear()
  }, [toggleSearchMode])

  return (
    <View
      style={[
        styles.searchContainer,
        {backgroundColor: colors.systemBackground},
      ]}>
      <Animated.View style={headerAnimations.searchbarAnimatedStyle}>
        <AppSearchBar
          ref={searchInputRef}
          placeholderText={placeholderText}
          placeholderTextActivated={placeholderTextActivated}
          onChangeText={onChangeText}
          isLoading={isLoading}
          clickableOverlay={clickableOverlayEnabled}
          onClick={focusAfterAnimationMode ? onClickToFocus : undefined}
          onFocus={focusAfterAnimationMode ? undefined : onFocus}
        />
      </Animated.View>
      <AppTouchableOpacity
        onPress={onCancelSearchMode}
        onLayout={cancelButtonWidthReceiver}>
        <AppText
          style={[styles.cancelButtonText, {color: colors.primaryClickable}]}>
          {t('cancelButton')}
        </AppText>
      </AppTouchableOpacity>
    </View>
  )
}

export default observer(CancelableSearchBar)

const styles = StyleSheet.create({
  searchContainer: {
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButtonText: {
    marginEnd: ms(16),
    fontSize: ms(17),
    lineHeight: ms(25),
    textAlignVertical: 'center',
    ...Platform.select({
      ios: {lineHeight: appNavigationHeaderHeight + ms(10)},
      android: {},
    }),
  },
})

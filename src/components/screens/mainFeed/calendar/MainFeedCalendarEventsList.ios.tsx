import React, {useCallback, useRef} from 'react'
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
} from 'react-native'

import {PagerViewOnPageSelectedEvent} from 'react-native-pager-view/src/types'

import {maxWidth, ms} from '../../../../utils/layout.utils'
import {CALENDAR_EVENT_HEIGHT} from './mainFeedCalendar.contstants'

interface Props {
  readonly onPageSelected: (event: PagerViewOnPageSelectedEvent) => void
  readonly height?: number
}

const screenWidth = maxWidth()

export const MainFeedCalendarEventsList: React.FC<Props> = ({
  onPageSelected,
  height = CALENDAR_EVENT_HEIGHT,
  children,
}) => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = event.nativeEvent.contentOffset.x
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        // @ts-ignore
        onPageSelected({
          nativeEvent: {
            position: x / screenWidth,
          },
        })
      }, 60)
    },
    [],
  )

  return (
    <ScrollView
      style={[styles.pager, {height: height}]}
      pagingEnabled={true}
      horizontal
      scrollEventThrottle={16}
      showsHorizontalScrollIndicator={Platform.OS === 'web'}
      onScroll={onScroll}>
      {children}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  pager: {
    marginHorizontal: -ms(16),
  },
})

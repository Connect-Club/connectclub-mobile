import React from 'react'
import {StyleSheet} from 'react-native'
import PagerView from 'react-native-pager-view'

import {PagerViewOnPageSelectedEvent} from 'react-native-pager-view/src/types'

import {ms} from '../../../../utils/layout.utils'
import {CALENDAR_EVENT_HEIGHT} from './mainFeedCalendar.contstants'

interface Props {
  readonly onPageSelected: (event: PagerViewOnPageSelectedEvent) => void
  readonly height?: number
}

export const MainFeedCalendarEventsList: React.FC<Props> = ({
  onPageSelected,
  height = CALENDAR_EVENT_HEIGHT,
  children,
}) => {
  return (
    <PagerView
      style={[styles.pager, {height}]}
      offscreenPageLimit={1}
      onPageSelected={onPageSelected}>
      {children}
    </PagerView>
  )
}

const styles = StyleSheet.create({
  pager: {
    marginHorizontal: -ms(16),
  },
})

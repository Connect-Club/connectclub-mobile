import React from 'react'
import {PagerViewOnPageSelectedEvent} from 'react-native-pager-view'

import {MainFeedCalendarEventsList as MainFeedCalendarEventsListIos} from './MainFeedCalendarEventsList.ios'

interface Props {
  readonly onPageSelected: (event: PagerViewOnPageSelectedEvent) => void
  readonly height?: number
}

export const MainFeedCalendarEventsList: React.FC<Props> = (props) => {
  return <MainFeedCalendarEventsListIos {...props} />
}

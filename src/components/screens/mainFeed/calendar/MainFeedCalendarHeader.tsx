import React, {memo, useCallback, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {PagerViewOnPageSelectedEvent} from 'react-native-pager-view/src/types'

import {analytics} from '../../../../Analytics'
import {ClubInfoModel, EventModel} from '../../../../models'
import {ms} from '../../../../utils/layout.utils'
import MainFeedSectionTitle from '../MainFeedSectionTitle'
import {CALENDAR_EVENT_HEIGHT} from './mainFeedCalendar.contstants'
import MainFeedCalendarEmpty from './MainFeedCalendarEmpty'
import {MainFeedCalendarEventsList} from './MainFeedCalendarEventsList'
import MainFeedCalendarListItem from './MainFeedCalendarListItem'
import {MainFeedCalendarMoreEvents} from './MainFeedCalendarMoreEvents'
import MainFeedCalendarPagerDots from './MainFeedCalendarPagerDots'

interface Props {
  readonly events: Array<EventModel>
  readonly onEventPress: (event: EventModel) => void
  readonly onClubPress: (club: ClubInfoModel) => void
}

const MainFeedCalendarHeader: React.FC<Props> = (p) => {
  const {t} = useTranslation()
  const [selected, setSelected] = useState(0)

  const onSelected = useCallback((event: PagerViewOnPageSelectedEvent) => {
    setSelected(event.nativeEvent.position)
    analytics.sendEvent('main_feed_events_swipe')
  }, [])

  const onClubProxy = useCallback(
    (event: EventModel) => {
      if (!event.club) return
      analytics.sendEvent('main_feed_event_host_club_click', {
        eventId: event.id,
        eventName: event.title,
        clubId: event.club.id,
      })
      p.onClubPress(event.club)
    },
    [p],
  )

  if (p.events.length === 0)
    return (
      <View>
        <MainFeedSectionTitle title={t('futureEvents')} />
        <MainFeedCalendarEmpty />
      </View>
    )

  return (
    <View style={styles.base} accessibilityLabel={'mainFeedCalendarHeader'}>
      <MainFeedSectionTitle title={t('futureEvents')} />
      <MainFeedCalendarEventsList onPageSelected={onSelected}>
        {p.events.map((e, index) => {
          if (index < 9) {
            return (
              <MainFeedCalendarListItem
                onEventPress={() => p.onEventPress(e)}
                onClubPress={() => onClubProxy(e)}
                model={e}
                key={e.id}
              />
            )
          }
          return <MainFeedCalendarMoreEvents key={e.id} />
        })}
      </MainFeedCalendarEventsList>
      <MainFeedCalendarPagerDots count={p.events.length} selected={selected} />
    </View>
  )
}

export default memo(MainFeedCalendarHeader)

const styles = StyleSheet.create({
  base: {
    height: CALENDAR_EVENT_HEIGHT + ms(40 + 16 + 8),
    marginBottom: ms(32),
  },

  pager: {
    height: CALENDAR_EVENT_HEIGHT,
    marginHorizontal: -ms(16),
  },

  listItem: {
    height: ms(42),
    alignItems: 'center',
    paddingHorizontal: ms(16),
    overflow: 'hidden',
    flexDirection: 'row',
  },

  dateText: {
    fontSize: ms(12),
    marginEnd: ms(8),
  },

  titleText: {
    flex: 1,
    fontSize: ms(13),
  },
})

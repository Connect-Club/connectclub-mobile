import {observer} from 'mobx-react'
import React, {useCallback, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {View} from 'react-native'

import {PagerViewOnPageSelectedEvent} from 'react-native-pager-view/src/types'

import {analytics} from '../../../Analytics'
import {appEventEmitter} from '../../../appEventEmitter'
import {EventModel, UserModel} from '../../../models'
import ClubStore from '../../../stores/ClubStore'
import {ms} from '../../../utils/layout.utils'
import Section from '../../common/Section'
import {MainFeedCalendarEventsList} from '../mainFeed/calendar/MainFeedCalendarEventsList'
import MainFeedCalendarPagerDots from '../mainFeed/calendar/MainFeedCalendarPagerDots'
import UpcomingEventListItem from '../upcomingEvents/UpcomingEventListItem'
import {useUpcomingEventActions} from '../upcomingEvents/UseUpcomingEventActions'

interface Props {
  readonly store: ClubStore
  readonly disabledLinks?: boolean
}

const ClubEventsView: React.FC<Props> = ({store, disabledLinks = false}) => {
  const [selected, setSelected] = useState(0)
  const {onMemberPress} = useUpcomingEventActions()
  const {t} = useTranslation()
  const onSelected = useCallback(
    (event: PagerViewOnPageSelectedEvent) => {
      analytics.sendEvent('club_view_events_swipe', {clubId: store.clubId})
      setSelected(event.nativeEvent.position)
    },
    [store.clubId],
  )

  const onEventMemberPress = useCallback(
    (event: EventModel, user: UserModel) => {
      analytics.sendEvent('club_view_event_member_click', {
        clubId: store.clubId,
        eventId: event.id,
        userId: user.id,
      })
      onMemberPress(user, false)
    },
    [store, onMemberPress],
  )

  const onEventPress = useCallback(
    (event: EventModel) => {
      if (disabledLinks) return
      analytics.sendEvent('club_view_show_event_click', {
        eventId: event.id,
        eventName: event.title,
        clubId: store.clubId,
      })
      appEventEmitter.trigger('showEventDialog', event)
    },
    [disabledLinks, store.clubId],
  )

  if (store.clubEvents.length === 0) return null

  return (
    <View style={{marginTop: ms(8)}}>
      <Section
        title={t('upcomingEvents').toUpperCase()}
        count={store.clubEvents.length}
      />
      <MainFeedCalendarEventsList onPageSelected={onSelected} height={ms(200)}>
        {store.clubEvents.map((e) => {
          return (
            <UpcomingEventListItem
              key={e.id}
              event={e}
              clubScreen={true}
              onMemberPress={(u) => {
                onEventMemberPress(e, u)
              }}
              isDisabled={disabledLinks}
              onClubPress={() => {}}
              onPress={onEventPress}
            />
          )
        })}
      </MainFeedCalendarEventsList>
      <MainFeedCalendarPagerDots
        count={store.clubEvents.length}
        selected={selected}
      />
    </View>
  )
}

export default observer(ClubEventsView)

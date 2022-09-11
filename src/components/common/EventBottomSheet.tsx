import {useNavigation} from '@react-navigation/native'
import React, {memo, useEffect, useState} from 'react'

import {analytics} from '../../Analytics'
import {api} from '../../api/api'
import {appEventEmitter, hideLoading, showLoading} from '../../appEventEmitter'
import {EventModel, Unknown} from '../../models'
import UpcomingEventBottomDialog from '../screens/mainFeed/UpcomingEventBottomDialog'
import {logJS} from '../screens/room/modules/Logger'

const EventBottomSheet: React.FC = () => {
  const [showEvent, setShowEvent] = useState<EventModel | Unknown>()
  const onEventDialogDismiss = () => {
    logJS('debug', 'EventBottomSheet', 'on dismiss')
    setShowEvent(null)
  }
  const navigation = useNavigation()

  useEffect(() => {
    return appEventEmitter.on('showEventDialog', async (eventData) => {
      logJS('debug', 'EventBottomSheet', 'UpcomingEventBottomDialog', 'show')
      let data: EventModel | undefined
      if (Object.keys(eventData).length > 1) {
        data = eventData
      } else {
        showLoading()
        data = (await api.fetchUpcomingEvent(eventData.id)).data
        hideLoading()
      }

      if (!data) {
        logJS(
          'error',
          'EventBottomSheet',
          'failed to load event data for event',
          JSON.stringify(eventData),
        )
        return
      }
      if (navigation.isFocused()) {
        analytics.sendEvent('show_upcoming_event_sheet')
        setShowEvent(data)
      } else {
        navigation.navigate('MainFeedListScreen')
        setTimeout(() => setShowEvent(data), 0)
      }
    })
  }, [navigation])

  return (
    <>
      {showEvent && (
        <UpcomingEventBottomDialog
          isEditSupported={false}
          dismissOnMemberPress={true}
          onDismiss={onEventDialogDismiss}
          event={showEvent}
        />
      )}
    </>
  )
}

export default memo(EventBottomSheet)

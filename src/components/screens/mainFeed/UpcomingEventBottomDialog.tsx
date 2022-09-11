import React, {useCallback, useEffect} from 'react'

import {analytics} from '../../../Analytics'
import {appEventEmitter} from '../../../appEventEmitter'
import {EventModel} from '../../../models'
import BaseAutoHeightBottomSheet from '../../BaseAutoHeightBottomSheet'
import {logJS} from '../room/modules/Logger'
import BottomSheetUpcomingEventView from '../upcomingEvents/BottomSheetUpcomingEventView'
import {useUpcomingEventActions} from '../upcomingEvents/UseUpcomingEventActions'

interface Props {
  readonly event: EventModel
  readonly dismissOnMemberPress: boolean
  readonly onDismiss: () => void
  readonly isEditSupported: boolean
  readonly transparent?: boolean
}

const UpcomingEventBottomDialog: React.FC<Props> = (props) => {
  const {
    sheetRef,
    onMemberPress,
    onClubPress,
    onApprovePress,
    onCancelPress,
    onDeletePress,
    onStartRoom,
    onJoinRoom,
  } = useUpcomingEventActions()

  useEffect(() => {
    appEventEmitter.once('hideEventDialog', () => {
      logJS('debug', 'UpcomingEventBottomDialog', 'hide')
      sheetRef.current?.close()
      props.onDismiss()
    })
  }, [])

  const onMemberPressInternal = useCallback((m) => {
    analytics.sendEvent('event_card_speaker_click', {
      eventId: props.event.id,
      eventName: props.event.title,
      userId: m.id,
    })
    onMemberPress(m, props.dismissOnMemberPress)
  }, [])

  const onClubPressInternal = useCallback((m) => {
    analytics.sendEvent('event_card_host_club_click', {
      eventId: props.event.id,
      eventName: props.event.title,
      clubId: m.id,
    })
    onClubPress(m, props.dismissOnMemberPress)
  }, [])

  const onDeletePressInternal = useCallback((m) => {
    if (m.isPrivate) {
      onCancelPress(m)
    } else {
      onDeletePress(m)
    }
  }, [])

  return (
    <BaseAutoHeightBottomSheet
      ref={sheetRef}
      isVisible={true}
      onClose={props.onDismiss}
      transparent={props.transparent}>
      <BottomSheetUpcomingEventView
        onJoinRoom={onJoinRoom}
        onStartRoom={onStartRoom}
        onDeletePress={onDeletePressInternal}
        onApproveEvent={onApprovePress}
        event={props.event}
        onMemberPress={onMemberPressInternal}
        onClubPress={onClubPressInternal}
      />
    </BaseAutoHeightBottomSheet>
  )
}

export default UpcomingEventBottomDialog

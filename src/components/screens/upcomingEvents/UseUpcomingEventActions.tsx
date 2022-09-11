import {useNavigation} from '@react-navigation/native'
import {useCallback, useContext, useRef} from 'react'
import {useTranslation} from 'react-i18next'

import {analytics} from '../../../Analytics'
import {appEventEmitter, startRoomFromEvent} from '../../../appEventEmitter'
import {ClubInfoModel, EventModel, UserModel} from '../../../models'
import UpcomingEventsStore from '../../../stores/UpcomingEventsStore'
import {delay} from '../../../utils/date.utils'
import {push} from '../../../utils/navigation.utils'
import {alert, BottomSheet} from '../../webSafeImports/webSafeImports'
import {logJS} from '../room/modules/Logger'

export const useUpcomingEventActions = () => {
  const {t} = useTranslation()
  const navigation = useNavigation()
  const sheetRef = useRef<BottomSheet>(null)
  const store = useContext(UpcomingEventsStore)

  const onMemberPress = useCallback(
    async (user: UserModel, dismiss: boolean) => {
      if (dismiss) {
        sheetRef.current?.close()
        await delay(500)
      }
      push(navigation, 'ProfileScreenModal', {userId: user.id})
    },
    [navigation],
  )

  const onApprovePress = useCallback(
    async (event: EventModel) => {
      analytics.sendEvent('click_private_meeting_approve')
      await store.approveEvent(event.id)
      sheetRef.current?.close()
    },
    [store],
  )

  const onCancelPress = useCallback(
    (event: EventModel) => {
      analytics.sendEvent('click_private_meeting_cancel')
      store.cancelEvent(event.id)
      sheetRef.current?.close()
    },
    [store],
  )

  const onClubPress = useCallback(
    async (club: ClubInfoModel, dismiss: boolean) => {
      if (dismiss) {
        sheetRef.current?.close()
        await delay(500)
      }
      navigation.navigate('ClubScreen', {clubId: club.id})
    },
    [navigation],
  )

  const onDeletePress = useCallback(
    (event: EventModel) => {
      alert(t('deleteEventAlertTitle'), undefined, [
        {style: 'cancel', text: t('cancelButton')},
        {
          style: 'destructive',
          text: t('deleteButton'),
          onPress: () => {
            store.deleteEvent(event.id)
            sheetRef.current?.close()
            appEventEmitter.trigger('refreshMainFeed')
          },
        },
      ])
    },
    [t, store],
  )

  const onStartRoom = useCallback((event: EventModel) => {
    logJS('debug', 'UseUpcomingEventActions', 'start room; event:', event.id)
    sheetRef.current?.close()
    startRoomFromEvent(event.id, event.title, event.language, event.isPrivate)
  }, [])

  const onJoinRoom = useCallback((event: EventModel) => {
    logJS('debug', 'UseUpcomingEventActions', 'join room: event', event.roomId)
    if (!event || !event.roomId || !event.roomPass) return
    sheetRef.current?.close()
    appEventEmitter.trigger('joinRoom', event)
  }, [])

  return {
    onMemberPress,
    onClubPress,
    onApprovePress,
    onCancelPress,
    onDeletePress,
    onStartRoom,
    onJoinRoom,
    sheetRef,
    store,
  }
}

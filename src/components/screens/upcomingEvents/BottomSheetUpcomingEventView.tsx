import {observer} from 'mobx-react'
import moment from 'moment'
import React, {useCallback, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {Platform, StyleSheet, View} from 'react-native'
import * as AddCalendarEvent from 'react-native-add-calendar-event'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {analytics} from '../../../Analytics'
import {ClubInfoModel, EventModel, UserModel} from '../../../models'
import UpcomingEventStore from '../../../stores/UpcomingEventStore'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {
  copyEventToClipboard,
  getEventLink,
  shareLink,
} from '../../../utils/sms.utils'
import {useViewModel} from '../../../utils/useViewModel'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import ContentLoadingView from '../../common/ContentLoadingView'
import Horizontal from '../../common/Horizontal'
import PrimaryButton from '../../common/PrimaryButton'
import Spacer from '../../common/Spacer'
import VerticalIconTextButton from '../../common/VerticalIconTextButton'
import {logJS} from '../room/modules/Logger'
import EventNftNoticeView from './EventNftNoticeView'
import UpcomingEventListItem from './UpcomingEventListItem'

interface Props {
  readonly event: EventModel
  readonly onMemberPress: (user: UserModel) => void
  readonly onClubPress: (user: ClubInfoModel) => void
  readonly onApproveEvent?: (event: EventModel) => void
  readonly onDeletePress?: (event: EventModel) => void
  readonly onStartRoom?: (event: EventModel) => void
  readonly onJoinRoom?: (event: EventModel) => void
}

const BottomSheetUpcomingEventView: React.FC<Props> = ({
  event,
  onMemberPress,
  onDeletePress,
  onJoinRoom,
  onApproveEvent,
  onStartRoom,
  onClubPress,
}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()
  const inset = useSafeAreaInsets()
  const store = useViewModel(() => new UpcomingEventStore())

  event = store.event ?? event

  useEffect(() => {
    if (!event.withToken) {
      // can show event immediately and then update
      store.initWithEvent(event)
    }
    logJS('debug', 'BottomSheetUpcomingEventView', 'init store with event id')
    store.init(event.id)
  }, [event.id, store, event])

  const addToCalendar = useCallback(() => {
    const link = `${getEventLink(
      event.id,
      event.club?.slug,
      event.club?.id,
      'calendar',
    )}`
    const format = 'yyyy-MM-DDTHH:mm:ss.SSS[Z]'
    const startDate = moment.unix(event.date).utc().format(format)
    const endDate = moment.unix(event.date).utc().add(1, 'hour').format(format)
    analytics.sendEvent('event_card_add_to_calendar', {
      eventId: event.id,
      eventName: event.title,
    })
    AddCalendarEvent.presentEventCreatingDialog({
      title: event.title,
      startDate,
      endDate,
      url: Platform.OS === 'ios' ? link : undefined,
      notes: Platform.OS !== 'ios' ? link : undefined,
    })
  }, [event.club?.slug, event.date, event.id, event.title])

  const onShareEvent = useCallback(() => {
    shareLink(
      getEventLink(event.id, event.club?.slug, event.club?.id, 'share_event'),
    )
    analytics.sendEvent('event_card_share_click', {
      eventId: event.id,
      eventName: event.title,
    })
  }, [event.club?.id, event.club?.slug, event.id])

  const onCopyEvent = useCallback(() => {
    copyEventToClipboard(event.id, event.club?.slug, event.club?.id)
    analytics.sendEvent('event_card_copy_link', {
      eventId: event.id,
      eventName: event.title,
    })
  }, [event.club?.id, event.club?.slug, event.id])

  const onRetry = useCallback(() => {
    store.init(event.id)
  }, [event.id, store])

  return (
    <ContentLoadingView
      style={styles.base}
      loading={store.isInProgress && !store.event}
      error={store.error}
      onRetry={onRetry}>
      {store.event && (
        <>
          <EventNftNoticeView store={store} />
          <UpcomingEventListItem
            isScrollable={true}
            event={store.event}
            onMemberPress={onMemberPress}
            onClubPress={onClubPress}
          />
          <Horizontal style={styles.buttonsContainer}>
            <VerticalIconTextButton
              style={styles.button}
              icon={'icShare'}
              tint={colors.accentPrimary}
              title={t('share')}
              onPress={onShareEvent}
            />

            {Platform.OS !== 'web' && (
              <>
                <VerticalIconTextButton
                  style={styles.button}
                  tint={colors.accentPrimary}
                  icon={'icCopy'}
                  title={t('copyLink')}
                  onPress={onCopyEvent}
                />
                {event.state !== 'join' && (
                  <VerticalIconTextButton
                    style={styles.button}
                    icon={'icAddToCal'}
                    tint={colors.accentPrimary}
                    title={t('addToCal')}
                    onPress={addToCalendar}
                  />
                )}
              </>
            )}
          </Horizontal>

          {store.isAllowStart && (
            <View style={styles.startRoomButtonContainer}>
              <PrimaryButton
                onPress={() => onStartRoom?.(event)}
                style={styles.startRoomButton}
                title={t('startTheRoomButton')}
              />
            </View>
          )}

          {store.isAllowJoin && (
            <View style={styles.startRoomButtonContainer}>
              <PrimaryButton
                onPress={() => onJoinRoom?.(event)}
                style={styles.startRoomButton}
                isEnabled={store.isJoinEnabled}
                title={t('joinTheRoomInProgress')}
              />
            </View>
          )}

          {event.isPrivate && event.needApprove && event.state !== 'join' && (
            <View style={styles.startRoomButtonContainer}>
              <PrimaryButton
                onPress={() => onApproveEvent?.(event)}
                style={styles.startRoomButton}
                title={t('approveEventText')}
              />
            </View>
          )}

          {event.isOwned && event.state !== 'join' && (
            <AppTouchableOpacity
              style={styles.deleteButton}
              onPress={() => onDeletePress?.(event)}>
              <AppText
                style={[styles.deleteButtonText, {color: colors.warning}]}>
                {event.isPrivate
                  ? t('cancelEventButton')
                  : t('deleteEventButton')}
              </AppText>
            </AppTouchableOpacity>
          )}
          <Spacer vertical={inset.bottom + ms(16)} />
        </>
      )}
    </ContentLoadingView>
  )
}

export default observer(BottomSheetUpcomingEventView)

const styles = StyleSheet.create({
  base: {
    ...Platform.select({web: {width: '100%'}}),
    minHeight: ms(320),
  },
  buttonsContainer: {
    height: ms(60),
    paddingHorizontal: ms(16),
    justifyContent: 'space-evenly',
  },

  button: {
    flex: 1,
  },

  deleteButton: {
    height: ms(48),
    alignContent: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    paddingHorizontal: ms(16),
    marginTop: ms(16),
  },

  deleteButtonText: {
    fontSize: ms(15),
    fontWeight: 'bold',
  },

  startRoomButton: {
    height: ms(48),
    minHeight: undefined,
  },

  startRoomButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    marginTop: ms(16),
  },
})

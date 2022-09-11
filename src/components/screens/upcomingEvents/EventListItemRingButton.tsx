import {runInAction} from 'mobx'
import {observer} from 'mobx-react'
import React, {useContext, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {ActivityIndicator, StyleSheet, View} from 'react-native'

import {analytics} from '../../../Analytics'
import {EventModel} from '../../../models'
import {storage} from '../../../storage'
import UpcomingEventsStore from '../../../stores/UpcomingEventsStore'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppIconButton from '../../common/AppIconButton'
import {alert} from '../../webSafeImports/webSafeImports'

interface Props {
  readonly event: EventModel
}

const EventListItemRingButton: React.FC<Props> = (props) => {
  const {colors} = useTheme()
  const {t} = useTranslation()
  const store = useContext(UpcomingEventsStore)

  const [loading, setLoading] = useState(false)

  const currentUserId = storage.currentUser?.id
  const isCoHost =
    currentUserId &&
    !!props.event.participants.find(
      (p) => p.id === currentUserId && !p.isSpecialGuest,
    )
  const isShowEdit = props.event.isOwned || isCoHost
  const isShowRing = !isShowEdit

  if (!isShowRing) return null

  const onRingPress = async () => {
    if (props.event.isSubscribed) {
      setLoading(true)
      await store.unSubscribeFromEvent(props.event)
      runInAction(() => {
        props.event.isSubscribed = false
      })
      setLoading(false)
      analytics.sendEvent('event_ring_unsubscribe_click', {
        eventId: props.event.id,
        eventName: props.event.title,
      })
      return
    }
    setLoading(true)
    const isSuccess = await store.subscribeOnEvent(props.event)
    runInAction(() => {
      props.event.isSubscribed = true
    })
    setLoading(false)
    analytics.sendEvent('event_ring_subscribe_click', {
      eventId: props.event.id,
      eventName: props.event.title,
    })
    if (!isSuccess) return
    if (storage.isEventSubscriptionExplanationShown) return
    storage.setEventSubscriptionExplanationShown()
    alert(
      t('upcomingEventsSubscribeDialogTitle'),
      t('upcomingEventsSubscribeDialogMessage'),
      [{style: 'default', text: t('upcomingEventsAllFollowDialogOkButton')}],
    )
  }

  return (
    <View style={styles.container}>
      {!loading && (
        <AppIconButton
          accessibilityLabel={
            props.event.isSubscribed ? 'icRingSubscribed' : 'icRing'
          }
          onPress={onRingPress}
          tint={colors.bodyText}
          icon={props.event.isSubscribed ? 'icRingSubscribed' : 'icRing'}
          shouldVibrateOnClick={true}
        />
      )}

      {loading && <ActivityIndicator color={colors.accentPrimary} />}
    </View>
  )
}

export default observer(EventListItemRingButton)

const styles = StyleSheet.create({
  container: {
    width: ms(24),
    height: ms(24),
  },
})

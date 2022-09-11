import moment from 'moment'
import React, {useMemo, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Platform, StyleSheet, Switch, View} from 'react-native'

import {analytics} from '../../../Analytics'
import {api} from '../../../api/api'
import {storage} from '../../../storage'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import BaseInlineBottomSheet, {
  AppBottomSheet,
} from '../../BaseInlineBottomSheet'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import CommonBottomSheetListView, {
  CommonBottomSheetListItemModel,
} from '../../common/CommonBottomSheetListView'

interface Props {}

const SettingsPushNotificationsMenuItem: React.FC<Props> = () => {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const modalRef = useRef<AppBottomSheet>(null)
  const [enabled, setEnabled] = useState(storage.isSkipNotification)

  const keys = t('pauseNotifications', {returnObjects: true}) as Array<string>

  const items = useMemo(() => keys.map((k, i) => ({id: i + 1, title: k})), [])

  const onSelect = (item: CommonBottomSheetListItemModel) => {
    let time = moment()
    switch (item.id) {
      case 1:
        time.add(1, 'hour')
        analytics.sendEvent('push_notifications_pause_hour')
        break
      case 2:
        time.add(24, 'hours')
        analytics.sendEvent('push_notifications_pause_day')
        break
      case 3:
        time.add(7, 'days')
        analytics.sendEvent('push_notifications_pause_week')
        break
    }
    const unix = time.unix()
    modalRef.current?.dismiss()
    setEnabled(true)
    storage.saveSkipUntilNotifications(unix)
    api.updateProfile({skipNotificationUntil: unix})
  }

  const onSwitchOff = () => {
    if (enabled) {
      api.updateProfile({skipNotificationUntil: 0})
      storage.saveSkipUntilNotifications(0)
      analytics.sendEvent('push_notifications_enable')
      return setEnabled(false)
    }
    analytics.sendEvent('push_notifications_pause_choose_time')
    modalRef.current?.present()
  }

  const thumbColor =
    Platform.OS === 'ios'
      ? undefined
      : enabled
      ? colors.accentPrimary
      : colors.systemBackground
  const trackColor = {
    false: Platform.OS === 'android' ? colors.supportBodyText : '#767577',
    true:
      Platform.OS === 'android'
        ? 'rgba(77, 125, 208, 0.5)'
        : colors.accentPrimary,
  }

  return (
    <>
      <AppTouchableOpacity
        style={[styles.base, {backgroundColor: colors.floatingBackground}]}
        onPress={onSwitchOff}>
        <AppText style={[styles.title, {color: colors.bodyText}]}>
          {t('settingsScreenPauseNotifications')}
        </AppText>
        <View pointerEvents={'none'}>
          <Switch
            thumbColor={thumbColor}
            trackColor={trackColor}
            value={enabled}
          />
        </View>
      </AppTouchableOpacity>

      <BaseInlineBottomSheet
        ref={modalRef}
        itemsCount={items.length}
        itemHeight={56}>
        <CommonBottomSheetListView items={items} onPress={onSelect} />
      </BaseInlineBottomSheet>
    </>
  )
}

export default SettingsPushNotificationsMenuItem

const styles = StyleSheet.create({
  base: {
    borderRadius: ms(8),
    paddingHorizontal: ms(16),
    height: ms(48),
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    fontSize: ms(17),
    flex: 1,
  },
})

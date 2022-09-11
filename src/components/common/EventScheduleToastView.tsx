import React, {memo} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {analytics} from '../../Analytics'
import {showEventDialog} from '../../appEventEmitter'
import {EventScheduleToastParams} from '../../models'
import {ms} from '../../utils/layout.utils'
import {toastHelper} from '../../utils/ToastHelper'
import AcceptButton from '../screens/room/railsedHandToast/AcceptButton'
import MaybeLaterButton from '../screens/room/railsedHandToast/MaybeLaterButton'
import CustomImageToastView from './CustomImageToastView'
import Horizontal from './Horizontal'

interface Props extends EventScheduleToastParams {
  readonly toastId: string
}

const EventScheduleToastView: React.FC<Props> = (p) => {
  const {t} = useTranslation()

  const onDismissPress = () => {
    toastHelper.hideByToastId(p.toastId)
  }

  const onReviewPress = () => {
    analytics.sendEvent('click_toast_event_preview')
    showEventDialog(p.eventId)
    onDismissPress()
  }

  const showButtons =
    p.eventType === 'arranged-private-meeting' ||
    p.eventType === 'changed-private-meeting'

  return (
    <View accessibilityLabel={'RaisedHandToast'} style={styles.base}>
      <CustomImageToastView {...p}>
        {showButtons && (
          <Horizontal style={styles.buttonsContainer}>
            <MaybeLaterButton
              onPress={onDismissPress}
              title={t('skipButton')}
            />
            <AcceptButton
              onPress={onReviewPress}
              title={t('eventReviewButton')}
            />
          </Horizontal>
        )}
      </CustomImageToastView>
    </View>
  )
}

export default memo(EventScheduleToastView)

const styles = StyleSheet.create({
  base: {
    flexDirection: 'column',
  },

  buttonsContainer: {
    marginTop: ms(16),
  },
})

import React, {memo} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {analytics} from '../../Analytics'
import {showUserProfile} from '../../appEventEmitter'
import {ms} from '../../utils/layout.utils'
import {toastHelper} from '../../utils/ToastHelper'
import {logJS} from '../screens/room/modules/Logger'
import AcceptButton from '../screens/room/railsedHandToast/AcceptButton'
import MaybeLaterButton from '../screens/room/railsedHandToast/MaybeLaterButton'
import CustomImageToastView from './CustomImageToastView'
import Horizontal from './Horizontal'

type Props = {
  title: string
  body: string
  toastId: string
  userId: string
}

const UserRegisteredByInviteToastView: React.FC<Props> = (p) => {
  const {t} = useTranslation()

  const onSkipPress = async () => {
    if (!p.userId) return
    logJS('debug', 'UserRegisteredByInviteToastView', 'skip pressed')
    analytics.sendEvent('click_skip_user_invited_with_code', {userId: p.userId})
    toastHelper.hideByToastId(p.toastId)
  }

  const onReviewPress = () => {
    if (!p.userId) {
      return logJS(
        'warning',
        'UserRegisteredByInviteCodeToastView',
        'cant review profile without user id',
      )
    }
    logJS('debug', 'UserRegisteredByInviteToastView', 'accept pressed')
    analytics.sendEvent('click_approve_user_invited_with_code', {
      userId: p.userId,
    })
    toastHelper.hideByToastId(p.toastId)
    showUserProfile(undefined, p.userId, {
      invitationOptions: {waitingInvitation: true},
    })
  }

  return (
    <View style={styles.base}>
      <CustomImageToastView {...p}>
        <Horizontal style={styles.buttonsContainer}>
          <MaybeLaterButton onPress={onSkipPress} title={t('skipButton')} />
          <AcceptButton onPress={onReviewPress} title={t('reviewProfile')} />
        </Horizontal>
      </CustomImageToastView>
    </View>
  )
}

export default memo(UserRegisteredByInviteToastView)

const styles = StyleSheet.create({
  base: {
    flexDirection: 'column',
  },
  buttonsContainer: {
    marginTop: ms(16),
  },
})

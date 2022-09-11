import React, {memo} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import {analytics} from '../../Analytics'
import {goToClub} from '../../appEventEmitter'
import {ClubParams} from '../../models'
import {ms} from '../../utils/layout.utils'
import {toastHelper} from '../../utils/ToastHelper'
import AcceptButton from '../screens/room/railsedHandToast/AcceptButton'
import MaybeLaterButton from '../screens/room/railsedHandToast/MaybeLaterButton'
import AppTouchableOpacity from './AppTouchableOpacity'
import CustomImageToastView from './CustomImageToastView'
import Horizontal from './Horizontal'

type Props = {
  title: string
  body: string
  toastId: string
  clubId: string
}

const InvitedToClubToastView: React.FC<Props> = (p) => {
  const {t} = useTranslation()

  const onSkipPress = () => {
    analytics.sendEvent('invite_to_club_toast_skip_click', {clubId: p.clubId})
    toastHelper.hideByToastId(p.toastId)
  }

  const onViewPress = () => {
    analytics.sendEvent('invite_to_club_toast_view_click', {clubId: p.clubId})
    if (!p.clubId) return
    const clubParams: ClubParams = {clubId: p.clubId}
    goToClub(clubParams)
    onSkipPress()
  }

  return (
    <AppTouchableOpacity style={styles.base} onPress={onViewPress}>
      <CustomImageToastView {...p}>
        <Horizontal style={styles.buttonsContainer}>
          <MaybeLaterButton onPress={onSkipPress} title={t('ignoreButton')} />
          <AcceptButton onPress={onViewPress} title={t('viewClubAction')} />
        </Horizontal>
      </CustomImageToastView>
    </AppTouchableOpacity>
  )
}

export default memo(InvitedToClubToastView)

const styles = StyleSheet.create({
  base: {
    flexDirection: 'column',
  },
  buttonsContainer: {
    marginTop: ms(16),
  },
})

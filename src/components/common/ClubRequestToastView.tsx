import React, {memo} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {goToClubModerate} from '../../appEventEmitter'
import {ClubParams} from '../../models'
import {ms} from '../../utils/layout.utils'
import {toastHelper} from '../../utils/ToastHelper'
import AcceptButton from '../screens/room/railsedHandToast/AcceptButton'
import MaybeLaterButton from '../screens/room/railsedHandToast/MaybeLaterButton'
import CustomImageToastView from './CustomImageToastView'
import Horizontal from './Horizontal'

type Props = {
  title: string
  body: string
  toastId: string
  clubId: string
}

const ClubRequestToastView: React.FC<Props> = (p) => {
  const {t} = useTranslation()

  const onDismissPress = () => {
    toastHelper.hideByToastId(p.toastId)
  }

  const onAcceptPress = () => {
    if (!p.clubId) return
    const clubParams: ClubParams = {clubId: p.clubId}
    goToClubModerate(clubParams)
    onDismissPress()
  }

  return (
    <View style={styles.base}>
      <CustomImageToastView {...p}>
        <Horizontal style={styles.buttonsContainer}>
          <MaybeLaterButton
            onPress={onDismissPress}
            title={t('ignoreButton')}
          />
          <AcceptButton
            onPress={onAcceptPress}
            title={t('moderateClubButton')}
          />
        </Horizontal>
      </CustomImageToastView>
    </View>
  )
}

export default memo(ClubRequestToastView)

const styles = StyleSheet.create({
  base: {
    flexDirection: 'column',
  },
  buttonsContainer: {
    marginTop: ms(16),
  },
})

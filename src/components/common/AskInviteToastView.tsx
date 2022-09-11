import React, {memo, useContext} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {AskInviteParams} from '../../models'
import InvitesStore from '../../stores/InvitesStore'
import {makeTextStyle} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import {toastHelper} from '../../utils/ToastHelper'
import AcceptButton from '../screens/room/railsedHandToast/AcceptButton'
import MaybeLaterButton from '../screens/room/railsedHandToast/MaybeLaterButton'
import CustomImageToastView from './CustomImageToastView'
import Horizontal from './Horizontal'

interface Props extends AskInviteParams {
  toastId: string
}

const AskInviteToastView: React.FC<Props> = (p) => {
  const {t} = useTranslation()
  const invitesStore = useContext(InvitesStore)

  const onDismissPress = () => {
    toastHelper.hideByToastId(p.toastId)
  }

  const onAcceptPress = () => {
    invitesStore.invite(p.phone, true)
    onDismissPress()
  }

  return (
    <View accessibilityLabel={'RaisedHandToast'} style={styles.base}>
      <CustomImageToastView {...p}>
        <Horizontal style={styles.buttonsContainer}>
          <MaybeLaterButton
            onPress={onDismissPress}
            title={t('ignoreButton')}
          />
          <AcceptButton onPress={onAcceptPress} title={t('letInButton')} />
        </Horizontal>
      </CustomImageToastView>
    </View>
  )
}

export default memo(AskInviteToastView)

const styles = StyleSheet.create({
  base: {
    flexDirection: 'column',
  },

  text: {
    fontSize: ms(15),
  },

  title: {
    ...makeTextStyle(ms(15), ms(15), 'bold'),
  },

  buttonsContainer: {
    marginTop: ms(16),
  },
})

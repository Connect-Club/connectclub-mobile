import React, {memo} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {toastHelper} from '../../../utils/ToastHelper'
import AppText from '../../common/AppText'
import Horizontal from '../../common/Horizontal'
import {RaiseHandRequestType} from './jitsi/WsDelegate'
import AcceptButton from './railsedHandToast/AcceptButton'
import InviteButton from './railsedHandToast/InviteButton'
import MaybeLaterButton from './railsedHandToast/MaybeLaterButton'

interface Props {
  readonly name: string
  readonly id: string
  readonly type: RaiseHandRequestType
  readonly callToStage: () => void
  readonly moveToStage: () => void
  readonly declineStageCall: (id: string) => void
}

const HandRequestToastView: React.FC<Props> = ({
  id,
  name,
  type,
  callToStage,
  moveToStage,
  declineStageCall,
}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  const text = t(
    type === 'request' ? 'toastRaisedHandRequest' : 'toastRaisedHandInvite',
    {name},
  )

  const onDismissPress = () => {
    toastHelper.hideHandRequestToast(id)
  }

  const onInvitePress = () => {
    if (!id) return onDismissPress()
    callToStage()
    onDismissPress()
  }

  const onAcceptPress = () => {
    if (!id) return onDismissPress()
    moveToStage()
    onDismissPress()
  }

  const onDeclinePress = () => {
    if (!id) return onDismissPress()
    declineStageCall(id)
    onDismissPress()
  }

  return (
    <View accessibilityLabel={'RaisedHandToast'} style={styles.base}>
      <AppText style={[styles.text, {color: colors.textPrimary}]}>
        {text}
      </AppText>

      <Horizontal style={styles.buttonsContainer}>
        {type === 'request' && <MaybeLaterButton onPress={onDismissPress} />}
        {type === 'request' && <InviteButton onPress={onInvitePress} />}
        {type === 'invite' && (
          <MaybeLaterButton
            title={t('toastRaisedHandRequestDeclineButton')}
            onPress={onDeclinePress}
          />
        )}
        {type === 'invite' && <AcceptButton onPress={onAcceptPress} />}
      </Horizontal>
    </View>
  )
}

export default memo(HandRequestToastView)

const styles = StyleSheet.create({
  base: {
    padding: ms(16),
    flexDirection: 'column',
  },

  text: {
    fontSize: ms(15),
  },

  buttonsContainer: {
    marginTop: ms(24),
  },
})

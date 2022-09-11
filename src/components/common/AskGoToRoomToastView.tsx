import React, {memo} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {goToRoom} from '../../appEventEmitter'
import {AskGoToRoomParams} from '../../models'
import {ms} from '../../utils/layout.utils'
import {toastHelper} from '../../utils/ToastHelper'
import AcceptButton from '../screens/room/railsedHandToast/AcceptButton'
import MaybeLaterButton from '../screens/room/railsedHandToast/MaybeLaterButton'
import CustomImageToastView from './CustomImageToastView'
import Horizontal from './Horizontal'

interface Props extends AskGoToRoomParams {
  readonly toastId: string
}

const privateText = 'private room'
const privateBody = 'privately'

const AskGoToRoomToastView: React.FC<Props> = (p) => {
  const {t} = useTranslation()

  const onDismissPress = () => {
    toastHelper.hideByToastId(p.toastId)
  }

  const onAcceptPress = () => {
    if (!p.roomParams) return onDismissPress()
    goToRoom(p.roomParams)
    onDismissPress()
  }

  const buttonKey =
    p.title?.includes(privateText) ||
    p.body?.includes(privateText) ||
    p.body?.includes(privateBody)
      ? 'notificationButtonGoToPrivateRoom'
      : 'notificationButtonGoToRoom'

  return (
    <View accessibilityLabel={'RaisedHandToast'} style={styles.base}>
      <CustomImageToastView {...p}>
        <Horizontal style={styles.buttonsContainer}>
          <MaybeLaterButton onPress={onDismissPress} title={t('skipButton')} />
          <AcceptButton
            onPress={onAcceptPress}
            title={t(p.primaryButtonTitleKey ?? buttonKey)}
          />
        </Horizontal>
      </CustomImageToastView>
    </View>
  )
}

export default memo(AskGoToRoomToastView)

const styles = StyleSheet.create({
  base: {
    flexDirection: 'column',
  },

  buttonsContainer: {
    marginTop: ms(16),
  },
})

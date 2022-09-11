import React, {memo, PropsWithChildren} from 'react'
import {useTranslation} from 'react-i18next'
import {Linking, StyleSheet, View} from 'react-native'

import {ms} from '../../utils/layout.utils'
import {RELEASE_NOTES_URL} from '../../utils/stringHelpers'
import {toastHelper} from '../../utils/ToastHelper'
import AcceptButton from '../screens/room/railsedHandToast/AcceptButton'
import MaybeLaterButton from '../screens/room/railsedHandToast/MaybeLaterButton'
import CustomImageToastView, {
  CustomImageToastProps,
} from './CustomImageToastView'
import Horizontal from './Horizontal'

const ReleaseNotesToastView: React.FC<
  PropsWithChildren<CustomImageToastProps>
> = (props) => {
  const {t} = useTranslation()

  const onDismissPress = () => {
    toastHelper.hideByToastId(props.toastId)
  }

  const onAcceptPress = async () => {
    if (await Linking.canOpenURL(RELEASE_NOTES_URL)) {
      Linking.openURL(RELEASE_NOTES_URL)
    }
    onDismissPress()
  }

  return (
    <View accessibilityLabel={'ReleaseNotesToast'} style={styles.base}>
      <CustomImageToastView {...props} body={t('releaseNotesMessage')}>
        <Horizontal style={styles.buttonsContainer}>
          <MaybeLaterButton onPress={onDismissPress} title={t('skipButton')} />
          <AcceptButton
            onPress={onAcceptPress}
            title={t('releaseNotesAcceptButton')}
          />
        </Horizontal>
      </CustomImageToastView>
    </View>
  )
}

export default memo(ReleaseNotesToastView)

const styles = StyleSheet.create({
  base: {
    flexDirection: 'column',
  },

  buttonsContainer: {
    marginTop: ms(16),
  },
})

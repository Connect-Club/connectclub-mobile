import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import {analytics} from '../../Analytics'
import {UserModel} from '../../models'
import {makeTextStyle} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import {profileShortenSurname} from '../../utils/userHelper'
import AppText from './AppText'
import FloatingPopupView from './FloatingPopupView'
import PrimaryButton from './PrimaryButton'

interface PrivateMeetingProps {
  readonly meetingUser: UserModel
  readonly onArrangeMeetingPress: (user: UserModel) => void
}

const PrivateMeetingPopup: React.FC<PrivateMeetingProps> = (props) => {
  const {t} = useTranslation()
  const [isVisible, setModalVisible] = useState(true)

  const onArrangePress = () => {
    analytics.sendEvent('click_arrange_private_meeting_popup')
    props.onArrangeMeetingPress(props.meetingUser)
  }

  const onClose = () => {
    analytics.sendEvent('close_private_meeting_popup')
    setModalVisible(false)
  }

  return (
    <FloatingPopupView handleOnClose={onClose} isVisible={isVisible}>
      <AppText style={styles.header}>{t('arrangeMeetingHeader')}</AppText>
      <AppText style={styles.message}>
        {t('arrangeMeetingMessage', {
          name: profileShortenSurname(props.meetingUser),
        })}
      </AppText>
      <PrimaryButton
        title={t('arrangeMeetingButton')}
        onPress={onArrangePress}
      />
    </FloatingPopupView>
  )
}

export default PrivateMeetingPopup

const styles = StyleSheet.create({
  header: {
    textAlign: 'center',
    ...makeTextStyle(ms(32), ms(38), 'bold'),
  },

  message: {
    paddingTop: ms(16),
    paddingBottom: ms(24),
    textAlign: 'center',
    ...makeTextStyle(ms(15), ms(22), 'normal'),
  },
})

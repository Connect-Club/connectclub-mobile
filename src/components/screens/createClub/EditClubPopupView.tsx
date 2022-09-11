import React, {useState} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import AppText from '../../../components/common/AppText'
import AppTouchableOpacity from '../../../components/common/AppTouchableOpacity'
import Spacer from '../../../components/common/Spacer'
import {makeTextStyle, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import FloatingPopupView from '../../common/FloatingPopupView'

type Props = {
  onAddEvent: () => void
  onClose?: () => void
}

const EditClubPopupView: React.FC<Props> = ({onAddEvent}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  const [isVisible, setModalVisible] = useState(true)

  const onEvent = () => {
    onAddEvent()
    setModalVisible(false)
  }

  return (
    <FloatingPopupView
      handleOnClose={() => setModalVisible(false)}
      isVisible={isVisible}>
      <AppIcon type='icCalendarBig' tint={colors.accentPrimary} />
      <AppText style={styles.title}>{t('arrangeYourFirstEvent')}</AppText>
      <Spacer vertical={ms(8)} />
      <AppText style={styles.text}>{t('chooseSpecificTopic')}</AppText>
      <Spacer vertical={ms(24)} />
      <AppTouchableOpacity
        onPress={onEvent}
        style={[{backgroundColor: colors.primaryClickable}, styles.button]}>
        <AppText style={[styles.textButton, {color: colors.textPrimary}]}>
          {t('createEvent')}
        </AppText>
      </AppTouchableOpacity>
    </FloatingPopupView>
  )
}

const styles = StyleSheet.create({
  title: {
    ...makeTextStyle(ms(24), ms(36), 'bold'),
    opacity: 0.87,
  },

  text: {
    textAlign: 'center',
    ...makeTextStyle(ms(18), ms(23.4)),
    opacity: 0.87,
  },

  button: {
    paddingHorizontal: ms(24),
    paddingVertical: ms(10),
    borderRadius: ms(24),
  },

  textButton: {
    ...makeTextStyle(ms(15), ms(18), '600'),
  },
})

export default EditClubPopupView

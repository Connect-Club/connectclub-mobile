import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'
import {TouchableOpacity} from 'react-native-gesture-handler'

import {useTheme} from '../../../../theme/appTheme'
import {ms} from '../../../../utils/layout.utils'
import AppText from '../../../common/AppText'

interface Props {
  readonly onPress: () => void
  readonly title?: string
}

const MaybeLaterButton: React.FC<Props> = ({onPress, title}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  return (
    <TouchableOpacity
      accessibilityLabel={'InviteSpeakerButton'}
      style={[styles.acceptButton, {backgroundColor: colors.captionBodyText}]}
      activeOpacity={0.8}
      onPress={onPress}>
      <AppText style={[styles.acceptButtonText, {color: colors.textPrimary}]}>
        {title ?? t('toastRaisedHandRequestLaterButton')}
      </AppText>
    </TouchableOpacity>
  )
}

export default MaybeLaterButton

const styles = StyleSheet.create({
  acceptButton: {
    height: ms(28),
    marginEnd: ms(16),
    paddingHorizontal: ms(24),
    borderRadius: ms(28 / 2),
    alignItems: 'center',
    justifyContent: 'center',
  },

  acceptButtonText: {
    fontSize: ms(12),
    fontWeight: 'bold',
  },
})

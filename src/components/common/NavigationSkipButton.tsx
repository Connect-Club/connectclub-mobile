import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import {useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import AppText from './AppText'
import AppTouchableOpacity from './AppTouchableOpacity'

interface Props {
  readonly onPress: () => void
}

const NavigationSkipButton: React.FC<Props> = ({onPress}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()

  return (
    <AppTouchableOpacity
      accessibilityLabel={'skipButton'}
      activeOpacity={0.9}
      onPress={onPress}>
      <AppText style={[styles.text, {color: colors.accentPrimary}]}>
        {t('skipButton')}
      </AppText>
    </AppTouchableOpacity>
  )
}

export default NavigationSkipButton

const styles = StyleSheet.create({
  text: {
    fontSize: ms(18),
    fontWeight: '500',
    paddingEnd: ms(16),
  },
})

import React, {memo} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'

const ReconnectingToastView: React.FC = () => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  return (
    <View accessibilityLabel={'ReconnectingToastView'} style={styles.base}>
      <AppIcon type={'icBadConnection'} />
      <AppText style={[styles.text, {color: colors.textPrimary}]}>
        {t('reconnecting')}
      </AppText>
    </View>
  )
}

export default memo(ReconnectingToastView)

const styles = StyleSheet.create({
  base: {
    padding: ms(16),
    flexDirection: 'row',
    alignItems: 'center',
  },

  text: {
    fontSize: ms(13),
    lineHeight: ms(18),
    marginStart: ms(8),
  },
})

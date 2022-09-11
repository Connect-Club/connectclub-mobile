import React from 'react'
import {useTranslation} from 'react-i18next'
import {Linking, StyleSheet, View} from 'react-native'

import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import PrimaryButton from '../../common/PrimaryButton'

const DisabledNotificationsView: React.FC = () => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  return (
    <View style={[{backgroundColor: colors.floatingBackground}, styles.base]}>
      <AppText style={[styles.titleText, {color: colors.bodyText}]}>
        {t('notificationsDisabledTitle')}
      </AppText>
      <AppText style={[styles.descriptionText, {color: colors.bodyText}]}>
        {t('notificationsDisabledDescription')}
      </AppText>

      <PrimaryButton
        onPress={() => Linking.openSettings()}
        style={styles.button}
        textStyle={styles.buttonText}
        title={t('openAppSettings')}
      />
    </View>
  )
}

export default DisabledNotificationsView

const styles = StyleSheet.create({
  base: {
    borderRadius: ms(8),
    padding: ms(16),
    flexDirection: 'column',
    alignItems: 'center',
  },

  titleText: {
    fontSize: ms(18),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: ms(8),
  },

  descriptionText: {
    fontSize: ms(15),
    lineHeight: ms(22),
    textAlign: 'center',
  },

  button: {
    height: ms(28),
    marginTop: ms(16),
  },

  buttonText: {
    fontSize: ms(12),
  },
})

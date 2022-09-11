import {useNavigation} from '@react-navigation/native'
import React, {useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import {analytics} from '../Analytics'
import AppAvatar from '../components/common/AppAvatar'
import AppText from '../components/common/AppText'
import PrimaryButton from '../components/common/PrimaryButton'
import SecondaryButton from '../components/common/SecondaryButton'
import Vertical from '../components/common/Vertical'
import BaseWelcomeLayout from '../components/screens/BaseWelcomeLayout'
import {commonStyles, useTheme} from '../theme/appTheme'
import {ms} from '../utils/layout.utils'
import {fullName, getUserShortName} from '../utils/userHelper'

// FIXME: consider unused
const SuccessEnterCodeScreen: React.FC = () => {
  const navigation = useNavigation()
  const {colors} = useTheme()
  const {t} = useTranslation()

  useEffect(() => {
    analytics.sendEvent('welcome_setup_screen_open')
  }, [])

  const onNextButtonPress = () => {
    analytics.sendEvent('welcome_setup_click')
    navigation.navigate('EnterPhoneScreen')
  }

  return (
    <BaseWelcomeLayout style={commonStyles.paddingHorizontal}>
      <>
        <AppText style={[styles.title, {color: colors.bodyText}]}>
          {t('successEnterCodeTitle')}
        </AppText>

        <AppAvatar
          avatar={''}
          shortName={getUserShortName(undefined)}
          style={styles.avatar}
          size={ms(80)}
        />
        <AppText style={[styles.usernameText, {color: colors.bodyText}]}>
          {fullName(undefined)}
        </AppText>
      </>

      <Vertical>
        <AppText style={[styles.bottomTitle, {color: colors.bodyText}]}>
          {t('successEnterCodeBottomTitle')}
        </AppText>

        <PrimaryButton onPress={onNextButtonPress} title={t('nextButton')} />
        <SecondaryButton
          title={t('successEnterCodeEnterInfoManually')}
          onPress={() => navigation.navigate('FullNameScreen')}
        />
      </Vertical>
    </BaseWelcomeLayout>
  )
}

export default SuccessEnterCodeScreen

const styles = StyleSheet.create({
  avatar: {
    width: ms(80),
    height: ms(80),
  },

  title: {
    width: '100%',
    fontSize: ms(34),
    fontWeight: 'bold',
    marginBottom: ms(32),
  },

  usernameText: {
    marginTop: ms(12),
  },

  bottomTitle: {
    fontSize: ms(24),
    fontWeight: 'bold',
    marginBottom: ms(32),
  },
})

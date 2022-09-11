import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useCallback, useContext, useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Platform, StyleSheet, TextInput, View} from 'react-native'

import {analytics} from '../Analytics'
import {api} from '../api/api'
import {hideLoading, showLoading} from '../appEventEmitter'
import AppInputPhoneFormat from '../components/common/AppInputPhoneFormat'
import AppText from '../components/common/AppText'
import ContentLoadingView from '../components/common/ContentLoadingView'
import Horizontal from '../components/common/Horizontal'
import PrimaryButton from '../components/common/PrimaryButton'
import SecondaryButton from '../components/common/SecondaryButton'
import Vertical from '../components/common/Vertical'
import BaseWelcomeLayout from '../components/screens/BaseWelcomeLayout'
import MarkdownHyperlink from '../components/screens/profileScreen/MarkdownHyperlink'
import {intercomController} from '../components/screens/room/modules/IntercomModule'
import {logJS} from '../components/screens/room/modules/Logger'
import {InitialLinkProp, privacyPolicyLink, termsLink} from '../models'
import PhoneNumberFormatsStore from '../stores/PhoneNumberFormatsStore'
import {commonStyles, useTheme} from '../theme/appTheme'
import {ms} from '../utils/layout.utils'
import {runWithLoaderAsync} from '../utils/navigation.utils'
import {toastHelper} from '../utils/ToastHelper'
import {useSignUpWithWallet} from '../utils/useSignUpWithWallet'

type ScreenProps = RouteProp<
  {Screen: {selected: string} & InitialLinkProp},
  'Screen'
>

const EnterPhoneScreen: React.FC = () => {
  const {params} = useRoute<ScreenProps>()
  const navigation = useNavigation()
  const {colors} = useTheme()
  const {t} = useTranslation()
  const signUpWithWallet = useSignUpWithWallet(params.initialLink)

  const store = useContext(PhoneNumberFormatsStore)

  const [phone, setPhone] = useState('')
  const [isButtonActive, setButtonActive] = useState(false)
  const onPhoneInputPress = () => analytics.sendEvent('phone_input_click')
  const onRetry = useCallback(() => {
    store.fetch()
  }, [store])

  const phoneRulesText = t('enterPhoneTerms', {
    terms: termsLink,
    privacy: privacyPolicyLink,
  })
  const phoneInputStyle = phone.length > 0 ? {} : styles.phoneInputEmpty
  const phoneInputPlaceholder =
    phone.length > 0 ? '' : t('enterPhoneInputPlaceholder')

  useEffect(() => {
    intercomController.requestRevealIntercomLauncher()
    analytics.sendEvent('phone_screen_open')
    store.fetch()
    const disposeFocusListener = navigation.addListener('focus', () => {
      intercomController.requestRevealIntercomLauncher()
    })
    return () => {
      intercomController.requestDismissIntercomLauncher()
      disposeFocusListener()
    }
  }, [navigation, store])

  useEffect(() => {
    if (!params?.selected) return
    const selected = params.selected
    navigation.setParams({selected: undefined})
    store.selectCode(selected)
  }, [navigation, params.selected, store])

  const onCryptoWalletLoginPress = async () => {
    logJS('debug', 'EnterPhoneScreen', 'log in with wallet')
    analytics.sendEvent('phone_crypto_wallet_click')
    await runWithLoaderAsync(signUpWithWallet)
  }

  const onSendCode = async () => {
    if (!isButtonActive) return
    const number = store.selectedPrefix
    const phoneNumber = `+${number}${phone}`
    analytics.sendEvent('phone_next_click')

    showLoading()
    const response = await api.getSMSCode(phoneNumber)
    hideLoading()
    if (response.error) return toastHelper.error(t(`${response.error}`))

    navigation.navigate('EnterPhoneCodeScreen', {
      phoneNumber,
      initialLink: params?.initialLink,
    })
  }

  const onTextChange = (text: string) => {
    setPhone(text)
    setButtonActive(store.availableLength.includes(text.length))
  }
  return (
    <ContentLoadingView
      onRetry={onRetry}
      loading={store.isLoading}
      showLoader={false}
      error={store.error}>
      <BaseWelcomeLayout
        style={[commonStyles.paddingHorizontal, styles.phoneForm]}
        contentStyle={styles.scrollContent}>
        <View style={commonStyles.wizardContentWrapper}>
          <AppText style={[styles.title, {color: colors.secondaryBodyText}]}>
            {t('enterPhoneTitle')}
          </AppText>

          <Vertical>
            <Horizontal
              style={[
                styles.content,
                {backgroundColor: colors.floatingBackground},
              ]}>
              <AppInputPhoneFormat
                selectedCode={store.selectedCode ?? ''}
                selectedPrefix={store.selectedPrefix}
                onChoosePress={() => {
                  navigation.navigate('ChoosePhoneRegion', {
                    formats: store.formats,
                    selected: store.selectedCode,
                  })
                }}
              />
              <TextInput
                onTouchStart={onPhoneInputPress}
                allowFontScaling={false}
                style={[
                  styles.phoneInput,
                  phoneInputStyle,
                  {color: colors.bodyText},
                ]}
                accessibilityLabel={'phoneInput'}
                caretHidden={false}
                maxLength={store.maxLength}
                onSubmitEditing={onSendCode}
                autoCorrect={false}
                autoCapitalize={'none'}
                returnKeyType={'done'}
                placeholder={phoneInputPlaceholder}
                keyboardType={'number-pad'}
                value={phone}
                onChangeText={onTextChange}
              />
            </Horizontal>

            <MarkdownHyperlink linkStyle={styles.link}>
              <AppText
                style={[styles.termsText, {color: colors.secondaryBodyText}]}>
                {phoneRulesText}
              </AppText>
            </MarkdownHyperlink>
          </Vertical>
        </View>
        <Vertical>
          <PrimaryButton
            accessibilityLabel={'nextButton'}
            isEnabled={isButtonActive}
            onPress={onSendCode}
            style={commonStyles.wizardPrimaryButton}
            title={t('nextButton')}
          />
          <SecondaryButton
            style={styles.cryptoWalletButton}
            title={t('iHaveCryptoWallet')}
            onPress={onCryptoWalletLoginPress}
          />
        </Vertical>
      </BaseWelcomeLayout>
    </ContentLoadingView>
  )
}

export default observer(EnterPhoneScreen)

const styles = StyleSheet.create({
  phoneForm: {
    ...Platform.select({
      web: {
        marginTop: '30vh',
      },
    }),
  },
  scrollContent: {
    paddingTop: ms(42),
  },
  content: {
    height: ms(56),
    overflow: 'hidden',
    borderRadius: ms(6),
  },
  title: {
    width: '100%',
    textAlign: 'center',
    fontSize: ms(34),
    fontWeight: 'bold',
    marginBottom: ms(32),
  },
  termsText: {
    fontSize: ms(13),
    lineHeight: ms(21),
    marginTop: ms(32),
  },
  phoneInput: {
    flex: 1,
    fontSize: ms(24),
    height: ms(56),
    maxHeight: ms(56),
    textAlign: 'justify',
    borderRadius: 0,
    paddingHorizontal: ms(12),
    paddingVertical: 0,
  },
  phoneInputEmpty: {
    fontSize: ms(22),
  },
  link: {
    ...commonStyles.registrationLink,
    fontWeight: 'bold',
  },
  cryptoWalletButton: {
    minHeight: ms(48),
    marginTop: ms(16),
    minWidth: ms(215),
    width: 0,
    alignSelf: 'center',
  },
})

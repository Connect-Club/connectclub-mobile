import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import React, {useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Platform, StyleSheet, TextInput, View} from 'react-native'

import {analytics} from '../Analytics'
import {api} from '../api/api'
import {hideLoading, showLoading} from '../appEventEmitter'
import AppText from '../components/common/AppText'
import AppTextInput from '../components/common/AppTextInput'
import Horizontal from '../components/common/Horizontal'
import BaseWelcomeLayout from '../components/screens/BaseWelcomeLayout'
import ResendCodeButton from '../components/screens/phoneCode/ResendCodeButton'
import {intercomController} from '../components/screens/room/modules/IntercomModule'
import {Clipboard} from '../components/webSafeImports/webSafeImports'
import {InitialLinkProp} from '../models'
import {commonStyles, useTheme} from '../theme/appTheme'
import {ms} from '../utils/layout.utils'
import {getClubIdFromUri, getInviteCodeFromUri} from '../utils/stringHelpers'
import {toastHelper} from '../utils/ToastHelper'
import {useDeepLinkNavigation} from '../utils/useDeepLinkNaivgation'
import useOnboardingNavigation from '../utils/useOnboardingNavigation'

type ScreenRouteProp = RouteProp<
  {Screen: {phoneNumber: string} & InitialLinkProp},
  'Screen'
>

const EnterPhoneScreen: React.FC = () => {
  const {params} = useRoute<ScreenRouteProp>()
  const navigation = useNavigation()
  const {colors} = useTheme()
  const {t} = useTranslation()
  const codeInputRef = useRef<TextInput>(null)
  const deepLinkNavigation = useDeepLinkNavigation()
  const {finishSingIn} = useOnboardingNavigation()

  const [code, setCode] = useState('')
  const onCodeInputPress = () => analytics.sendEvent('confirm_code_input_click')

  useEffect(() => {
    if (code.length === 4) onSendCode()
  }, [code])

  useEffect(() => {
    codeInputRef.current?.focus()
    analytics.sendEvent('confirm_code_screen_open')
    return navigation.addListener('blur', () => {
      console.log('code screen blur')
      intercomController.requestDismissIntercomLauncher()
    })
  }, [navigation])

  const onSendCode = async () => {
    showLoading()
    const currentLink = deepLinkNavigation.getCurrentUrl()
    const clubId = getClubIdFromUri(currentLink ?? params?.initialLink)
    const inviteCode = getInviteCodeFromUri(currentLink ?? params?.initialLink)
    const response = await api.fetchTokenBySMSCode(
      code,
      params.phoneNumber,
      clubId,
      inviteCode,
      analytics.utmLabels,
    )
    hideLoading()
    if (response.error) {
      analytics.sendEvent('confirm_code_fail', {error: response.error})
      setCode('')
      if (response.code === 400) {
        return toastHelper.error('errorPhoneCode')
      }
      return toastHelper.error(response.error)
    }
    await finishSingIn(response.data, currentLink)
  }
  const onPhoneCodeTextChange = async (content: string) => {
    setCode(content)
    if (!content) return
    const copiedContent = await Clipboard.getString()
    if (!copiedContent) return
    if (copiedContent === content)
      analytics.sendEvent('confirm_code_paste_click')
  }

  return (
    <BaseWelcomeLayout style={commonStyles.paddingHorizontal}>
      <View style={commonStyles.wizardContentWrapper}>
        <AppText style={[styles.title, {color: colors.secondaryBodyText}]}>
          {t('enterCodeTitle')}
        </AppText>

        <AppTextInput
          onTouchStart={onCodeInputPress}
          textContentType={'oneTimeCode'}
          ref={codeInputRef}
          style={styles.phoneInput}
          accessibilityLabel={'phoneCodeInput'}
          autoFocus={true}
          autoCorrect={false}
          autoCapitalize={'none'}
          maxLength={4}
          placeholder={t('enterPhoneCodeInputPlaceholder')}
          keyboardType={'number-pad'}
          returnKeyType={'done'}
          onSubmitEditing={onSendCode}
          value={code}
          onChangeText={onPhoneCodeTextChange}
        />
        <Horizontal style={styles.resendContainer}>
          <AppText
            style={[
              styles.didNotReceiveText,
              {color: colors.secondaryBodyText},
            ]}>
            {t('enterCodeDidntReceiveCode')}
          </AppText>
          <ResendCodeButton phoneNumber={params.phoneNumber} />
        </Horizontal>
      </View>
      <></>
    </BaseWelcomeLayout>
  )
}

export default EnterPhoneScreen
const styles = StyleSheet.create({
  title: {
    width: '100%',
    fontSize: ms(34),
    ...Platform.select({
      web: {
        marginTop: '30vh',
      },
    }),
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: ms(32),
  },
  getUsernameButton: {
    marginTop: ms(32),
  },
  resendContainer: {
    marginTop: ms(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneInput: {
    fontSize: ms(24),
    height: ms(56),
    textAlign: 'center',
    paddingHorizontal: ms(12),
  },
  didNotReceiveText: {
    fontSize: ms(13),
  },
})

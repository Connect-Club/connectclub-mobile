import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import React, {useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, TextInput, View} from 'react-native'

import {analytics} from '../Analytics'
import {api} from '../api/api'
import {hideLoading, sendUnAuthorized, showLoading} from '../appEventEmitter'
import AppText from '../components/common/AppText'
import AppTextInput from '../components/common/AppTextInput'
import PrimaryButton from '../components/common/PrimaryButton'
import Spacer from '../components/common/Spacer'
import Vertical from '../components/common/Vertical'
import BaseWelcomeLayout from '../components/screens/BaseWelcomeLayout'
import {logJS} from '../components/screens/room/modules/Logger'
import {InitialLinkProp} from '../models'
import {storage} from '../storage'
import {commonStyles, makeTextStyle, useTheme} from '../theme/appTheme'
import {ms} from '../utils/layout.utils'
import {toastHelper} from '../utils/ToastHelper'

type ScreenRouteProp = RouteProp<{Screen: InitialLinkProp}, 'Screen'>

const FullNameScreen: React.FC = () => {
  const navigation = useNavigation()
  const {params} = useRoute<ScreenRouteProp>()
  const {colors} = useTheme()
  const {t} = useTranslation()

  const user = storage.currentUser
  const [name, setName] = useState(user?.name ?? '')
  const [surname, setSurname] = useState(user?.surname ?? '')
  const [isButtonActive, setButtonActive] = useState(
    name.length > 0 && surname.length > 0,
  )
  const surnameInputRef = useRef<TextInput>(null)

  const onSubmit = async () => {
    if (!isButtonActive) return
    analytics.sendEvent('name_next_click')
    if (user?.name === name && user.surname === surname) {
      return navigation.navigate('PickUsernameScreen', {
        initialLink: params?.initialLink,
      })
    }
    showLoading()
    const response = await api.updateProfile({
      name: name.trimEnd(),
      surname: surname.trimEnd(),
    })
    hideLoading()
    if (response.error) {
      if (response.error === 'unauthorized') {
        sendUnAuthorized()
      }
      analytics.sendEvent('name_next_fail', {
        error: response.error,
        code: response.code,
      })
      logJS(
        'error',
        `name_next_fail: code: ${response.code}, error: ${response.error}`,
      )
      return toastHelper.error('errorUpdateNameSurname')
    }
    navigation.navigate('PickUsernameScreen', {
      initialLink: params?.initialLink,
    })
  }

  useEffect(() => {
    analytics.sendEvent('name_screen_open')
    return navigation.addListener('beforeRemove', () => {
      // incorrectly getting called even when we successfully entered name
      // analytics.sendEvent('name_back_click')
      return false
    })
  }, [])

  return (
    <BaseWelcomeLayout
      style={commonStyles.paddingHorizontal}
      contentStyle={styles.content}>
      <View style={commonStyles.wizardContentWrapper}>
        <AppText
          style={[
            commonStyles.registrationBigTitle,
            {color: colors.secondaryBodyText},
          ]}>
          {t('fullNameTitle')}
        </AppText>

        <Vertical style={styles.inputContainer}>
          <AppTextInput
            onTouchStart={() => analytics.sendEvent('name_first_click')}
            style={[styles.textInput]}
            autoFocus={true}
            autoCorrect={false}
            returnKeyType={'next'}
            onSubmitEditing={() => surnameInputRef.current?.focus()}
            placeholder={t('fullNameInputNamePlaceholder')}
            value={name}
            onChangeText={(text) => {
              const input = text.trimStart()
              setName(input)
              setButtonActive(input.length > 0 && surname.length > 0)
            }}
          />

          <Spacer vertical={16} />

          <AppTextInput
            onTouchStart={() => analytics.sendEvent('name_last_click')}
            style={styles.textInput}
            ref={surnameInputRef}
            autoCorrect={false}
            placeholder={t('fullNameInputSurnamePlaceholder')}
            value={surname}
            returnKeyType={'done'}
            onSubmitEditing={onSubmit}
            onChangeText={(text) => {
              const input = text.trimStart()
              setSurname(input)
              setButtonActive(input.length > 0 && name.length > 0)
            }}
          />
          <AppText style={[styles.inputHint, {color: colors.supportBodyText}]}>
            {t('fullNameInputHint')}
          </AppText>
        </Vertical>
      </View>

      <PrimaryButton
        isEnabled={isButtonActive}
        onPress={onSubmit}
        style={[commonStyles.wizardPrimaryButton, {marginTop: 0}]}
        accessibilityLabel={'next'}
        title={t('nextButton')}
      />
    </BaseWelcomeLayout>
  )
}

export default FullNameScreen
const styles = StyleSheet.create({
  content: {
    paddingTop: ms(52),
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: ms(16),
    marginBottom: ms(16),
  },
  inputHint: {
    ...makeTextStyle(13, 21, 'normal'),
    marginTop: ms(16),
  },
  resendButton: {
    marginTop: ms(8),
  },
  textInput: {
    width: '100%',
    flexDirection: 'row',
    fontSize: ms(24),
    height: ms(56),
    paddingHorizontal: ms(12),
  },
})

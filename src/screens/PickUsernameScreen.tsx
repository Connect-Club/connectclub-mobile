import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {analytics} from '../Analytics'
import {api} from '../api/api'
import {hideLoading, showLoading} from '../appEventEmitter'
import AppText from '../components/common/AppText'
import AppTextInput from '../components/common/AppTextInput'
import PrimaryButton from '../components/common/PrimaryButton'
import BaseWelcomeLayout from '../components/screens/BaseWelcomeLayout'
import {InitialLinkProp} from '../models'
import {storage} from '../storage'
import {commonStyles, makeTextStyle, useTheme} from '../theme/appTheme'
import {ms} from '../utils/layout.utils'
import {toastHelper} from '../utils/ToastHelper'

type ScreenRouteProp = RouteProp<{Screen: InitialLinkProp}, 'Screen'>

// switch to backend counterpart once ready
const useGeneratedUsername = false

const PickUsernameScreen: React.FC = () => {
  const navigation = useNavigation()
  const {colors} = useTheme()
  const {params} = useRoute<ScreenRouteProp>()
  const {t} = useTranslation()

  const user = storage.currentUser
  const [username, setUsername] = useState(`@${user?.username ?? ''}`)
  const [isButtonActive, setButtonActive] = useState(username.length > 1)

  useEffect(() => {
    analytics.sendEvent('username_screen_open')
    return navigation.addListener('beforeRemove', () => {
      // incorrectly getting called even if user successfully entered username
      // analytics.sendEvent('username_back_click')
      return false
    })
  }, [])

  const onSubmit = async () => {
    if (!isButtonActive) return
    analytics.sendEvent('username_next_click')
    const newUsername = username.replace('@', '')
    if (newUsername.length < 3) {
      const errorText = t('username_length_too_short')
      analytics.sendEvent('username_fail', {error: errorText})
      return toastHelper.error('username_length_too_short')
    }
    if (user?.username !== newUsername) {
      showLoading()
      const response = await api.updateProfile({
        username: newUsername,
      })
      hideLoading()
      if (response.error) {
        analytics.sendEvent('username_fail', {error: response.error})
        return toastHelper.error(response.error)
      }
      await storage.saveUser(response.data!)
    }
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'PickAvatarScreen',
          params: {initialLink: params?.initialLink},
        },
      ],
    })
  }

  return (
    <BaseWelcomeLayout style={commonStyles.paddingHorizontal}>
      <View style={commonStyles.wizardContentWrapper}>
        <AppText
          style={[
            commonStyles.registrationBigTitle,
            {color: colors.secondaryBodyText},
          ]}>
          {t('pickUsernameTitle')}
        </AppText>
        <AppTextInput
          onTouchStart={() => analytics.sendEvent('username_input_click')}
          style={styles.phoneInput}
          autoFocus={true}
          autoCorrect={false}
          value={username}
          returnKeyType={'done'}
          onSubmitEditing={onSubmit}
          onChangeText={(text) => {
            if (text.length === 0) {
              setUsername('@')
              return setButtonActive(false)
            }
            const [, name] = text.split('@')
            setUsername(`@${name}`)
            setButtonActive(text.length > 0)
          }}
        />
        {useGeneratedUsername && (
          <AppText style={[styles.inputHint, {color: colors.supportBodyText}]}>
            {t('pickUsernameInputHint')}
          </AppText>
        )}
      </View>

      <PrimaryButton
        isEnabled={isButtonActive}
        onPress={onSubmit}
        accessibilityLabel={'nextButton'}
        style={commonStyles.wizardPrimaryButton}
        title={t('nextButton')}
      />
    </BaseWelcomeLayout>
  )
}

export default PickUsernameScreen
const styles = StyleSheet.create({
  title: {
    width: '100%',
    fontSize: ms(34),
    fontWeight: 'bold',
    marginBottom: ms(24),
  },
  phoneInput: {
    fontSize: ms(24),
    height: ms(56),
    paddingHorizontal: ms(12),
  },
  inputHint: {
    textAlign: 'center',
    ...makeTextStyle(13, 21, 'normal'),
    marginTop: ms(16),
  },
})

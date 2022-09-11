import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import React, {useEffect, useLayoutEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Keyboard, ScrollView, StyleSheet} from 'react-native'

import {analytics} from '../Analytics'
import {hideLoading, showLoading} from '../appEventEmitter'
import AppText from '../components/common/AppText'
import {clearWindowFocus} from '../components/common/DecorConfigModule'
import InlineButton from '../components/common/InlineButton'
import PrimaryButton from '../components/common/PrimaryButton'
import Vertical from '../components/common/Vertical'
import MenuTextInput from '../components/screens/room/nativeview/RTCMenuTextInput'
import {KeyboardSpacer} from '../components/webSafeImports/webSafeImports'
import {InitialLinkProp} from '../models'
import {commonStyles, useTheme} from '../theme/appTheme'
import {ms} from '../utils/layout.utils'
import {updateProfileData} from '../utils/profile.utils'
import {processTextLink} from '../utils/textedit.utils'

type ScreenRouteProp = RouteProp<{Screen: InitialLinkProp}, 'Screen'>

const WelcomeSetBioScreen: React.FC = () => {
  const navigation = useNavigation()
  const {t} = useTranslation()
  const {colors} = useTheme()
  const {params} = useRoute<ScreenRouteProp>()
  const [bio, setBio] = useState('')
  const secondaryColor = {color: colors.secondaryBodyText}
  const [buttonEnabled, setButtonEnabled] = useState(true)

  useEffect(() => {
    analytics.sendEvent('welcome_set_bio_screen_open')
  }, [])

  const proceed = async () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'RegistrationSelectInterestsScreen',
          params: {initialLink: params?.initialLink},
        },
      ],
    })
  }

  const onFinishWriteBio = () => {
    setButtonEnabled(false)
    setTimeout(async () => {
      clearWindowFocus()
      Keyboard.dismiss()
      if (await updateProfileData({about: bio})) {
        showLoading()
        proceed().then(() => hideLoading())
      } else {
        setButtonEnabled(true)
      }
    }, 500)
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      title: '',
      headerRight: () => (
        <InlineButton
          textStyle={[styles.buttonText]}
          title={t('skipButton')}
          onPress={proceed}
        />
      ),
    })
  }, [bio])

  return (
    <Vertical style={commonStyles.wizardContainer}>
      <ScrollView>
        <Vertical
          style={[
            styles.container,
            {
              backgroundColor: colors.systemBackground,
            },
          ]}>
          <AppText style={[commonStyles.registrationBigTitle, secondaryColor]}>
            {t('addBioTitle')}
          </AppText>
          <AppText style={[commonStyles.registrationText, secondaryColor]}>
            {t('addBioText')}
          </AppText>
          <Vertical style={commonStyles.paddingHorizontal}>
            <MenuTextInput
              value={bio}
              onChangeText={setBio}
              onLinkText={(link, location) =>
                processTextLink(t, bio, link, location, setBio)
              }
              linkTextColor={colors.primaryClickable}
              multiline
              style={[styles.inputText]}
              placeholder={t('addBioHint')}
            />
            <PrimaryButton
              style={styles.buttonDone}
              isEnabled={bio.length > 0 && buttonEnabled}
              accessibilityLabel={'buttonDone'}
              title={t('doneButton')}
              onPress={onFinishWriteBio}
            />
          </Vertical>
          <KeyboardSpacer />
        </Vertical>
      </ScrollView>
    </Vertical>
  )
}

export default WelcomeSetBioScreen

const styles = StyleSheet.create({
  container: {
    height: '100%',
    paddingTop: ms(42),
  },

  inputText: {
    height: ms(216),
    textAlignVertical: 'top',
  },

  buttonText: {
    fontSize: ms(18),
    marginEnd: ms(10),
    fontWeight: '500',
  },
  buttonDone: {
    ...commonStyles.wizardButton,
    marginTop: ms(16),
  },
})

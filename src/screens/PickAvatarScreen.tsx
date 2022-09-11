import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import React, {useEffect, useLayoutEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {View} from 'react-native'

import {analytics} from '../Analytics'
import {api} from '../api/api'
import {hideLoading, showLoading} from '../appEventEmitter'
import AppText from '../components/common/AppText'
import NavigationSkipButton from '../components/common/NavigationSkipButton'
import PrimaryButton from '../components/common/PrimaryButton'
import BaseWelcomeLayout from '../components/screens/BaseWelcomeLayout'
import UploadAvatarView from '../components/screens/profileScreen/UploadAvatarView'
import {InitialLinkProp} from '../models'
import {storage} from '../storage'
import {commonStyles, useTheme} from '../theme/appTheme'
import {toastHelper} from '../utils/ToastHelper'

type ScreenRouteProp = RouteProp<{Screen: InitialLinkProp}, 'Screen'>

const PickAvatarScreen: React.FC = () => {
  const navigation = useNavigation()
  const {params} = useRoute<ScreenRouteProp>()
  const {colors} = useTheme()
  const {t} = useTranslation()

  const oldAvatar = storage.currentUser?.avatar ?? undefined
  const [avatar, setAvatar] = useState<string | undefined>(oldAvatar)
  const pickAvatarTitle = avatar ? 'pickAvatarTitleAwesome' : 'pickAvatarTitle'

  const proceed = async () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'WelcomeSetBioScreen',
          params: {initialLink: params?.initialLink},
        },
      ],
    })
  }

  const onSkipPress = () => {
    analytics.sendEvent('photo_skip_click')
    proceed()
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => <NavigationSkipButton onPress={onSkipPress} />,
    })
  }, [])

  useEffect(() => {
    analytics.sendEvent('photo_screen_open')
  }, [])

  const onNextPress = async () => {
    if (!avatar) return
    if (avatar === oldAvatar) {
      return proceed()
    }

    showLoading()
    const uploadResponse = await api.uploadAvatar(avatar)
    hideLoading()
    if (uploadResponse.error) {
      analytics.sendEvent('photo_change_fail', {error: uploadResponse.error})
      return toastHelper.error(uploadResponse.error)
    }
    analytics.sendEvent('photo_change_success')
    await storage.saveUser(uploadResponse.data!)

    proceed()
  }
  const showChangeText = !!oldAvatar || !!avatar

  return (
    <BaseWelcomeLayout style={commonStyles.paddingHorizontal}>
      <View style={commonStyles.wizardContentWrapper}>
        <AppText
          style={[
            commonStyles.registrationBigTitle,
            {color: colors.secondaryBodyText},
          ]}>
          {t(pickAvatarTitle)}
        </AppText>

        <UploadAvatarView
          setAvatar={setAvatar}
          showChangeText={showChangeText}
          showUploadHint={!showChangeText}
          analytics={analytics}
        />
      </View>

      {!!avatar && (
        <PrimaryButton
          style={commonStyles.wizardPrimaryButton}
          onPress={onNextPress}
          title={t('nextButton')}
        />
      )}
    </BaseWelcomeLayout>
  )
}

export default PickAvatarScreen

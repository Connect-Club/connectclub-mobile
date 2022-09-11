import {RouteProp, useRoute} from '@react-navigation/native'
import React, {useEffect, useLayoutEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import {analytics} from '../Analytics'
import AppText from '../components/common/AppText'
import IosPermissionsDialogView from '../components/common/IOSPermissionsDialogView'
import Vertical from '../components/common/Vertical'
import {InitialLinkProp} from '../models'
import {commonStyles, makeTextStyle, useTheme} from '../theme/appTheme'
import {ms} from '../utils/layout.utils'
import {requestNotificationPermissions} from '../utils/permissions.utils'
import useOnboardingNavigation from '../utils/useOnboardingNavigation'

type ScreenRouteProp = RouteProp<{Screen: InitialLinkProp}, 'Screen'>

const RequestPermissionNotificationsScreen: React.FC = () => {
  const {params} = useRoute<ScreenRouteProp>()
  const {t} = useTranslation()
  const {colors} = useTheme()
  const [isVisible, setVisible] = useState(false)
  const {finishOnboarding} = useOnboardingNavigation(params)

  useLayoutEffect(() => {
    setVisible(true)
  }, [])

  useEffect(() => {
    analytics.sendEvent('allow_notifications_screen_open')
  }, [])

  const navigateToNextScreen = async () => {
    setVisible(false)
    await finishOnboarding()
  }

  const onDeny = async () => {
    navigateToNextScreen()
  }

  const onAllow = async () => {
    if (await requestNotificationPermissions()) navigateToNextScreen()
  }

  return (
    <>
      <Vertical
        style={[
          commonStyles.flexOne,
          styles.base,
          {backgroundColor: colors.systemBackground},
        ]}>
        <AppText style={[styles.title, {color: colors.secondaryBodyText}]}>
          {t('notificationRequestPermissionsTitle')}
        </AppText>

        <AppText
          style={[styles.description, {color: colors.secondaryBodyText}]}>
          {t('notificationRequestPermissionsDescription')}
        </AppText>
      </Vertical>
      {isVisible && (
        <IosPermissionsDialogView
          title={t('notificationsPermissionsDialogTitle')}
          description={t('notificationsPermissionsDialogDescription')}
          onDenyPress={onDeny}
          onAllowPress={onAllow}
        />
      )}
    </>
  )
}

export default RequestPermissionNotificationsScreen
const styles = StyleSheet.create({
  base: {
    paddingTop: ms(86),
  },

  title: {
    width: '100%',
    textAlign: 'center',
    marginTop: ms(16),
    ...makeTextStyle(34, 40, 'bold'),
  },

  description: {
    ...makeTextStyle(16, 24, 'normal'),
    marginTop: ms(16),
    textAlign: 'center',
    marginBottom: ms(72),
  },
})

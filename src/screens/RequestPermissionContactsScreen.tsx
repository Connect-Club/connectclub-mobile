import {useNavigation} from '@react-navigation/native'
import React, {useCallback, useEffect, useLayoutEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import {analytics} from '../Analytics'
import {api} from '../api/api'
import {hideLoading, showLoading} from '../appEventEmitter'
import AppText from '../components/common/AppText'
import IosPermissionsDialogView from '../components/common/IOSPermissionsDialogView'
import NavigationSkipButton from '../components/common/NavigationSkipButton'
import Vertical from '../components/common/Vertical'
import {logJS} from '../components/screens/room/modules/Logger'
import {UserModel} from '../models'
import {storage} from '../storage'
import {commonStyles, makeTextStyle, useTheme} from '../theme/appTheme'
import {ContactChecker} from '../utils/ContactChecker'
import {ms} from '../utils/layout.utils'
import {resetTo} from '../utils/navigation.utils'
import {toastHelper} from '../utils/ToastHelper'

const RequestPermissionContactsScreen: React.FC = () => {
  const navigation = useNavigation()
  const {colors} = useTheme()
  const {t} = useTranslation()

  const [isVisible, setVisible] = useState(false)
  useEffect(() => {}, [])
  const [contactChecker] = useState(
    () =>
      new ContactChecker((type, screen, params) => {
        const navigationFunc =
          type === 'replace'
            ? // @ts-ignore
              navigation.replace
            : navigation.navigate
        navigationFunc(screen, params)
      }, setVisible),
  )
  useLayoutEffect(() => {
    setVisible(true)
  }, [])

  const goToMatchedContacts = useCallback(async () => {
    showLoading()
    const recommendations = await api.fetchContactRecommendations()
    hideLoading()
    if (recommendations.error) {
      return toastHelper.error(recommendations.error)
    }
    let items: Array<UserModel> | undefined = recommendations.data?.items
    if ((!items || items?.length === 0) && storage.currentUser?.joinedBy) {
      items = [storage.currentUser?.joinedBy]
    }
    logJS('debug', 'matched contacts', JSON.stringify(items, null, 2))
    return navigation.dispatch(
      resetTo('MatchedContactsScreen', {
        recommendations: items,
      }),
    )
  }, [navigation])

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        const onSkipPress = () => {
          analytics.sendEvent('allow_contacts_skip_click')
          // noinspection JSIgnoredPromiseFromCall
          goToMatchedContacts()
        }
        return <NavigationSkipButton onPress={onSkipPress} />
      },
    })
  }, [goToMatchedContacts, navigation])

  useEffect(() => {
    analytics.sendEvent('allow_contacts_screen_open')
  }, [])

  const onDeny = useCallback(async () => {
    analytics.sendEvent('allow_contacts_deny_click')
    await goToMatchedContacts()
  }, [goToMatchedContacts])

  const onAllow = useCallback(async () => {
    analytics.sendEvent('allow_contacts_allow_click')
    await contactChecker.fetchContacts(t)
  }, [contactChecker, t])

  return (
    <>
      <Vertical
        style={[
          commonStyles.flexOne,
          styles.base,
          {backgroundColor: colors.systemBackground},
        ]}>
        <AppText style={[styles.title, {color: colors.secondaryBodyText}]}>
          {t('accessToContactsTitle')}
        </AppText>
        <AppText style={[styles.hint, {color: colors.secondaryBodyText}]}>
          {t('accessToContactsHint')}
        </AppText>
      </Vertical>

      {isVisible && (
        <IosPermissionsDialogView
          title={t('contactsPermissionsDialogTitle')}
          description={t('contactsPermissionsDialogDescription')}
          onDenyPress={onDeny}
          onAllowPress={onAllow}
        />
      )}
    </>
  )
}

export default RequestPermissionContactsScreen
const styles = StyleSheet.create({
  base: {
    paddingHorizontal: ms(32),
  },

  title: {
    width: '100%',
    fontSize: ms(24),
    lineHeight: ms(32),
    textAlign: 'center',
    marginTop: ms(48),
    fontWeight: 'bold',
  },

  hint: {
    width: '100%',
    ...makeTextStyle(16, 24, 'normal'),
    paddingHorizontal: ms(16),
    marginTop: ms(16),
    textAlign: 'center',
    marginBottom: ms(120),
  },
})

import {observer} from 'mobx-react'
import React, {useContext, useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {AppState, AppStateStatus, StyleSheet, View} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {storage} from '../../../storage'
import InvitesStore from '../../../stores/InvitesStore'
import {useTheme} from '../../../theme/appTheme'
import {alertOpenAppSettingsAsk} from '../../../utils/alerts'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import {contactsUtils, openSettings} from '../../webSafeImports/webSafeImports'

interface Props {
  readonly query: string
}

const InvitesNoResultsView: React.FC<Props> = ({query}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()

  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const store = useContext(InvitesStore)

  const queryLength = query.length
  const isShowPermissionView =
    hasPermission === false && queryLength === 0 && store.invites.length === 0
  const isShowNoResults =
    !isShowPermissionView && queryLength > 0 && store.invites.length === 0

  const checkPermissions = async () => {
    const result = await contactsUtils.checkContactsPermissions()
    setHasPermission(result)
  }

  useEffect(() => {
    const onAppStateChanged = (state: AppStateStatus) => {
      if (state === 'active') checkPermissions()
    }
    AppState.addEventListener('change', onAppStateChanged)
    checkPermissions()
    return () => AppState.removeEventListener('change', onAppStateChanged)
  }, [])

  const onRequestPermissionClick = async () => {
    const dontAskPermission = await storage.isDontAskPermissionDidSelected()
    if (dontAskPermission) {
      const goToSettings = await alertOpenAppSettingsAsk(t)
      if (goToSettings) openSettings()
      return
    }
    store.skipNextPermissionRequest = true
    setHasPermission(
      (await contactsUtils.requestContactsPermissions()) === 'authorized',
    )
  }

  return (
    <View
      style={[
        styles.container,
        {marginTop: ms(isShowPermissionView ? 40 : 129)},
      ]}>
      {isShowPermissionView && (
        <View style={styles.permissionsView}>
          <AppIcon type={'icSearchWithStars'} />
          <AppText style={[styles.permissionTitle, {color: colors.bodyText}]}>
            {t('invitesNoPermissionViewTitle')}
          </AppText>
          <AppText
            style={[
              styles.permissionDescription,
              {color: colors.secondaryBodyText},
            ]}>
            {t('invitesNoPermissionViewDescription')}
          </AppText>
          <AppTouchableOpacity
            style={[
              styles.permissionButton,
              {backgroundColor: colors.accentSecondary},
            ]}
            onPress={onRequestPermissionClick}>
            <AppText
              style={[
                styles.permissionButtonText,
                {color: colors.accentPrimary},
              ]}>
              {t('invitesNoPermissionViewButton')}
            </AppText>
          </AppTouchableOpacity>
        </View>
      )}
      {isShowNoResults && (
        <AppText
          style={[styles.noResultsText, {color: colors.secondaryBodyText}]}>
          {t('searchNoResults', {search: query ?? ''})}
        </AppText>
      )}
    </View>
  )
}

export default observer(InvitesNoResultsView)

const styles = StyleSheet.create({
  container: {
    marginTop: ms(129),
  },
  noResultsText: {
    fontSize: ms(17),
    fontWeight: '500',
    lineHeight: ms(25),
    textAlign: 'center',
    marginHorizontal: ms(32),
  },
  permissionsView: {
    flexDirection: 'column',
    alignItems: 'center',
    marginHorizontal: ms(16),
  },
  permissionTitle: {
    marginTop: ms(40),
    fontSize: ms(17),
    fontWeight: 'bold',
    lineHeight: ms(25),
    marginHorizontal: ms(16),
    textAlign: 'center',
  },
  permissionDescription: {
    marginTop: ms(16),
    textAlign: 'center',
  },
  permissionButton: {
    marginTop: ms(32),
    alignSelf: 'center',
    width: 'auto',
    height: ms(28),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ms(16),
    borderRadius: ms(28 / 2),
  },
  permissionButtonText: {
    fontSize: ms(12),
    lineHeight: ms(18),
  },
})

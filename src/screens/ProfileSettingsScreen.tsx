import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import React, {useCallback, useContext, useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {
  AppState,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'

import {InterestModel, LanguageModel} from 'src/models'

import {analytics} from '../Analytics'
import {api} from '../api/api'
import {sendUnAuthorized} from '../appEventEmitter'
import AppIcon from '../assets/AppIcon'
import AppText from '../components/common/AppText'
import AppTouchableOpacity from '../components/common/AppTouchableOpacity'
import Horizontal from '../components/common/Horizontal'
import LanguageButton from '../components/common/LanguageButton'
import Section from '../components/common/Section'
import Spacer from '../components/common/Spacer'
import Vertical from '../components/common/Vertical'
import WebModalHeader from '../components/common/WebModalHeader'
import AppVersionView from '../components/screens/profileScreen/AppVersionView'
import DisabledNotificationsView from '../components/screens/settings/DisabledNotificationsView'
import SettingsDjModeMenuItem from '../components/screens/settings/SettingsDjModeMenuItem'
import SettingsInterestsMenuItem from '../components/screens/settings/SettingsInterestsMenuItem'
import SettingsLinksList from '../components/screens/settings/SettingsLinksList'
import SettingsPushNotificationsMenuItem from '../components/screens/settings/SettingsPushNotificationsMenuItem'
import SettingsSkillsGoalsList from '../components/screens/settings/SettingsSkillsGoalsList'
import {
  alert,
  AppModal,
  presentIntercom,
} from '../components/webSafeImports/webSafeImports'
import {storage} from '../storage'
import MyCountersStore from '../stores/MyCountersStore'
import {commonStyles, makeTextStyle, useTheme} from '../theme/appTheme'
import {isNative} from '../utils/device.utils'
import {ms} from '../utils/layout.utils'
import {runWithLoaderAsync} from '../utils/navigation.utils'
import {useNftWallet} from '../utils/NftWalletProvider'
import {hasNotificationPermissions} from '../utils/permissions.utils'
import {useBottomSafeArea} from '../utils/safeArea.utils'
import {tabletContainerWidthLimit} from '../utils/tablet.consts'
import {toastHelper} from '../utils/ToastHelper'
import {LanguageSelectorScreenProps} from './LanguageSelectorScreen'

interface ProfileSettingsScreen {
  readonly selectedInterests?: Array<InterestModel>
  readonly selectedLanguages?: Array<LanguageModel>
  readonly navigationRoot?: string
}

type ScreenRouteProp = RouteProp<{Screen: ProfileSettingsScreen}, 'Screen'>

const ProfileSettingsScreen: React.FC = () => {
  const {params} = useRoute<ScreenRouteProp>()
  const navigation = useNavigation()
  const {t} = useTranslation()
  const inset = useBottomSafeArea()
  const {colors} = useTheme()
  const [hasPermissions, setHasPermissions] = useState(-1)
  const djModeAvailable = false
  const [selectedLanguages, setSelectedLanguages] = useState(
    storage.currentUser?.languages,
  )
  const countersStore = useContext(MyCountersStore)
  const onLangButtonPress = useCallback(() => {
    const screenProps: LanguageSelectorScreenProps = {
      backScreen: 'ProfileSettingsScreen',
      selection: selectedLanguages,
      title: t('settingsYourLanguageSection'),
      navigationRoot: params?.navigationRoot,
      mode: 'multiple',
    }
    navigation.navigate('LanguageSelectorScreen', screenProps)
  }, [navigation, params?.navigationRoot, selectedLanguages, t])
  const wallet = useNftWallet()

  const onLogoutPress = () => {
    alert(t('logoutAlertTitle'), t('logoutAlertMessage'), [
      {style: 'cancel', text: t('cancelButton')},
      {
        style: 'destructive',
        text: t('logoutAlertOk'),
        onPress: async () => {
          sendUnAuthorized()
        },
      },
    ])
  }

  const onDeleteAccountPress = () => {
    alert(
      t('sendDeleteAccountRequestTitle'),
      t('sendDeleteAccountRequestMessage'),
      [
        {style: 'cancel', text: t('cancelButton')},
        {
          style: 'destructive',
          text: t('sendDeleteAccountRequestConfirmTitle'),
          onPress: async () => {
            onDeleteAccountConfirmPress()
          },
        },
      ],
    )
  }

  const onDeleteAccountConfirmPress = async () => {
    await runWithLoaderAsync(async () => {
      const response = await api.sendDeleteAccountRequest()
      if (!response.error) {
        toastHelper.success('sendDeleteAccountRequestSuccessToast', true)
        return
      }
      toastHelper.error(response.error)
    })
  }

  const onOpenDiscordLink = () => {
    const url = countersStore.counters.joinDiscordLink
    if (!url) return
    analytics.sendEvent('join_discord_profile_link_click', {link: url})
    Linking.openURL(url)
  }

  const onToggleWallet = async () => {
    await wallet.ref.current!.connect()
    if (wallet.ref.current!.isBound) {
      await wallet.ref.current!.unbind()
    } else {
      await wallet.ref.current!.bind()
    }
  }

  useEffect(() => {
    if (params?.selectedLanguages === undefined) return
    setSelectedLanguages(params?.selectedLanguages)
    navigation.setOptions({selectedLanguages: undefined})
  }, [navigation, params?.selectedLanguages])

  useEffect(() => {
    hasNotificationPermissions().then((r) => setHasPermissions(r ? 1 : 0))
    return AppState.addEventListener('change', () => {
      hasNotificationPermissions().then((r) => setHasPermissions(r ? 1 : 0))
    })
  })

  const onSendLog = useCallback(async () => {
    if (await api.sendLogFile())
      return toastHelper.success('logSentMessage', true)
    toastHelper.error('logHasntBeenSentMessage')
  }, [])

  return (
    <AppModal
      navigationRoot={params.navigationRoot}
      isScrolling={false}
      header={
        isNative ? undefined : (
          <WebModalHeader title={t('settingsScreenTitle')} />
        )
      }>
      <ScrollView
        keyboardShouldPersistTaps={'always'}
        keyboardDismissMode={'on-drag'}
        contentContainerStyle={[styles.content, {paddingBottom: inset + 16}]}>
        <Vertical>
          {isNative && (
            <>
              <AppText
                style={[styles.title, {color: colors.secondaryBodyText}]}>
                {t('settingsScreenNotifications')}
              </AppText>

              {hasPermissions === 1 && <SettingsPushNotificationsMenuItem />}
              {hasPermissions === 0 && <DisabledNotificationsView />}
              <Spacer vertical={28} />
              {djModeAvailable && (
                <>
                  <AppText
                    style={[styles.title, {color: colors.secondaryBodyText}]}>
                    {t('settingsScreenSoundSettings')}
                  </AppText>
                  <SettingsDjModeMenuItem />
                  <Spacer vertical={28} />
                </>
              )}
            </>
          )}
          <AppText style={[styles.title, {color: colors.secondaryBodyText}]}>
            {t('settingsYourLanguageSection')}
          </AppText>
          <LanguageButton
            title={t('yourLanguageTitle')}
            style={styles.langSelector}
            languages={selectedLanguages}
            onPress={onLangButtonPress}
          />
          <Spacer vertical={28} />
          <SettingsInterestsMenuItem navigationRoot={params.navigationRoot} />
          <Spacer vertical={28} />
          <SettingsSkillsGoalsList />
          <Spacer vertical={28} />
          <SettingsLinksList />
          <Spacer vertical={28} />

          <Vertical
            style={[
              styles.section,
              {backgroundColor: colors.floatingBackground},
            ]}>
            <AppTouchableOpacity
              style={styles.supportButton}
              onPress={presentIntercom}>
              <AppText
                style={[styles.supportButtonText, {color: colors.bodyText}]}>
                {t('Support')}
              </AppText>
              <AppIcon type={'icArrowRight'} />
            </AppTouchableOpacity>
          </Vertical>
          <View style={[styles.section, {backgroundColor: '#5A68EA'}]}>
            <AppTouchableOpacity
              style={styles.supportButton}
              onPress={onOpenDiscordLink}>
              <Horizontal style={commonStyles.flexCenter}>
                <AppIcon type={'icDiscord24'} />
                <Spacer horizontal={ms(12)} />
                <AppText
                  style={[styles.boldButtonText, {color: colors.textPrimary}]}>
                  {t('joinOurDiscord')}
                </AppText>
                <AppIcon type={'icArrowRightOpaque'} tint={colors.card} />
              </Horizontal>
            </AppTouchableOpacity>
          </View>
          <AppTouchableOpacity
            style={[
              styles.logoutButton,
              {backgroundColor: colors.floatingBackground},
            ]}
            accessibilityLabel={'logoutButton'}
            onPress={onLogoutPress}>
            <AppText style={[styles.logoutButtonText, {color: colors.warning}]}>
              {t('settingsScreenLogout')}
            </AppText>
          </AppTouchableOpacity>
          {storage.currentUser?.enableDeleteWallet && (
            <AppTouchableOpacity
              style={[
                styles.sendLogButton,
                {backgroundColor: colors.floatingBackground},
              ]}
              onPress={onToggleWallet}>
              <AppText
                style={[
                  styles.sendLogButtonText,
                  {color: colors.primaryClickable},
                ]}>
                {!wallet.isBound
                  ? t('settingsScreenWallet')
                  : t('settingsScreenDropWallet')}
              </AppText>
            </AppTouchableOpacity>
          )}
          {!storage.currentUser?.enableDeleteWallet &&
            storage.currentUser?.wallet && (
              <>
                <Section title={t('yourWallet')} />
                <View
                  style={[
                    styles.sectionBlock,
                    {backgroundColor: colors.floatingBackground},
                  ]}>
                  <AppText style={styles.sectionText}>
                    {storage.currentUser.wallet}
                  </AppText>
                </View>
              </>
            )}
          <AppTouchableOpacity
            style={[
              styles.sendLogButton,
              {backgroundColor: colors.floatingBackground},
            ]}
            onPress={onSendLog}>
            <AppText
              style={[
                styles.sendLogButtonText,
                {color: colors.primaryClickable},
              ]}>
              {t('sendLogsButton')}
            </AppText>
          </AppTouchableOpacity>
          <AppText
            style={[
              styles.deleteAccountNoticeText,
              {color: colors.supportBodyText},
            ]}>
            {t('sendDeleteAccountRequestNotice')}
          </AppText>
          <AppTouchableOpacity
            style={[
              styles.sendDeleteRequestButton,
              {backgroundColor: colors.floatingBackground},
            ]}
            accessibilityLabel={'sendDeleteRequestButton'}
            onPress={onDeleteAccountPress}>
            <AppText style={[styles.logoutButtonText, {color: colors.warning}]}>
              {t('settingsScreenDeleteAccount')}
            </AppText>
          </AppTouchableOpacity>
          <AppVersionView />
        </Vertical>
      </ScrollView>
    </AppModal>
  )
}

export default ProfileSettingsScreen

const styles = StyleSheet.create({
  content: {
    paddingTop: ms(16),
    paddingHorizontal: ms(16),
    maxWidth: tabletContainerWidthLimit,
    alignSelf: 'center',
    ...Platform.select({
      web: {
        minWidth: tabletContainerWidthLimit,
      },
    }),
  },
  title: {
    fontSize: ms(13),
    fontWeight: 'bold',
    marginBottom: ms(8),
  },
  logoutButton: {
    borderRadius: ms(8),
    height: ms(48),
    paddingHorizontal: ms(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  supportButton: {
    height: ms(48),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  logoutButtonText: {
    fontSize: ms(17),
  },
  langSelector: {
    marginHorizontal: 0,
    marginTop: ms(0),
  },
  supportButtonText: {
    flex: 1,
    fontSize: ms(17),
  },
  boldButtonText: {
    flex: 1,
    fontSize: ms(17),
    fontWeight: 'bold',
  },
  communityButtonText: {
    flex: 1,
    fontSize: ms(17),
  },
  section: {
    borderRadius: ms(8),
    paddingHorizontal: ms(16),
    marginBottom: ms(32),
  },
  sendLogButton: {
    marginTop: ms(32),
    borderRadius: ms(8),
    height: ms(48),
    paddingHorizontal: ms(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteAccountNoticeText: {
    fontSize: ms(13),
    marginTop: ms(30),
    lineHeight: ms(20),
    paddingStart: ms(4),
  },
  sendDeleteRequestButton: {
    marginTop: ms(4),
    borderRadius: ms(8),
    height: ms(48),
    paddingHorizontal: ms(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendLogButtonText: {
    fontSize: ms(17),
  },
  walletTitle: {
    fontSize: ms(13),
    fontWeight: 'bold',
    marginVertical: ms(8),
  },
  sectionBlock: {
    marginTop: ms(8),
    borderRadius: ms(8),
    height: ms(48),
    paddingHorizontal: ms(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionText: {
    ...makeTextStyle(12, 32),
  },
})

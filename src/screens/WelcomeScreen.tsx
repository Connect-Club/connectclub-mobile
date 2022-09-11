import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useContext, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {ScrollView, StyleSheet} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {analytics} from '../Analytics'
import AppText from '../components/common/AppText'
import Horizontal from '../components/common/Horizontal'
import InlineButton from '../components/common/InlineButton'
import PrimaryButton from '../components/common/PrimaryButton'
import Spacer from '../components/common/Spacer'
import Vertical from '../components/common/Vertical'
import {FadeViewOnStart} from '../components/screens/startRoom/FadeViewOnStart'
import {InitialLinkProp} from '../models'
import ClubStore from '../stores/ClubStore'
import PhoneNumberFormatsStore from '../stores/PhoneNumberFormatsStore'
import {commonStyles, makeTextStyle, useTheme} from '../theme/appTheme'
import {isWebOrTablet} from '../utils/device.utils'
import {ms} from '../utils/layout.utils'
import {runWithLoaderAsync} from '../utils/navigation.utils'
import {getClubIdFromUri} from '../utils/stringHelpers'
import {tabletContainerWidthLimit} from '../utils/tablet.consts'
import {useDeepLinkNavigation} from '../utils/useDeepLinkNaivgation'
import {useSignUpWithWallet} from '../utils/useSignUpWithWallet'
import {useViewModel} from '../utils/useViewModel'

type ScreenRouteProp = RouteProp<{Screen: InitialLinkProp}, 'Screen'>

const WelcomeScreen: React.FC = () => {
  const {colors} = useTheme()
  const navigation = useNavigation()
  const {params} = useRoute<ScreenRouteProp>()
  const {t} = useTranslation()
  const store = useViewModel(() => new ClubStore())
  const inset = useSafeAreaInsets()
  const welcomeStepsText = store.clubId
    ? t('welcomeToClubStepsText')
    : t('welcomeStepsText')
  const phoneFormatsStore = useContext(PhoneNumberFormatsStore)
  const deepLinkNavigation = useDeepLinkNavigation()
  const signUpWithWallet = useSignUpWithWallet(params.initialLink)

  const onContinueWithWalletPress = async () => {
    analytics.sendEvent('welcome_continue_with_wallet_click')
    await runWithLoaderAsync(signUpWithWallet)
  }
  const onContinueWithPhonePress = () => {
    analytics.sendEvent('welcome_continue_with_phone_click')
    toEnterPhoneScreen()
  }

  const toEnterPhoneScreen = () => {
    const link = store.club?.id
      ? `?clubId=${store.clubId}`
      : params?.initialLink
    navigation.navigate('EnterPhoneScreen', {initialLink: link})
  }

  useEffect(() => {
    deepLinkNavigation.onWelcomeNavigationReady()
  }, [deepLinkNavigation])

  useEffect(() => {
    const clubId = getClubIdFromUri(params?.initialLink)
    if (clubId) {
      store.initializeWithClubId(clubId)
    }
    analytics.sendEvent('welcome_screen_open')
  }, [params?.initialLink, store])

  useEffect(() => {
    // prefetch phone formats
    phoneFormatsStore.fetch(true)
  }, [phoneFormatsStore])

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      {!store.isLoading && (
        <FadeViewOnStart
          style={[styles.contentContainer, {paddingTop: inset.top + 56}]}>
          <Vertical style={styles.descriptionContainer}>
            <AppText style={[styles.title, {color: colors.thirdIcons}]}>
              {t('welcomeTitle')}
            </AppText>
            <AppText style={[[styles.text, {color: colors.bodyText}]]}>
              {t('welcomeText')}
            </AppText>
            <AppText style={[[styles.text, {color: colors.bodyText}]]}>
              {welcomeStepsText}
            </AppText>
          </Vertical>

          <Vertical style={styles.buttonsContainer}>
            <PrimaryButton
              accessibilityLabel={'continueWithCryptoWalletButton'}
              onPress={onContinueWithWalletPress}
              style={styles.getUsernameButton}
              title={t('continueWithCryptoWallet')}
            />
            <Horizontal style={commonStyles.flexCenter}>
              <InlineButton
                textStyle={[
                  styles.welcomeSignInButtonText,
                  {color: colors.primaryClickable},
                ]}
                accessibilityLabel={'welcomeContinueWithPhoneButton'}
                title={t('welcomeContinueWithPhone')}
                onPress={onContinueWithPhonePress}
              />
            </Horizontal>
            <Spacer vertical={inset.bottom} />
          </Vertical>
        </FadeViewOnStart>
      )}
    </ScrollView>
  )
}

export default observer(WelcomeScreen)

const styles = StyleSheet.create({
  scrollViewContent: {flexGrow: 1},
  contentContainer: {
    flex: 1,
    paddingHorizontal: ms(32),
  },
  descriptionContainer: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: isWebOrTablet() ? 'center' : 'flex-start',
  },
  title: {
    width: '100%',
    fontSize: ms(34),
    textAlign: 'center',
    fontWeight: 'bold',
  },
  text: {
    marginTop: ms(24),
    fontSize: ms(17),
    lineHeight: ms(25),
    maxWidth: ms(tabletContainerWidthLimit),
  },
  buttonsContainer: {
    alignItems: 'center',
    marginTop: ms(48),
    paddingBottom: ms(24),
  },
  getUsernameButton: {
    marginBottom: ms(16),
    height: ms(48),
    minWidth: ms(isWebOrTablet() ? 280 : 215),
  },
  welcomeSignInText: {
    ...makeTextStyle(13, 21, 'normal'),
  },
  welcomeSignInButtonText: {
    ...makeTextStyle(13, 21, 'bold'),
  },
})

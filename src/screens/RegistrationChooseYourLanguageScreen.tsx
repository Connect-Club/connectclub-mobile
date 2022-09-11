import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useCallback, useEffect, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {analytics} from '../Analytics'
import BaseInlineBottomSheet, {
  AppBottomSheet,
} from '../components/BaseInlineBottomSheet'
import AppText from '../components/common/AppText'
import LanguageButton from '../components/common/LanguageButton'
import LanguageSelectorView from '../components/common/LanguageSelectorView'
import PrimaryButton from '../components/common/PrimaryButton'
import {InitialLinkProp, LanguageModel} from '../models'
import {storage} from '../storage'
import LanguageSelectorStore from '../stores/LanguageSelectorStore'
import {commonStyles, useTheme} from '../theme/appTheme'
import {ms} from '../utils/layout.utils'
import {updateNativeLang} from '../utils/profile.utils'
import {useViewModel} from '../utils/useViewModel'

type ScreenRouteProp = RouteProp<{Screen: InitialLinkProp}, 'Screen'>

const RegistrationChooseYourLanguageScreen: React.FC = () => {
  const navigation = useNavigation()
  const {params} = useRoute<ScreenRouteProp>()
  const {t} = useTranslation()
  const {colors} = useTheme()
  const langStore = useViewModel(() => new LanguageSelectorStore())
  const langSheetRef = useRef<AppBottomSheet>(null)

  useEffect(() => {
    langStore.toggle(storage.currentUser?.language)
    langStore.fetch()
  }, [])

  useEffect(() => {
    analytics.sendEvent('choose_language_screen_open')
  }, [params?.initialLink])

  const onSelectLangPress = useCallback(
    () => langSheetRef.current?.present?.(),
    [],
  )

  const onLangSelectSelect = useCallback((item: LanguageModel) => {
    langSheetRef.current?.dismiss?.()
    langStore.toggle(item)
  }, [])

  const onNextPress = useCallback(async () => {
    const selectedLang = langStore.selectedLanguages
    if (!selectedLang) return
    if (await updateNativeLang(selectedLang[0]))
      navigation.navigate('PickAvatarScreen', {
        initialLink: params?.initialLink,
      })
  }, [])

  return (
    <View style={[commonStyles.flexOne, commonStyles.wizardContainer]}>
      <View style={styles.content}>
        <AppText style={[styles.title, {color: colors.secondaryBodyText}]}>
          {t('chooseYourLanguageScreenTitle')}
        </AppText>
        <AppText style={[styles.subtitle, {color: colors.secondaryBodyText}]}>
          {t('chooseYourLanguageScreenSubtitle')}
        </AppText>
        <LanguageButton
          title={t('yourLanguageTitle')}
          style={styles.langSelector}
          languages={langStore.selectedLanguages[0]}
          onPress={onSelectLangPress}
        />
        <BaseInlineBottomSheet ref={langSheetRef} snaps={['90%']}>
          <AppText style={styles.langSheetTitle}>
            {t('yourLanguageTitle')}
          </AppText>
          <LanguageSelectorView
            style={styles.langSelectorView}
            forBottomSheet={true}
            store={langStore}
            onItemSelect={onLangSelectSelect}
          />
        </BaseInlineBottomSheet>
      </View>
      <View>
        <PrimaryButton
          isEnabled={!!langStore.selectedLanguages}
          style={commonStyles.wizardPrimaryButton}
          onPress={onNextPress}
          title={t('nextButton')}
        />
        <AppText
          style={[styles.explanation, {color: colors.secondaryBodyText}]}>
          {t('chooseYourLanguageScreenExplanation')}
        </AppText>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    ...commonStyles.wizardContainer,
    marginTop: ms(16),
  },
  title: {
    fontSize: ms(34),
    lineHeight: ms(40),
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: ms(16),
  },
  subtitle: {
    fontSize: ms(20),
    lineHeight: ms(28),
    textAlign: 'center',
    marginTop: ms(16),
  },
  explanation: {
    maxWidth: ms(306),
    alignSelf: 'center',
    fontSize: ms(13),
    lineHeight: ms(21),
    textAlign: 'center',
    marginTop: ms(16),
    paddingHorizontal: ms(18),
    marginBottom: ms(12),
  },
  langSelector: {
    marginTop: ms(116),
  },
  langSheetTitle: {
    marginTop: ms(16),
    fontSize: ms(18),
    lineHeight: ms(24),
    textAlign: 'center',
  },
  langSelectorView: {
    marginTop: ms(16),
  },
})

export default observer(RegistrationChooseYourLanguageScreen)

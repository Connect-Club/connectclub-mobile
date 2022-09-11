import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useCallback, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import {appEventEmitter} from '../appEventEmitter'
import AppNavigationHeader from '../components/common/AppNavigationHeader'
import AppText from '../components/common/AppText'
import BottomGradientView from '../components/common/BottomGradientView'
import LanguageSelectorView from '../components/common/LanguageSelectorView'
import PrimaryButton from '../components/common/PrimaryButton'
import Vertical from '../components/common/Vertical'
import WebModalHeader from '../components/common/WebModalHeader'
import NavigationIconButton from '../components/screens/mainFeed/NavigationIconButton'
import {HandleComponent} from '../components/screens/room/CommonBottomSheet'
import {AppModal} from '../components/webSafeImports/webSafeImports'
import {LanguageModel} from '../models'
import LanguageSelectorStore from '../stores/LanguageSelectorStore'
import {commonStyles, useTheme} from '../theme/appTheme'
import {ms} from '../utils/layout.utils'
import {useViewModel} from '../utils/useViewModel'

export interface LanguageSelectorScreenProps {
  readonly title?: string
  readonly backScreen: string
  readonly selection?: LanguageModel | Array<LanguageModel>
  readonly navigationRoot?: string
  readonly withCustomToolbar?: boolean
  readonly mode?: 'single' | 'multiple'
}
type ScreenRouteProp = RouteProp<
  {Screen: LanguageSelectorScreenProps},
  'Screen'
>

const FOOTER_SIZE = 183

const LanguageSelectorScreen: React.FC = () => {
  const {params} = useRoute<ScreenRouteProp>()
  const {t} = useTranslation()
  const {colors} = useTheme()
  const navigation = useNavigation()
  const withCustomToolbar = params.withCustomToolbar ?? false
  const mode = params.mode ?? 'single'
  const langStore = useViewModel(() => new LanguageSelectorStore(mode))

  useEffect(() => {
    const selection = params?.selection
    if (selection === undefined || selection === null) return
    let selectedLangs: Array<LanguageModel> = []
    selectedLangs = selectedLangs.concat(selection)
    langStore.toggleAll(selectedLangs)
  }, [langStore, navigation, params?.selection])

  useEffect(() => {
    langStore.fetch()
  }, [langStore])

  const onItemSelect = useCallback(
    (item: LanguageModel) => {
      langStore.toggle(item)
      if (mode === 'single') {
        navigation.navigate(params.backScreen, {selectedLanguage: item})
      }
    },
    [langStore, mode, navigation, params.backScreen],
  )

  const onClose = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const onApply = useCallback(() => {
    if (mode !== 'multiple') return
    langStore.saveToProfile().then((result) => {
      if (result) {
        appEventEmitter.trigger('userLanguagesSet')
        navigation.navigate(params.backScreen, {
          selectedLanguages: langStore.selectedLanguages,
        })
      }
    })
  }, [langStore, mode, navigation])

  return (
    <AppModal
      navigationRoot={params.navigationRoot}
      transparent={false}
      header={<WebModalHeader title={params.title} />}
      isScrolling={false}
      contentStyle={styles.modal}>
      <Vertical style={[commonStyles.wizardContainer, commonStyles.flexOne]}>
        {withCustomToolbar && (
          <>
            <HandleComponent />
            <AppNavigationHeader
              headerLeft={
                <NavigationIconButton
                  icon={'icNavigationClose'}
                  accessibilityLabel={'closeLanguageSelector'}
                  tint={colors.accentPrimary}
                  onPress={onClose}
                />
              }
              topInset={false}
              title={params.title}
            />
          </>
        )}
        <LanguageSelectorView
          contentContainerStyle={
            mode === 'multiple' ? styles.listContainerPadding : undefined
          }
          store={langStore}
          onItemSelect={onItemSelect}
        />
        {mode === 'multiple' && (
          <BottomGradientView height={ms(FOOTER_SIZE)}>
            <PrimaryButton
              isEnabled={langStore.selectedLanguages.length > 0}
              accessibilityLabel={'applyButton'}
              onPress={onApply}
              title={t('apply')}
            />
            <AppText style={[styles.hintText, {color: colors.supportBodyText}]}>
              {t('chooseLanguagesHint')}
            </AppText>
          </BottomGradientView>
        )}
      </Vertical>
    </AppModal>
  )
}

export default observer(LanguageSelectorScreen)

const styles = StyleSheet.create({
  modal: {
    padding: 0,
  },
  hintText: {
    fontSize: ms(12),
    marginTop: ms(16),
    maxWidth: ms(306),
    paddingHorizontal: ms(16),
    textAlign: 'center',
  },
  listContainerPadding: {
    paddingBottom: ms(FOOTER_SIZE),
  },
})

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useContext, useEffect, useLayoutEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {Platform, StyleSheet, View} from 'react-native'

import {hideLoading, showLoading} from '../appEventEmitter'
import AppText from '../components/common/AppText'
import BottomGradientView from '../components/common/BottomGradientView'
import PrimaryButton from '../components/common/PrimaryButton'
import WebModalHeader from '../components/common/WebModalHeader'
import SkillCategoriesList from '../components/screens/skills/SkillCategoriesList'
import SkillsModalHeader from '../components/screens/skills/SkillsModalHeader'
import {AppModal} from '../components/webSafeImports/webSafeImports'
import {storage} from '../storage'
import SkillsStore from '../stores/SkillsStore'
import {commonStyles, useTheme} from '../theme/appTheme'
import {isWeb} from '../utils/device.utils'
import {bottomInset} from '../utils/inset.utils'
import {ms} from '../utils/layout.utils'
import {useBottomSafeArea} from '../utils/safeArea.utils'
import {popupHeight, tabletContainerWidthLimit} from '../utils/tablet.consts'

interface SettingsSelectSkillsScreenProps {
  readonly navigationRoot?: string
}

type ScreenRouteProp = RouteProp<
  {Screen: SettingsSelectSkillsScreenProps},
  'Screen'
>

const SettingsSelectSkillsScreen: React.FC = () => {
  const {params} = useRoute<ScreenRouteProp>()
  const navigation = useNavigation()
  const {t} = useTranslation()
  const inset = useBottomSafeArea()
  const store = useContext(SkillsStore)
  const {colors} = useTheme()

  const bottomContainerHeight = bottomInset(inset) + 48 + 32 + 32

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <SkillsModalHeader title={t('settingsScreenSkills')} />,
    })
  }, [])

  useEffect(() => {
    const userSkills = storage.currentUser?.skills ?? []
    store.resetSelection()
    store.addSelected(userSkills)
  }, [])

  const onSavePress = async () => {
    showLoading()
    await store.updateUserSkills()
    await storage.updateSkills(Array.from(store.selected.values()))
    hideLoading()
    navigation.goBack()
  }

  return (
    <AppModal
      navigationRoot={params?.navigationRoot}
      transparent={false}
      contentStyle={styles.modal}
      header={
        isWeb ? <WebModalHeader title={t('settingsScreenSkills')} /> : undefined
      }>
      <View style={[commonStyles.fullWidth, styles.base]}>
        <SkillCategoriesList
          contentStyle={{paddingBottom: bottomContainerHeight}}
          headerComponent={
            <AppText style={[styles.title, {color: colors.bodyText}]}>
              {t('settingsSelectSkillsScreenTitle')}
            </AppText>
          }
        />

        <BottomGradientView height={bottomContainerHeight}>
          <View style={styles.buttonsContainer}>
            <PrimaryButton
              style={commonStyles.wizardButton}
              onPress={onSavePress}
              title={t('saveButton')}
            />
          </View>
        </BottomGradientView>
      </View>
    </AppModal>
  )
}

export default observer(SettingsSelectSkillsScreen)
const styles = StyleSheet.create({
  modal: {
    paddingHorizontal: 0,
  },
  base: {
    flex: 1,
    width: '100%',
    maxWidth: ms(tabletContainerWidthLimit),
    alignSelf: 'center',
    ...Platform.select({
      web: {
        maxHeight: popupHeight,
        minHeight: popupHeight,
      },
    }),
  },
  title: {
    width: '100%',
    fontSize: ms(18),
    lineHeight: ms(24),
    textAlign: 'center',
    fontWeight: 'bold',
    ...commonStyles.paddingHorizontal,
  },
  buttonsContainer: {
    width: '100%',
    ...commonStyles.paddingHorizontal,
  },
})

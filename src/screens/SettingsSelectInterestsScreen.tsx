import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useContext, useEffect, useLayoutEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {hideLoading, showLoading} from '../appEventEmitter'
import AppText from '../components/common/AppText'
import BottomGradientView from '../components/common/BottomGradientView'
import PrimaryButton from '../components/common/PrimaryButton'
import WebModalHeader from '../components/common/WebModalHeader'
import InterestCategoriesList from '../components/screens/interests/InterestCategoriesList'
import InterestsModalHeader from '../components/screens/interests/InterestsModalHeader'
import {AppModal} from '../components/webSafeImports/webSafeImports'
import {storage} from '../storage'
import InterestsStore, {INTERESTS_LIMIT} from '../stores/InterestsStore'
import {commonStyles, useTheme} from '../theme/appTheme'
import {isWeb} from '../utils/device.utils'
import {bottomInset} from '../utils/inset.utils'
import {ms} from '../utils/layout.utils'
import {useBottomSafeArea} from '../utils/safeArea.utils'
import {tabletContainerWidthLimit} from '../utils/tablet.consts'

interface SettingsSelectInterestsScreenProps {
  readonly navigationRoot?: string
}

type ScreenRouteProp = RouteProp<
  {Screen: SettingsSelectInterestsScreenProps},
  'Screen'
>

const SettingsSelectInterestsScreen: React.FC = () => {
  const {params} = useRoute<ScreenRouteProp>()
  const navigation = useNavigation()
  const {colors} = useTheme()
  const {t} = useTranslation()
  const inset = useBottomSafeArea()
  const store = useContext(InterestsStore)

  const bottomContainerHeight = bottomInset(inset) + 48 + 32 + 32

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <InterestsModalHeader title={t('settingsSelectInterestsScreenTitle')} />
      ),
    })
  }, [])

  useEffect(() => {
    const userInterests = storage.currentUser?.interests ?? []
    store.resetSelection()
    store.addSelected(userInterests)
  }, [])

  const onNextPress = async () => {
    showLoading()
    await store.updateUserInterests()
    await storage.updateInterests(Array.from(store.selected.values()))
    hideLoading()
    navigation.goBack()
  }

  return (
    <AppModal
      navigationRoot={params?.navigationRoot}
      transparent={false}
      contentStyle={styles.modal}
      isScrolling={false}
      header={
        isWeb ? (
          <WebModalHeader title={t('settingsScreenInterests')} />
        ) : undefined
      }>
      <View style={[commonStyles.wizardContainer, styles.base]}>
        <InterestCategoriesList
          contentStyle={{paddingBottom: bottomContainerHeight}}
          headerComponent={
            <AppText style={[styles.title, {color: colors.secondaryBodyText}]}>
              {t('chooseInterestsSubtitle', {limit: INTERESTS_LIMIT})}
            </AppText>
          }
        />

        <BottomGradientView height={bottomContainerHeight}>
          <View style={styles.buttonsContainer}>
            <PrimaryButton
              style={commonStyles.wizardButton}
              onPress={onNextPress}
              title={t('saveButton')}
            />
          </View>
        </BottomGradientView>
      </View>
    </AppModal>
  )
}

export default observer(SettingsSelectInterestsScreen)
const styles = StyleSheet.create({
  modal: {
    paddingHorizontal: 0,
  },
  container: {
    height: '100%',
  },
  base: {
    flex: 1,
    maxWidth: tabletContainerWidthLimit,
    alignSelf: 'center',
  },
  title: {
    width: '100%',
    fontSize: ms(12),
    lineHeight: ms(14),
    textAlign: 'center',
    ...commonStyles.paddingHorizontal,
  },
  buttonsContainer: {
    width: '100%',
    ...commonStyles.paddingHorizontal,
  },
})

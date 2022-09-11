import {useNavigation} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useContext, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {Platform, StyleSheet, View} from 'react-native'

import {analytics} from '../Analytics'
import {hideLoading, showLoading} from '../appEventEmitter'
import AppText from '../components/common/AppText'
import BottomGradientView from '../components/common/BottomGradientView'
import PrimaryButton from '../components/common/PrimaryButton'
import SkillCategoriesList from '../components/screens/skills/SkillCategoriesList'
import {AppModal} from '../components/webSafeImports/webSafeImports'
import {storage} from '../storage'
import SkillsStore from '../stores/SkillsStore'
import {commonStyles, useTheme} from '../theme/appTheme'
import {bottomInset} from '../utils/inset.utils'
import {ms} from '../utils/layout.utils'
import {useBottomSafeArea} from '../utils/safeArea.utils'
import {popupHeight, tabletContainerWidthLimit} from '../utils/tablet.consts'

const RegistrationSelectSkillsScreen: React.FC = () => {
  const navigation = useNavigation()
  const {colors} = useTheme()
  const {t} = useTranslation()
  const inset = useBottomSafeArea()
  const store = useContext(SkillsStore)

  const bottomContainerHeight = bottomInset(inset) + 48 + 8 + 14 + 32 + 32

  useEffect(() => {
    const userSkills = storage.currentUser?.skills ?? []
    store.resetSelection()
    store.addSelected(userSkills)
    analytics.sendEvent('skills_screen_open')
    store.analyticsSender = analytics
    return () => (store.analyticsSender = undefined)
  }, [])

  const onSavePress = async () => {
    const selectedSkills = Array.from(store.selected.values())
    showLoading()
    await store.updateUserSkills()
    await storage.updateSkills(selectedSkills)
    hideLoading()
    navigation.goBack()
  }

  return (
    <AppModal>
      <View style={styles.base}>
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
              onPress={onSavePress}
              isEnabled={store.selected.size > 0}
              title={t('save')}
            />
          </View>
        </BottomGradientView>
      </View>
    </AppModal>
  )
}

export default observer(RegistrationSelectSkillsScreen)
const styles = StyleSheet.create({
  base: {
    flex: 1,
    marginTop: ms(35),
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
    fontWeight: 'normal',
    ...commonStyles.paddingHorizontal,
  },

  buttonsContainer: {
    width: '100%',
    ...commonStyles.paddingHorizontal,
  },
})

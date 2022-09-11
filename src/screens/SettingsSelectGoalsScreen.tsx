import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useContext, useEffect, useLayoutEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {Platform, ScrollView, StyleSheet, View} from 'react-native'

import {hideLoading, showLoading} from '../appEventEmitter'
import AppText from '../components/common/AppText'
import BottomGradientView from '../components/common/BottomGradientView'
import PrimaryButton from '../components/common/PrimaryButton'
import Spacer from '../components/common/Spacer'
import Vertical from '../components/common/Vertical'
import WebModalHeader from '../components/common/WebModalHeader'
import GoalListItem from '../components/screens/goals/GoalListItem'
import SkillsModalHeader from '../components/screens/skills/SkillsModalHeader'
import {AppModal} from '../components/webSafeImports/webSafeImports'
import {storage} from '../storage'
import GoalsStore from '../stores/GoalsStore'
import {commonStyles, useTheme} from '../theme/appTheme'
import {isWeb} from '../utils/device.utils'
import {bottomInset} from '../utils/inset.utils'
import {ms} from '../utils/layout.utils'
import {useBottomSafeArea} from '../utils/safeArea.utils'
import {popupHeight, tabletContainerWidthLimit} from '../utils/tablet.consts'

interface SettingsSelectGoalsScreenProps {
  readonly navigationRoot?: string
}

type ScreenRouteProp = RouteProp<
  {Screen: SettingsSelectGoalsScreenProps},
  'Screen'
>

const SettingsSelectGoalsScreen: React.FC = () => {
  const {params} = useRoute<ScreenRouteProp>()
  const navigation = useNavigation()
  const {t} = useTranslation()
  const inset = useBottomSafeArea()
  const store = useContext(GoalsStore)
  const {colors} = useTheme()

  const bottomContainerHeight = bottomInset(inset) + 48 + 32 + 32

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => <SkillsModalHeader title={t('settingsScreenGoals')} />,
    })
  }, [])

  useEffect(() => {
    store.fetch()
    return () => store.cleanup()
  }, [])

  useEffect(() => {
    const userGoals = storage.currentUser?.goals ?? []
    store.resetSelection()
    store.addSelected(userGoals)
  }, [])

  const onSavePress = async () => {
    showLoading()
    await store.updateUserGoals()
    await storage.updateGoals(Array.from(store.selected.values()))
    hideLoading()
    navigation.goBack()
  }

  return (
    <AppModal
      navigationRoot={params?.navigationRoot}
      transparent={false}
      contentStyle={styles.modal}
      header={
        isWeb ? <WebModalHeader title={t('settingsScreenGoals')} /> : undefined
      }>
      <View
        style={[
          commonStyles.fullWidth,
          styles.base,
          {marginTop: navigation.getParent() === undefined ? ms(35) : 0},
        ]}>
        <AppText style={[styles.title, {color: colors.bodyText}]}>
          {t('settingsSelectGoalsScreenTitle')}
        </AppText>
        <Spacer vertical={35} />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={{paddingBottom: bottomContainerHeight}}>
          <Vertical style={styles.listContainerPadding}>
            {store.goals.map((goal) => {
              return <GoalListItem goal={goal} key={goal.id} />
            })}
          </Vertical>
        </ScrollView>
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

export default observer(SettingsSelectGoalsScreen)
const styles = StyleSheet.create({
  modal: {},
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
    fontWeight: 'bold',
    ...commonStyles.paddingHorizontal,
  },
  buttonsContainer: {
    width: '100%',
    ...commonStyles.paddingHorizontal,
  },
  scrollView: {
    paddingHorizontal: ms(16),
  },
  listContainerPadding: {
    backgroundColor: '#fff',
    borderRadius: ms(8),
    paddingHorizontal: ms(16),
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: ms(48),
  },
})

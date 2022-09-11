import {useNavigation} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useContext, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {Platform, StyleSheet, View} from 'react-native'

import {analytics} from '../Analytics'
import {api} from '../api/api'
import {hideLoading, showLoading} from '../appEventEmitter'
import AppText from '../components/common/AppText'
import PrimaryButton from '../components/common/PrimaryButton'
import Spacer from '../components/common/Spacer'
import BaseWelcomeLayout from '../components/screens/BaseWelcomeLayout'
import SettingsSkillsGoalsList from '../components/screens/settings/SettingsSkillsGoalsList'
import {storage} from '../storage'
import GoalsStore from '../stores/GoalsStore'
import IndustriesStore from '../stores/IndustriesStore'
import SkillsStore from '../stores/SkillsStore'
import {commonStyles, useTheme} from '../theme/appTheme'
import {ms} from '../utils/layout.utils'
import {requestNotificationPermissions} from '../utils/permissions.utils'
import {makeUserVerified} from '../utils/profile.utils'

const RegistrationIndustriesSkillsGoalsScreen: React.FC = () => {
  const navigation = useNavigation()
  const {colors} = useTheme()
  const {t} = useTranslation()
  const industriesStore = useContext(IndustriesStore)
  const skillsStore = useContext(SkillsStore)
  const goalsStore = useContext(GoalsStore)

  useEffect(() => {
    const userIndustries = storage.currentUser?.industries ?? []
    industriesStore.resetSelection()
    industriesStore.addSelected(userIndustries)
    const userSkills = storage.currentUser?.skills ?? []
    skillsStore.resetSelection()
    skillsStore.addSelected(userSkills)
    analytics.sendEvent('skills_goals_screen_open')
    industriesStore.analyticsSender = analytics
    return () => (industriesStore.analyticsSender = undefined)
  }, [storage.currentUser])

  const onNextPress = async () => {
    const selectedIndustries = Array.from(industriesStore.selected.values())
    const selectedSkills = Array.from(skillsStore.selected.values())
    const selectedGoals = Array.from(goalsStore.selected.values())
    if (
      industriesStore.selected.size === 0 &&
      skillsStore.selected.size === 0 &&
      goalsStore.selected.size === 0
    ) {
      analytics.sendEvent('skills_goals_skip_click')
    } else {
      const industries = JSON.stringify(selectedIndustries)
      const skills = JSON.stringify(selectedSkills)
      const goals = JSON.stringify(selectedGoals)
      analytics.sendEvent('skills_goals_find_people_click', {
        industries_list: industries,
        skills_list: skills,
        goals_list: goals,
      })
    }
    showLoading()
    await industriesStore.updateUserIndustries()
    await storage.updateIndustries(selectedIndustries)
    await goalsStore.updateUserGoals()
    await storage.updateGoals(selectedGoals)
    const response = await api.fetchSimilarRecommendations()
    hideLoading()
    if (response.data && response.data.items.length > 0) {
      return navigation.navigate('FindPeopleScreen', {data: response.data})
    }

    if (Platform.OS === 'android') return await makeUserVerified()
    if (await requestNotificationPermissions()) {
      return await makeUserVerified()
    }
    navigation.navigate('RequestPermissionNotificationsScreen')
  }

  return (
    <BaseWelcomeLayout style={styles.paddingHorizontal}>
      <View style={commonStyles.wizardContentWrapper}>
        <View style={{width: '100%'}}>
          <AppText style={[styles.title, {color: colors.secondaryBodyText}]}>
            {t('selectSkillsGoalsTitle')}
          </AppText>
          <Spacer vertical={28} />
          <SettingsSkillsGoalsList />
          <Spacer vertical={28} />
        </View>
      </View>

      <PrimaryButton
        onPress={onNextPress}
        style={commonStyles.wizardPrimaryButton}
        title={
          industriesStore.selected.size === 0 &&
          skillsStore.selected.size === 0 &&
          goalsStore.selected.size === 0
            ? t('skipButton')
            : t('nextButton')
        }
      />
    </BaseWelcomeLayout>
  )
}

export default observer(RegistrationIndustriesSkillsGoalsScreen)
const styles = StyleSheet.create({
  base: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
  paddingHorizontal: {
    paddingHorizontal: ms(16),
  },
  title: {
    width: '100%',
    fontSize: ms(24),
    textAlign: 'center',
    fontWeight: 'bold',
    ...commonStyles.paddingHorizontal,
  },
})

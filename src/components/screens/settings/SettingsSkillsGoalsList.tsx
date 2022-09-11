import {useNavigation} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {storage} from '../../../storage'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Horizontal from '../../common/Horizontal'
import Vertical from '../../common/Vertical'

const SettingsSkillsGoalsList: React.FC = () => {
  const {colors} = useTheme()
  const {t} = useTranslation()
  const navigation = useNavigation()
  const border = {borderBottomColor: colors.separator, borderBottomWidth: 1}
  const color = {color: colors.bodyText}
  const muted = {color: colors.secondaryBodyText}

  return (
    <Vertical style={styles.base}>
      <AppTouchableOpacity
        style={[styles.listItem, border]}
        onPress={() =>
          navigation.navigate('SettingsSelectIndustriesScreen', {})
        }>
        <AppText style={[styles.title, color]}>
          {t('selectSkillsGoalsIndustries')}
        </AppText>
        <Horizontal style={styles.rightPart}>
          <AppText style={[styles.title, muted, styles.counter]}>
            {storage.currentUser?.industries?.length ?? 0}
          </AppText>
          <AppIcon type={'icArrowRight'} />
        </Horizontal>
      </AppTouchableOpacity>

      <AppTouchableOpacity
        style={[styles.listItem, border]}
        onPress={() =>
          navigation.navigate('SettingsSelectSkillsScreen', {
            navigationRoot: 'SettingsSelectSkillsScreen',
          })
        }>
        <AppText style={[styles.title, color]}>
          {t('selectSkillsGoalsSkills')}
        </AppText>
        <Horizontal style={styles.rightPart}>
          <AppText style={[styles.title, muted, styles.counter]}>
            {storage.currentUser?.skills?.length ?? 0}
          </AppText>
          <AppIcon type={'icArrowRight'} />
        </Horizontal>
      </AppTouchableOpacity>

      <AppTouchableOpacity
        style={styles.listItem}
        onPress={() => navigation.navigate('SettingsSelectGoalsScreen', {})}>
        <AppText style={[styles.title, color]}>
          {t('selectSkillsGoalsGoals')}
        </AppText>
        <Horizontal style={styles.rightPart}>
          <AppText style={[styles.title, muted, styles.counter]}>
            {storage.currentUser?.goals?.length ?? 0}
          </AppText>
          <AppIcon type={'icArrowRight'} />
        </Horizontal>
      </AppTouchableOpacity>
    </Vertical>
  )
}

export default observer(SettingsSkillsGoalsList)

const styles = StyleSheet.create({
  base: {
    backgroundColor: '#fff',
    borderRadius: ms(8),
    paddingHorizontal: ms(16),
  },

  title: {
    fontSize: ms(17),
    flex: 1,
  },

  rightPart: {
    justifyContent: 'flex-end',
    width: ms(50),
  },

  counter: {
    textAlign: 'right',
  },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: ms(48),
  },
})

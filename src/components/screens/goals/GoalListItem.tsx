import {observer} from 'mobx-react'
import React, {useCallback, useContext} from 'react'
import {StyleSheet} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {GoalModel} from '../../../models'
import GoalsStore from '../../../stores/GoalsStore'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  readonly goal: GoalModel
  readonly isSelected?: boolean
  readonly onToggle?: (goal: GoalModel) => void
}

const GoalListItem: React.FC<Props> = (p) => {
  const store = useContext(GoalsStore)
  const isSelected = p.isSelected ?? store.selected.has(p.goal.id)
  const {colors} = useTheme()
  const border = {borderBottomColor: colors.separator, borderBottomWidth: 1}

  const onPress = useCallback(async () => {
    if (p.onToggle) {
      p.onToggle(p.goal)
    } else {
      await store.onToggleSelect(p.goal)
    }
  }, [p.onToggle, p.goal])

  return (
    <AppTouchableOpacity style={[styles.listItem, border]} onPress={onPress}>
      <AppText style={[styles.listItemText]}>{p.goal.name}</AppText>
      {isSelected && <AppIcon type={'icCheck'} tint={colors.thirdIcons} />}
    </AppTouchableOpacity>
  )
}

export default observer(GoalListItem)

const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: ms(48),
  },

  listItemText: {
    fontWeight: '400',
    fontSize: ms(17),
    lineHeight: ms(40),
    color: 'rgba(0,0,0, 0.87)',
    textTransform: 'capitalize',
  },
})

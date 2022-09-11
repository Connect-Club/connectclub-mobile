import {observer} from 'mobx-react'
import React, {useCallback, useContext} from 'react'
import {StyleProp, StyleSheet, TextStyle, View, ViewStyle} from 'react-native'

import {SkillModel} from '../../../models'
import SkillsStore from '../../../stores/SkillsStore'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  readonly skill: SkillModel
  readonly inverted?: boolean
  readonly isSelectable?: boolean
  readonly isSelected?: boolean
  readonly onToggle?: (skill: SkillModel) => void
  readonly textStyle?: TextStyle
  readonly itemStyle?: StyleProp<ViewStyle>
  readonly onLayoutWidth?: (width: number) => void
}

const SkillListItem: React.FC<Props> = (p) => {
  const store = useContext(SkillsStore)
  const isSelected = p.isSelected ?? store.selected.has(p.skill.id)
  const {colors} = useTheme()
  const background: ViewStyle = {
    backgroundColor: isSelected ? colors.accentPrimary : colors.textPrimary,
    borderWidth: ms(1),
    borderColor: 'transparent',
  }

  const textColor: TextStyle = {
    color: isSelected ? colors.textPrimary : colors.bodyText,
  }

  if (p.inverted && !isSelected) {
    background.borderColor = colors.separator
    background.backgroundColor = 'transparent'
  }

  const RootComponent = p.isSelectable ?? true ? AppTouchableOpacity : View
  const onPress = useCallback(async () => {
    if (p.onToggle) {
      p.onToggle(p.skill)
    } else {
      await store.onToggleSelect(p.skill)
    }
  }, [p.onToggle, p.skill])

  return (
    <RootComponent
      activeOpacity={0.9}
      onLayout={
        p.onLayoutWidth
          ? (e) => p.onLayoutWidth?.(e.nativeEvent.layout.width)
          : undefined
      }
      onPress={onPress}
      style={[styles.listItem, background, p.itemStyle]}>
      <AppText style={[styles.listItemText, textColor, p.textStyle]}>
        {p.skill.name}
      </AppText>
    </RootComponent>
  )
}

export default observer(SkillListItem)

const styles = StyleSheet.create({
  listItem: {
    paddingHorizontal: ms(12),
    height: ms(32),
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: ms(8),
    borderRadius: ms(32) / 2,
  },

  listItemText: {
    fontWeight: '500',
    fontSize: ms(13),
  },
})

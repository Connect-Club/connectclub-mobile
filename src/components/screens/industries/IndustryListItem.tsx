import {observer} from 'mobx-react'
import React, {useCallback, useContext} from 'react'
import {StyleSheet} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {IndustryModel} from '../../../models'
import IndustriesStore from '../../../stores/IndustriesStore'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  readonly industry: IndustryModel
  readonly isSelected?: boolean
  readonly onToggle?: (industry: IndustryModel) => void
}

const IndustryListItem: React.FC<Props> = (p) => {
  const store = useContext(IndustriesStore)
  const isSelected = p.isSelected ?? store.selected.has(p.industry.id)
  const {colors} = useTheme()
  const border = {borderBottomColor: colors.separator, borderBottomWidth: 1}
  const color = {color: colors.bodyText}

  const onPress = useCallback(async () => {
    if (p.onToggle) {
      p.onToggle(p.industry)
    } else {
      await store.onToggleSelect(p.industry)
    }
  }, [p.onToggle, p.industry])

  return (
    <AppTouchableOpacity style={[styles.listItem, border]} onPress={onPress}>
      <AppText style={[styles.listItemText, color]}>{p.industry.name}</AppText>
      {isSelected && <AppIcon type={'icCheck'} tint={colors.thirdIcons} />}
    </AppTouchableOpacity>
  )
}

export default observer(IndustryListItem)

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
  },
})

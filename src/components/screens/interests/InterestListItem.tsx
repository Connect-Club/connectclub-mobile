import {observer} from 'mobx-react'
import React, {useCallback, useContext} from 'react'
import {StyleProp, StyleSheet, TextStyle, View, ViewStyle} from 'react-native'

import {InterestModel} from '../../../models'
import InterestsStore from '../../../stores/InterestsStore'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {toastHelper} from '../../../utils/ToastHelper'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  readonly interest: InterestModel
  readonly isBigStyle: boolean
  readonly inverted?: boolean
  readonly isSelectable?: boolean
  readonly isSelected?: boolean
  readonly onToggle?: (interest: InterestModel) => void
  readonly textStyle?: TextStyle
  readonly itemStyle?: StyleProp<ViewStyle>
  readonly onLayoutWidth?: (width: number) => void
}

const InterestListItem: React.FC<Props> = ({
  interest,
  isBigStyle = false,
  inverted,
  isSelected,
  isSelectable,
  onToggle,
  textStyle,
  itemStyle,
  onLayoutWidth,
}) => {
  const store = useContext(InterestsStore)
  const selected = isSelected ?? store.selected.has(interest.id)
  const {colors} = useTheme()
  const background: ViewStyle = {
    backgroundColor: selected ? colors.inactiveAccentColor : colors.textPrimary,
    borderWidth: ms(1),
    borderColor: 'transparent',
  }

  const textColor: TextStyle = {
    color: colors.bodyText,
    fontSize: isBigStyle ? ms(18) : ms(13),
  }

  if (inverted && !selected) {
    background.borderColor = colors.separator
    background.backgroundColor = 'transparent'
  }
  background.paddingHorizontal = isBigStyle ? ms(20) : ms(12)
  background.height = isBigStyle ? ms(44) : ms(32)
  background.borderRadius = isBigStyle ? ms(100) : ms(16)

  const RootComponent = isSelectable ?? true ? AppTouchableOpacity : View

  const onPress = useCallback(async () => {
    if (onToggle) {
      onToggle(interest)
    } else {
      const result = await store.onToggleSelect(interest)
      if (result === 'limit') return toastHelper.interestsLimit()
    }
  }, [onToggle, interest])

  return (
    <RootComponent
      activeOpacity={0.9}
      onLayout={
        onLayoutWidth
          ? (e) => onLayoutWidth?.(e.nativeEvent.layout.width)
          : undefined
      }
      onPress={onPress}
      style={[styles.listItem, background, itemStyle]}>
      <AppText style={[styles.listItemText, textColor, textStyle]}>
        {interest.name}
      </AppText>
    </RootComponent>
  )
}

export default observer(InterestListItem)

const styles = StyleSheet.create({
  listItem: {
    paddingHorizontal: ms(12),
    height: ms(32),
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: ms(8),
  },

  listItemText: {
    fontWeight: '500',
  },
})

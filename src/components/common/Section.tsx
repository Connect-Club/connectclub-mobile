import React, {memo} from 'react'
import {StyleProp, StyleSheet, TextStyle, ViewStyle} from 'react-native'

import {makeTextStyle, useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import AppText from './AppText'
import AppTouchableOpacity from './AppTouchableOpacity'

interface Props {
  readonly title: string
  readonly count?: number
  readonly style?: StyleProp<ViewStyle>
  readonly titleStyle?: StyleProp<TextStyle>
  readonly onPress?: () => void
}

const Section: React.FC<Props> = ({
  title,
  count,
  style,
  titleStyle,
  onPress,
}) => {
  const {colors} = useTheme()

  const counterStyle: StyleProp<TextStyle> = {color: colors.thirdBlack}
  const titleColorStyle: StyleProp<TextStyle> = {
    color: onPress ? colors.primaryClickable : colors.thirdBlack,
  }

  return (
    <AppTouchableOpacity
      style={[styles.titleContainer, style]}
      onPress={() => onPress?.()}>
      <AppText style={[styles.sectionTitle, titleColorStyle, titleStyle]}>
        {title}
      </AppText>
      {count && (
        <AppText style={[styles.sectionCounter, counterStyle]}>{count}</AppText>
      )}
    </AppTouchableOpacity>
  )
}

export default memo(Section)

const styles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    marginTop: ms(18),
    marginBottom: ms(10),
    flexDirection: 'row',
  },
  sectionTitle: {
    ...makeTextStyle(ms(11), ms(14.3), 'bold'),
  },
  sectionCounter: {
    marginStart: ms(8),
    ...makeTextStyle(ms(11), ms(14.3), 'normal'),
  },
})

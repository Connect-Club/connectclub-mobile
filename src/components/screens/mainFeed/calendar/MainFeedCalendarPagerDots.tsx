import React from 'react'
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native'

import {useTheme} from '../../../../theme/appTheme'
import {ms} from '../../../../utils/layout.utils'

interface Props {
  readonly count: number
  readonly selected: number
}

const MainFeedCalendarPagerDots: React.FC<Props> = (props) => {
  const {colors} = useTheme()

  return (
    <View style={styles.base}>
      {[...Array(props.count)].map((_, i) => {
        const style: StyleProp<ViewStyle> = [styles.circle]
        if (i !== props.count - 1) style.push({marginEnd: ms(12)})
        if (i !== props.selected) {
          style.push({backgroundColor: colors.inactiveAccentColor})
        } else {
          style.push({backgroundColor: colors.accentPrimary})
        }
        return (
          <View accessibilityLabel={'calendarItemDot'} style={style} key={i} />
        )
      })}
    </View>
  )
}

export default MainFeedCalendarPagerDots

const styles = StyleSheet.create({
  base: {
    width: '100%',
    height: ms(8),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: ms(16),
  },

  circle: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(8) / 2,
  },
})

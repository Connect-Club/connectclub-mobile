import React, {useMemo} from 'react'
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native'

import AppIcon from '../../assets/AppIcon'
import {useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'

interface Props {
  readonly style?: StyleProp<ViewStyle>
  readonly size?: number
  readonly isChecked?: boolean
}

const Checked: React.FC<Props> = ({style, size = 32, isChecked = true}) => {
  const {colors} = useTheme()

  const {checkedStyle, uncheckedStyle} = useMemo<{
    [key: string]: StyleProp<ViewStyle>
  }>(
    () => ({
      checkedStyle: {
        width: size - ms(4),
        height: size - ms(4),
        backgroundColor: colors.accentPrimary,
      },
      uncheckedStyle: {
        width: size - ms(4),
        height: size - ms(4),
        borderRadius: 1000,
        borderWidth: ms(2),
        borderColor: colors.thirdIcons,
      },
    }),
    [],
  )

  return (
    <View style={[style, styles.container]}>
      <View style={[styles.base, isChecked ? checkedStyle : uncheckedStyle]}>
        {isChecked && (
          <AppIcon
            tint={'white'}
            type={'icCheck'}
            style={{transform: [{scale: ((size - 8) * 0.4) / 10}]}}
          />
        )}
      </View>
    </View>
  )
}

export default Checked

const styles = StyleSheet.create({
  container: {
    padding: ms(4),
    backgroundColor: 'white',
    borderRadius: ms(1000),
  },
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(1000),
    padding: ms(4),
  },
})

import React, {memo, useMemo} from 'react'
import {StyleSheet, ViewProps} from 'react-native'

import {useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import {LinearGradient} from '../webSafeImports/webSafeImports'

const TopGradientView: React.FC<ViewProps & {children: React.ReactNode}> = (
  props,
) => {
  const {colors} = useTheme()

  const gColors = useMemo(
    () => [colors.systemBackground, colors.bottomGradient],
    [],
  )

  const containerStyle = props.style
    ? [styles.gradientView, props.style]
    : styles.gradientView

  return (
    <LinearGradient
      style={containerStyle}
      onLayout={props.onLayout}
      colors={gColors}
      locations={[0.6, 1]}>
      {props.children}
    </LinearGradient>
  )
}

export default memo(TopGradientView)

const styles = StyleSheet.create({
  gradientView: {
    zIndex: 3,
    height: ms(51),
  },
})

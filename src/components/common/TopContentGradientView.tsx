import React, {memo} from 'react'
import {StyleSheet, ViewProps} from 'react-native'

import {useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import {LinearGradient} from '../webSafeImports/webSafeImports'

interface Props extends ViewProps {
  children?: React.ReactNode
  gradientStart?: number
}

const TopContentGradientView: React.FC<Props> = (props) => {
  const {colors} = useTheme()

  const gColors = [colors.systemBackground, colors.bottomGradient]

  const containerStyle = props.style
    ? [styles.gradientView, props.style]
    : styles.gradientView

  return (
    <>
      {props.children}
      <LinearGradient
        style={containerStyle}
        onLayout={props.onLayout}
        colors={gColors}
        locations={[props.gradientStart ?? 0, 1]}
      />
    </>
  )
}

export default memo(TopContentGradientView)

const styles = StyleSheet.create({
  gradientView: {
    marginTop: ms(-3),
    borderWidth: 0,
    paddingTop: 0,
    height: ms(30),
    position: 'absolute',
    top: 0,
  },
})

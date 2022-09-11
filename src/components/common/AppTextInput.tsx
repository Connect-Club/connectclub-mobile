import React, {forwardRef} from 'react'
import {Platform, StyleSheet, TextInput, TextInputProps} from 'react-native'

import {useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'

interface Props extends TextInputProps {}

const AppTextInput = forwardRef<TextInput, Props>((props, ref) => {
  const {colors} = useTheme()

  return (
    <TextInput
      allowFontScaling={false}
      ref={ref}
      {...props}
      style={[
        styles.textInput,
        {backgroundColor: colors.floatingBackground},
        props.style,
      ]}
    />
  )
})

export default AppTextInput

const styles = StyleSheet.create({
  textInput: {
    width: '100%',
    minHeight: ms(42),
    paddingHorizontal: ms(8),
    borderRadius: ms(6),
    ...Platform.select({
      web: {
        minHeight: ms(12),
        outlineStyle: 'none',
      },
    }),
  },
})

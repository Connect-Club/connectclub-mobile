import React from 'react'
import {StyleSheet, Text, TextProps} from 'react-native'

const AppText: React.FC<TextProps> = (props) => {
  return (
    <Text
      {...props}
      allowFontScaling={false}
      style={[props.style, styles.defaultFont]}
    />
  )
}

export default AppText

const styles = StyleSheet.create({
  defaultFont: {
    fontFamily: 'System',
  },
})

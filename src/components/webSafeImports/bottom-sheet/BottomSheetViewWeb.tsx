import React from 'react'
import {StyleSheet, View} from 'react-native'

interface Props {}

const BottomSheetViewWeb: React.FC<Props> = ({children}) => {
  return <View style={styles.container}>{children}</View>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
})

export default BottomSheetViewWeb

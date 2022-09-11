import {BottomSheetBackdropProps} from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop'
import React, {memo} from 'react'
import {StyleSheet, View} from 'react-native'

interface Props extends BottomSheetBackdropProps {
  appearsOnIndex?: number
  disappearsOnIndex?: number
  pressBehavior?: string
}

const BottomSheetBackdropWeb: React.FC<Props> = ({children}) => {
  return (
    <View style={[StyleSheet.absoluteFill, styles.backdrop]}>{children}</View>
  )
}

export default memo(BottomSheetBackdropWeb)

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
})

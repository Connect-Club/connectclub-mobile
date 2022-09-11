import {useNavigation} from '@react-navigation/native'
import React, {memo, useCallback} from 'react'
import {Platform, StyleProp, StyleSheet, ViewStyle} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {ms} from '../../../utils/layout.utils'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  style?: StyleProp<ViewStyle>
  onClosePress?: () => void
}

const CloseButton: React.FC<Props> = ({style, onClosePress}) => {
  const navigation = useNavigation()
  const onPress = useCallback(() => {
    if (onClosePress) return onClosePress()
    navigation.goBack()
  }, [onClosePress])

  return (
    <AppTouchableOpacity style={[styles.closeButton, style]} onPress={onPress}>
      <AppIcon
        tint={Platform.OS !== 'web' ? 'white' : 'black'}
        type={
          Platform.OS !== 'web' ? 'icNavigationClose' : 'icNavigationClose16'
        }
      />
    </AppTouchableOpacity>
  )
}

export default memo(CloseButton)

const styles = StyleSheet.create({
  closeButton: {
    ...Platform.select({
      web: {
        backgroundColor: '#F0F0F0',
        borderRadius: ms(16),
        borderWidth: 0,
        padding: ms(8),
      },
    }),
  },
})

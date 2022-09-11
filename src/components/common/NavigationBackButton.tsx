import {useNavigation} from '@react-navigation/native'
import React, {useCallback} from 'react'
import {StyleSheet, ViewProps} from 'react-native'

import AppIcon from '../../assets/AppIcon'
import {ms} from '../../utils/layout.utils'
import AppTouchableOpacity from './AppTouchableOpacity'
import {clearWindowFocus} from './DecorConfigModule'

interface Props {
  readonly onPress: () => void
}

export const NavigationBackButton: React.FC<Props & ViewProps> = (props) => {
  const navigation = useNavigation()
  const onPressInternal = useCallback(() => {
    clearWindowFocus()
    props.onPress()
  }, [])
  if (!navigation.canGoBack()) return null

  return (
    <AppTouchableOpacity
      accessibilityLabel={'goBackButton'}
      style={[props.style, styles.clickable]}
      onPress={onPressInternal}>
      <AppIcon type={'icNavigationBack'} />
    </AppTouchableOpacity>
  )
}

const styles = StyleSheet.create({
  clickable: {
    paddingStart: ms(8),
  },
})

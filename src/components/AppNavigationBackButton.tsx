import React from 'react'
import {TouchableOpacity} from 'react-native'

import AppIcon from '../assets/AppIcon'
import {commonStyles} from '../theme/appTheme'

interface Props {
  readonly marginStart?: number
  readonly onPress: () => void
}

export const AppNavigationBackButton: React.FC<Props> = ({
  onPress,
  marginStart,
}) => {
  return (
    <TouchableOpacity
      accessibilityLabel={'navigation-back'}
      activeOpacity={0.8}
      style={[commonStyles.navigationButton, {marginStart: marginStart ?? 8}]}
      onPress={onPress}>
      <AppIcon type={'icNavigationBack'} />
    </TouchableOpacity>
  )
}

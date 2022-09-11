import React, {memo} from 'react'
import {StyleSheet} from 'react-native'

import AppIcon, {AppIconType} from '../../../assets/AppIcon'
import {ms} from '../../../utils/layout.utils'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  readonly onPress?: () => void
  readonly icon: AppIconType
  readonly tint?: string
  readonly accessibilityLabel?: string
}

const NavigationIconButton: React.FC<Props> = ({
  onPress,
  icon,
  tint,
  accessibilityLabel,
}) => {
  return (
    <AppTouchableOpacity
      style={styles.button}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}>
      <AppIcon type={icon} tint={tint} />
    </AppTouchableOpacity>
  )
}

export default memo(NavigationIconButton)

const styles = StyleSheet.create({
  button: {
    width: ms(42),
    height: ms(42),
    alignItems: 'center',
    justifyContent: 'center',
  },
})

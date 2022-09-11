import {observer} from 'mobx-react'
import React, {useState} from 'react'
import {Platform, StyleSheet, Switch, View} from 'react-native'

import {useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import AppText from './AppText'
import AppTouchableOpacity from './AppTouchableOpacity'

interface SwitchProps {
  readonly initialState: boolean
  readonly onSwitch: (enabled: boolean) => boolean
  readonly title: string
  readonly disabled?: boolean
}

const AppSwitchButton: React.FC<SwitchProps> = (p) => {
  const {colors} = useTheme()
  const [enabled, setEnabled] = useState(p.initialState)

  const onSwitchChange = () => {
    if (p.disabled) return
    const canSwitch = p.onSwitch(enabled)
    if (!canSwitch) return
    setEnabled(!enabled)
  }

  const thumbColor =
    Platform.OS === 'ios'
      ? undefined
      : enabled
      ? colors.accentPrimary
      : colors.systemBackground

  const trackColor = {
    false: p.disabled
      ? '#FAFAFA'
      : Platform.OS === 'android'
      ? colors.supportBodyText
      : '#767577',
    true:
      Platform.OS === 'android'
        ? 'rgba(77, 125, 208, 0.5)'
        : colors.accentPrimary,
  }

  return (
    <AppTouchableOpacity
      style={[styles.base, {backgroundColor: colors.floatingBackground}]}
      onPress={onSwitchChange}>
      <AppText style={[styles.title, {color: colors.bodyText}]}>
        {p.title}
      </AppText>
      <View pointerEvents={'none'}>
        <Switch
          disabled={p.disabled}
          thumbColor={thumbColor}
          trackColor={trackColor}
          value={enabled}
        />
      </View>
    </AppTouchableOpacity>
  )
}

export default observer(AppSwitchButton)

const styles = StyleSheet.create({
  base: {
    borderRadius: ms(8),
    paddingHorizontal: ms(16),
    height: ms(48),
    flexDirection: 'row',
    alignItems: 'center',
  },

  title: {
    fontSize: ms(17),
    flex: 1,
  },
})

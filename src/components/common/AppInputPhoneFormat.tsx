// @ts-ignore
import emoji from 'country-flag-emoji'
import React from 'react'
import {StyleSheet} from 'react-native'

import {analytics} from '../../Analytics'
import {useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import AppText from './AppText'
import AppTouchableOpacity from './AppTouchableOpacity'

interface Props {
  readonly selectedCode: string
  readonly selectedPrefix: string
  readonly onChoosePress: () => void
}

const AppInputPhoneFormat: React.FC<Props> = ({
  selectedCode,
  selectedPrefix,
  onChoosePress,
}) => {
  const {colors} = useTheme()

  const flag = emoji.get(selectedCode.toLowerCase())?.emoji
  const prefix = `+${selectedPrefix ?? 0}`

  return (
    <AppTouchableOpacity
      style={[styles.textInput]}
      activeOpacity={0.4}
      accessibilityLabel={'inputPhoneCode'}
      onPress={() => {
        analytics.sendEvent('phone_country_select_click')
        onChoosePress()
      }}>
      <AppText style={[styles.text, {color: colors.bodyText}]}>
        {flag} {prefix}
      </AppText>
    </AppTouchableOpacity>
  )
}

export default AppInputPhoneFormat

const styles = StyleSheet.create({
  textInput: {
    height: ms(56),
    justifyContent: 'center',
    paddingStart: ms(8),
  },

  text: {
    fontSize: ms(24),
  },
})

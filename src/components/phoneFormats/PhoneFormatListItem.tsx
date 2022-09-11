// @ts-ignore
import emoji from 'country-flag-emoji'
import React from 'react'
import {StyleSheet, ViewStyle} from 'react-native'

import AppIcon from '../../assets/AppIcon'
import {useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import AppText from '../common/AppText'
import AppTouchableOpacity from '../common/AppTouchableOpacity'
import Horizontal from '../common/Horizontal'

interface Props {
  readonly code: string
  readonly number: string
  readonly isSelected: boolean
  readonly onSelect: () => void
  readonly showBottomBorder?: boolean
}

const PhoneFormatListItem: React.FC<Props> = ({
  code,
  number,
  onSelect,
  isSelected,
  showBottomBorder,
}) => {
  const {colors} = useTheme()
  const flag = emoji.get(code.toLowerCase())?.emoji

  const borderStyle: ViewStyle = {
    borderBottomWidth: showBottomBorder ? ms(1) : undefined,
    borderBottomColor: showBottomBorder ? colors.separator : undefined,
  }

  return (
    <AppTouchableOpacity onPress={onSelect}>
      <Horizontal style={[styles.base, borderStyle]}>
        <AppText style={[styles.text, {color: colors.bodyText}]}>
          {flag} {`${code} +${number}`}
        </AppText>
        {isSelected && <AppIcon type={'icCheckTwo'} tint={colors.bodyText} />}
      </Horizontal>
    </AppTouchableOpacity>
  )
}

export default PhoneFormatListItem

const styles = StyleSheet.create({
  base: {
    height: ms(56),
    marginHorizontal: ms(16),
    alignItems: 'center',
  },

  text: {
    flex: 1,
  },

  flag: {
    width: ms(24),
    height: ms(18),
  },
})

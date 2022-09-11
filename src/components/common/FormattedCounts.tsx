import React, {memo} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleProp, TextStyle} from 'react-native'

import {abbreviate} from '../../utils/abbreviate'
import AppText from './AppText'

interface Props {
  readonly count: number
  readonly style?: StyleProp<TextStyle>
}

const FormattedCounts: React.FC<Props> = ({count, style}) => {
  const {t} = useTranslation()
  return <AppText style={style}>{abbreviate(count, t)}</AppText>
}

export default memo(FormattedCounts)

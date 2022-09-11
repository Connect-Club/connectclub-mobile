import React from 'react'
import {StyleSheet, ViewProps} from 'react-native'

import {useTheme} from '../../../theme/appTheme'
import {timeAgo} from '../../../utils/date.utils'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'

interface Props {
  readonly createdAt: number
}

const CreatedAtView: React.FC<Props & ViewProps> = (props) => {
  const {colors} = useTheme()

  const textStyle = [
    styles.createdAtText,
    props.style,
    {color: colors.supportBodyText},
  ]

  const formattedDate = timeAgo(props.createdAt).replace('now ago', 'now')

  return <AppText style={textStyle}>{formattedDate}</AppText>
}

export default CreatedAtView

const styles = StyleSheet.create({
  createdAtText: {
    alignSelf: 'flex-start',
    fontSize: ms(8),
    fontWeight: '500',
  },
})

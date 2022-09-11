import React from 'react'
import {StyleProp, TextStyle} from 'react-native'

import {useTheme} from '../../theme/appTheme'
import {getEventDate} from '../../utils/date.utils'
import AppText from './AppText'

interface Props {
  readonly time: number
  readonly style?: StyleProp<TextStyle>
}

const EventTimeView: React.FC<Props> = ({time, style}) => {
  const {colors} = useTheme()

  return (
    <AppText style={[{color: colors.secondaryBodyText}, style]}>
      {getEventDate(time)}
    </AppText>
  )
}

export default EventTimeView

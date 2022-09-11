import React, {memo} from 'react'
import {View} from 'react-native'

import {commonStyles} from '../../theme/appTheme'

interface Props {
  readonly pointerEvent?: 'box-none' | 'none' | 'box-only' | 'auto'
}

const FlexSpace: React.FC<Props> = (props) => {
  return (
    <View style={commonStyles.flexOne} pointerEvents={props.pointerEvent} />
  )
}

export default memo(FlexSpace)

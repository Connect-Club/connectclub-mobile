import React from 'react'
import {View, ViewStyle} from 'react-native'

import AppIcon, {AppIconProps} from '../../assets/AppIcon'
import {RasterIconType} from '../../assets/rasterIcons'
import {ms} from '../../utils/layout.utils'
import UserBadgeView from '../screens/room/UserBadgeView'

interface Props extends AppIconProps {
  readonly icon?: RasterIconType
  readonly badgeStyle?: ViewStyle
  readonly containerStyle?: ViewStyle
  readonly scale?: number
  readonly offset?: number
  readonly size?: number
}

const AppIconWithBadge: React.FC<Props> = (props) => {
  const scale = props.scale ?? 0.55
  const offset = props.offset ?? ms(22)
  return (
    <View style={props.containerStyle}>
      <AppIcon {...props} />
      {props.icon && (
        <UserBadgeView
          parentSize={props.size ?? 0}
          scale={scale}
          icon={props.icon}
          offset={offset}
          style={props.badgeStyle}
        />
      )}
    </View>
  )
}

export default AppIconWithBadge

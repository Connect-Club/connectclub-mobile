import React from 'react'
import {ImageStyle, StyleProp, View, ViewStyle} from 'react-native'

import {RasterIconType} from '../../assets/rasterIcons'
import {Unknown} from '../../models'
import {ms} from '../../utils/layout.utils'
import UserBadgeView from '../screens/room/UserBadgeView'
import AppAvatar from './AppAvatar'

interface Props {
  readonly icon?: RasterIconType
  readonly isSelf?: boolean
  readonly avatar: string | Unknown
  readonly shortName: string
  readonly containerStyle?: ViewStyle
  readonly style?: StyleProp<ImageStyle>
  readonly size?: number
  readonly background?: string
  readonly borderColor?: string
  readonly fontSize?: number
  readonly scale?: number
  readonly offset?: number
  readonly badgeStyle?: ViewStyle
}

const AppAvatarWithBadge: React.FC<Props> = (props) => {
  const scale = props.scale ?? 0.55
  const offset = props.offset ?? ms(22)
  return (
    <View style={props.containerStyle}>
      <AppAvatar {...props} />
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

export default AppAvatarWithBadge

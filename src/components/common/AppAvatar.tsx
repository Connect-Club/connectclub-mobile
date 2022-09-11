import React, {memo} from 'react'
import {ImageStyle, StyleProp, StyleSheet, Text, View} from 'react-native'

import {Unknown} from '../../models'
import {useTheme} from '../../theme/appTheme'
import {setSizeForAvatar} from '../../utils/avatar.utils'
import {ms} from '../../utils/layout.utils'
import {FastImage} from '../webSafeImports/webSafeImports'

interface Props {
  readonly isSelf?: boolean
  readonly avatar: string | Unknown
  readonly shortName: string
  readonly style?: StyleProp<ImageStyle>
  readonly size?: number
  readonly background?: string
  readonly borderColor?: string
  readonly fontSize?: number
}

const AppAvatar: React.FC<Props> = (props) => {
  const {colors} = useTheme()
  if (props.isSelf) return null

  const borderWidth = props.borderColor ? ms(2) : ms(1)
  const avatarSize = props.size
    ? (1 + (2 * borderWidth) / props.size) * 100
    : 102.4

  const avatarStyles: StyleProp<ImageStyle> = {
    width: avatarSize.toString() + '%',
    height: avatarSize.toString() + '%',
    top: -borderWidth,
    start: -borderWidth,
  }

  const viewStyles: StyleProp<ImageStyle> = [
    {
      width: props.size,
      height: props.size,
      borderRadius: ms(1000),
      borderWidth: borderWidth,
      borderColor: props.borderColor ?? colors.inactiveAccentColor,
      overflow: 'hidden',
      backgroundColor: props.background ?? colors.skeleton,
    },
  ]

  if (props.style) viewStyles.push(props.style)

  if (!props.avatar) {
    return (
      <View style={[viewStyles, styles.textContainer]}>
        <Text
          style={{
            fontSize: props.fontSize ?? (props.size ?? ms(32)) / 3,
            fontWeight: (props.size ?? 100) > 101 ? '400' : 'bold',
            color: colors.secondaryBodyText,
          }}>
          {props.shortName.toUpperCase()}
        </Text>
      </View>
    )
  }

  const uri = setSizeForAvatar(props.avatar ?? '', 300, 300)
  return (
    <View style={viewStyles}>
      <FastImage
        source={{uri: uri, priority: 'high'}}
        //@ts-ignore
        style={avatarStyles}
      />
    </View>
  )
}

const checker = (prev: Props, next: Props): boolean => {
  if (prev.avatar !== next.avatar) return false
  return !(!prev.avatar && !next.avatar && prev.shortName !== next.shortName)
}
export default memo(AppAvatar, checker)

const styles = StyleSheet.create({
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})

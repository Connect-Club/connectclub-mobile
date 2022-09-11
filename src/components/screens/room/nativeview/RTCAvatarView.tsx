import React from 'react'
import {
  requireNativeComponent,
  StyleProp,
  ViewProps,
  ViewStyle,
} from 'react-native'

import {Unknown} from '../../../../models'

/**
 * default - always render avatar initials
 * auto - (android only) hide initials once avatar image is loaded
 */
export type AvatarInitialsMode = 'default' | 'auto'

interface NativeProps {
  readonly style?: StyleProp<ViewStyle>
  readonly avatar: string | Unknown
  readonly initials: string
  readonly fontSize?: number
  readonly initialsMode?: AvatarInitialsMode
}

const RTCAvatarView = requireNativeComponent<typeof AvatarView>('AvatarView')

type RTCAvatarViewProps = ViewProps & NativeProps

const AvatarView: React.FC<RTCAvatarViewProps> = (props) => {
  return (
    <RTCAvatarView
      accessibilityLabel='avatar-view'
      {...props}
      //@ts-ignore
      initialsMode={props.initialsMode ?? 'auto'}
    />
  )
}

export default AvatarView

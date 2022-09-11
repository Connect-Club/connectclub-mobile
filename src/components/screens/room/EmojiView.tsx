import {LottieView} from '../../webSafeImports/webSafeImports'
import React, {memo} from 'react'
import {ImageStyle, StyleProp} from 'react-native'

import {EmojiType} from './models/jsonModels'

interface Props {
  readonly type?: EmojiType
  readonly style?: StyleProp<ImageStyle>
}

const getSource = (emojiType?: EmojiType) => {
  switch (emojiType) {
    case EmojiType.heart:
      return require('../../../assets/reactions/heart.json')
    case EmojiType.laugh:
      return require('../../../assets/reactions/laugh.json')
    case EmojiType.like:
      return require('../../../assets/reactions/like.json')
    case EmojiType.sad:
      return require('../../../assets/reactions/sad.json')
    case EmojiType.wave:
      return require('../../../assets/reactions/wave.json')
    case EmojiType.dislike:
      return require('../../../assets/reactions/dislike.json')
    case EmojiType.hung:
      return require('../../../assets/reactions/hung.json')
    case EmojiType.raise:
      return require('../../../assets/reactions/raise.json')
    case EmojiType.surprise:
      return require('../../../assets/reactions/surprise.json')
    case EmojiType.think:
      return require('../../../assets/reactions/think.json')
    default:
      return null
  }
}

const EmojiView: React.FC<Props> = (props) => {
  const source = getSource(props.type)
  if (!source) return null
  return <LottieView style={props.style} source={source} autoPlay loop />
}

export default memo(EmojiView)

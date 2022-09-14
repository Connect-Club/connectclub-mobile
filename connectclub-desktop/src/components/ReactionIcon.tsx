import React from 'react'
import {StyleSheet, View} from 'react-native'

import EmojiView from '../../../src/components/screens/room/EmojiView'
import {EmojiType} from '../../../src/components/screens/room/models/jsonModels'

interface Props {
  reaction: EmojiType
  readonly absoluteSize?: number
  readonly parentSize: number
  readonly scale: number
}

const ReactionIcon: React.FC<Props> = (props) => {
  const {reaction, absoluteSize, parentSize, scale} = props

  const size = absoluteSize ? absoluteSize : parentSize * scale

  return (
    <View
      style={[
        styles.container,
        {height: size, width: size, borderRadius: size},
      ]}>
      <EmojiView style={styles.emojiView} type={reaction} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: -15,
    top: -15,
    backgroundColor: 'white',
  },
  emojiView: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})

export default React.memo(ReactionIcon)

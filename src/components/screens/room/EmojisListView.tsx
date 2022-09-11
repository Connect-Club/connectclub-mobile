import React, {memo} from 'react'
import {StyleSheet, View} from 'react-native'

import {isWebOrTablet} from '../../../utils/device.utils'
import {maxWidth} from '../../../utils/layout.utils'
import EmojiListItemView from './EmojiListItemView'
import {emojiIcons, EmojiType} from './models/jsonModels'

interface Props {
  readonly onEmojiPress: (type: EmojiType) => void
}

export const emojiListItemHeight = maxWidth() / 5
const allEmoji = Object.values(EmojiType).filter((s) => s !== EmojiType.none)
const EmojisListView: React.FC<Props> = ({onEmojiPress}) => {
  return (
    <View style={styles.container}>
      {allEmoji.map((i) => (
        <EmojiListItemView
          key={i}
          size={emojiListItemHeight - 8}
          type={i}
          icon={emojiIcons[i]}
          onEmojiPress={onEmojiPress}
        />
      ))}
    </View>
  )
}

export default memo(EmojisListView)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: isWebOrTablet() ? 'center' : 'space-around',
  },
})

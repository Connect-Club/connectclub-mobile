import React from 'react'
import {Image, LayoutChangeEvent, StyleSheet, View} from 'react-native'

import {draftPreviewTypes, DraftType} from '../../../models'
import {ms} from '../../../utils/layout.utils'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface ItemProp {
  readonly onLayout: (index: number, e: LayoutChangeEvent) => void
  readonly onItemPress: (index: number) => void
  readonly index: number
  readonly type: DraftType
  readonly accessibilityLabel?: string
}

const RoomTypeListItem: React.FC<ItemProp> = (props) => {
  return (
    <AppTouchableOpacity
      style={styles.listItem}
      accessibilityLabel={props.accessibilityLabel}
      shouldVibrateOnClick
      onPress={() => props.onItemPress(props.index)}
      onLayout={(e) => props.onLayout(props.index, e)}>
      <View style={styles.mask}>
        <Image
          source={draftPreviewTypes[props.type]}
          style={styles.listItemInner}
        />
      </View>
    </AppTouchableOpacity>
  )
}

const styles = StyleSheet.create({
  listItem: {
    width: ms(80),
    height: ms(72),
    alignItems: 'center',
    justifyContent: 'center',
  },
  mask: {
    width: ms(66),
    height: ms(66),
    overflow: 'hidden',
    borderRadius: ms(12),
  },
  listItemInner: {
    alignSelf: 'center',
    width: ms(68),
    height: ms(68),
  },
})

export default RoomTypeListItem

import React, {useCallback, useRef, useState} from 'react'
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  StyleSheet,
  View,
} from 'react-native'

import {draftIndexType, DraftType} from '../../../models'
import {getArrayOf} from '../../../utils/array.utils'
import {ms} from '../../../utils/layout.utils'
import RoomTypeListItem from './RoomTypeListItem'

interface ListProps {
  readonly onDraftSelect: (draft: DraftType) => void
}

const RoomTypesListView: React.FC<ListProps> = ({onDraftSelect}) => {
  const [selectedVisible, setSelectedVisible] = useState(false)
  const selectedPositionX = useRef(new Animated.Value(ms(25))).current
  const selectedOpacity = useRef(new Animated.Value(ms(0.6))).current

  const selectedOverlayStyle = {
    transform: [{translateX: selectedPositionX}],
    opacity: selectedOpacity,
  }
  const selectedStyle = {
    transform: [{translateX: selectedPositionX}],
  }

  const itemsPositions = useRef<number[]>([0, 0, 0, 0])

  const createOpacityAnim = (toValue: number) => {
    return Animated.timing(selectedOpacity, {
      toValue: toValue,
      useNativeDriver: false,
      duration: 200,
      easing: Easing.inOut(Easing.cubic),
    })
  }

  const animateSelectPosition = (index: number) => {
    const translation = Animated.timing(selectedPositionX, {
      toValue: itemsPositions.current[index],
      useNativeDriver: false,
      duration: 200,
      easing: Easing.inOut(Easing.cubic),
    })
    Animated.sequence([
      createOpacityAnim(0),
      translation,
      createOpacityAnim(0.6),
    ]).start()
  }

  const onItemLayout = useCallback(
    (index: number, e: LayoutChangeEvent) => {
      itemsPositions.current[index] = e.nativeEvent.layout.x
      if (itemsPositions.current.includes(0)) return
      setSelectedVisible(true)
    },
    [itemsPositions],
  )
  const onItemPressed = (index: number) => {
    onDraftSelect(draftIndexType[index])
    animateSelectPosition(index)
  }

  return (
    <View style={styles.container}>
      {getArrayOf(4).map((_, i) => (
        <RoomTypeListItem
          key={i}
          accessibilityLabel={draftIndexType[i]}
          type={draftIndexType[i]}
          onItemPress={onItemPressed}
          onLayout={onItemLayout}
          index={i}
        />
      ))}

      {selectedVisible && (
        <Animated.View
          pointerEvents={'none'}
          style={[styles.listItemSelectedOverlay, selectedOverlayStyle]}
        />
      )}

      {selectedVisible && (
        <Animated.View style={[styles.listItemSelected, selectedStyle]} />
      )}
    </View>
  )
}

export default RoomTypesListView

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: ms(372),
    height: ms(72),
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: ms(25),
    marginTop: ms(29),
  },

  listItemSelected: {
    borderWidth: ms(4),
    borderColor: 'white',
    borderRadius: ms(12),
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: ms(72),
    height: ms(72),
  },

  listItemSelectedOverlay: {
    borderRadius: ms(12),
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: ms(72),
    height: ms(72),
    opacity: 0.6,
    backgroundColor: '#5DC56E',
  },
})

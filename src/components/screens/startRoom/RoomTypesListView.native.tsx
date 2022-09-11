import React, {useCallback, useRef, useState} from 'react'
import {LayoutChangeEvent, ScrollView, StyleSheet} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'

import {draftIndexType, DraftType} from '../../../models'
import {getArrayOf} from '../../../utils/array.utils'
import {ms} from '../../../utils/layout.utils'
import {waitAnimateWithTiming} from '../../../utils/reanimated.utils'
import RoomTypeListItem from './RoomTypeListItem'

interface ListProps {
  readonly onDraftSelect: (draft: DraftType) => void
}

const RoomTypesListView: React.FC<ListProps> = ({onDraftSelect}) => {
  const selectedPositionX = useSharedValue(ms(16))
  const selectedOpacity = useSharedValue(0.6)
  const [selectedVisible, setSelectedVisible] = useState(false)
  const selectedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: selectedPositionX.value}],
  }))
  const scrollRef = useRef<ScrollView>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const selectedOverlayStyle = useAnimatedStyle(() => ({
    transform: [{translateX: selectedPositionX.value}],
    opacity: selectedOpacity.value,
  }))

  const itemsPositions = useRef<number[]>([0, 0, 0, 0, 0])

  const onItemLayout = useCallback(
    (index: number, e: LayoutChangeEvent) => {
      itemsPositions.current[index] = e.nativeEvent.layout.x + ms(4)
      if (itemsPositions.current.includes(0)) return
      setSelectedVisible(true)
    },
    [itemsPositions],
  )

  const onItemPress = useCallback(
    async (index: number) => {
      if (timerRef.current) return
      timerRef.current = setTimeout(() => {
        timerRef.current = null
      }, 600)

      onDraftSelect(draftIndexType[index])
      await waitAnimateWithTiming(selectedOpacity, 0)
      if (index === 4)
        scrollRef.current?.scrollTo({
          x: itemsPositions.current[index],
          y: 0,
          animated: true,
        })
      if (index === 0) scrollRef.current?.scrollTo({x: 0, y: 0, animated: true})
      await waitAnimateWithTiming(
        selectedPositionX,
        itemsPositions.current[index],
      )
      await waitAnimateWithTiming(selectedOpacity, 0.6)
    },
    [selectedPositionX, selectedOpacity, onDraftSelect],
  )

  return (
    <ScrollView
      ref={scrollRef}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}>
      {getArrayOf(5).map((_, i) => (
        <RoomTypeListItem
          key={i}
          accessibilityLabel={draftIndexType[i]}
          type={draftIndexType[i]}
          onItemPress={onItemPress}
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
    </ScrollView>
  )
}

export default RoomTypesListView

const styles = StyleSheet.create({
  container: {
    height: ms(72),
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: ms(12),
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

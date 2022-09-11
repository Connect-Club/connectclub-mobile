import React, {memo, useCallback, useRef, useState} from 'react'
import {LayoutChangeEvent, StyleSheet, View} from 'react-native'
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
} from 'react-native-reanimated'

import {hideLoading} from '../../../appEventEmitter'
import {InterestCategoryModel, InterestModel} from '../../../models'
import {isWeb} from '../../../utils/device.utils'
import {maxWidth} from '../../../utils/layout.utils'
import {
  PanGestureHandler,
  useAnimatedGestureHandler,
} from '../../webSafeImports/webSafeImports'
import InterestListItem from './InterestListItem'

const screenWidth = maxWidth()
const topicContainerMargin = 5
const containerPaddingHorizontal = 16

interface TopicProps {
  readonly topic: InterestModel
  readonly translateX: any
  readonly topicPosition: any
  readonly handleItemLayout: (event: LayoutChangeEvent, topic: number) => void
}

const Topic: React.FC<TopicProps> = memo(
  ({topic, topicPosition, translateX, handleItemLayout}) => {
    const style = useAnimatedStyle(() => {
      const {levelWidth} = topicPosition
      if (!levelWidth) return {}
      const levelDifference =
        screenWidth - levelWidth[topicPosition[topic.id].layout.y]
      const maxLevelDifference =
        // @ts-ignore
        screenWidth - Math.max(...Object.values(levelWidth))
      const translationX =
        levelDifference > 0
          ? translateX.value
          : (levelDifference * translateX.value) / maxLevelDifference

      return {transform: [{translateX: translationX}]}
    }, [topicPosition])

    return (
      <Animated.View
        style={[styles.topicContainer, style]}
        onLayout={(event) => handleItemLayout(event, topic.id)}>
        <InterestListItem interest={topic} isBigStyle={true} />
      </Animated.View>
    )
  },
)

const TopicWeb: React.FC<TopicProps> = memo(({topic}) => {
  return (
    <View style={[styles.topicContainer]}>
      <InterestListItem interest={topic} isBigStyle={true} />
    </View>
  )
})

const TopicFC = isWeb ? TopicWeb : Topic

export const Topics: React.FC<{category: InterestCategoryModel}> = ({
  category,
}) => {
  const topicPositionRef = useRef<any>({})
  const [topicPosition, setTopicPosition] = useState<any>({})
  const translateX = useSharedValue(0)
  const onGestureEvent = useAnimatedGestureHandler(
    {
      onStart: (_event, context: any) => {
        if (!context.isDecayAnimationRunning) return
        context.isDecayAnimationRunning = false
        cancelAnimation(translateX)
      },
      onActive: (event, context) => {
        translateX.value = (context.offset || 0) + event.translationX
      },
      onEnd: (event, context) => {
        context.offset = translateX.value
        const {offset} = context
        const {velocityX} = event
        const maxLevelDifference =
          // @ts-ignore
          screenWidth - Math.max(...Object.values(topicPosition.levelWidth))
        const leftBound = 0
        const rightBound =
          maxLevelDifference - containerPaddingHorizontal - topicContainerMargin

        if (offset > leftBound) {
          context.offset = leftBound
          translateX.value = withSpring(leftBound, {
            velocity: velocityX,
            mass: 0.6,
            stiffness: 90,
          })
        } else if (offset < rightBound) {
          context.offset = leftBound
          translateX.value = withSpring(leftBound, {
            velocity: velocityX,
            mass: 0.6,
            stiffness: 90,
          })
        } else {
          context.isDecayAnimationRunning = true
          translateX.value = withDecay(
            {
              velocity: velocityX,
              clamp: velocityX < 0 ? [rightBound, 0] : [translateX.value, 0],
            },
            () => {
              context.isDecayAnimationRunning = false
              context.offset = leftBound
            },
          )
        }
      },
    },
    [topicPosition],
  )

  const handleItemLayout = useCallback(
    (event: LayoutChangeEvent, topic: number) => {
      if (topicPositionRef.current[topic]) return
      topicPositionRef.current[topic] = event.nativeEvent

      const values = Object.values(topicPositionRef.current)
      if (values.length !== category.interests[0].length) return
      hideLoading()
      const topicPosition = values.reduce((accumulator: any, current: any) => {
        if (!accumulator.levelWidth) {
          accumulator.levelWidth = {}
        }

        if (!accumulator.levelWidth[current.layout.y]) {
          accumulator.levelWidth[current.layout.y] = 0
        }

        const tempMax = accumulator.levelWidth[current.layout.y]
        const maybeMax = current.layout.x + current.layout.width

        if (maybeMax > tempMax) {
          accumulator.levelWidth[current.layout.y] =
            maybeMax + topicContainerMargin
        }

        return accumulator
      }, topicPositionRef.current)
      setTopicPosition(topicPosition)
    },
    [],
  )

  const renderTopics = () => {
    return (category.interests?.[0] ?? []).map((topic) => (
      <TopicFC
        key={topic.id}
        topic={topic}
        handleItemLayout={handleItemLayout}
        topicPosition={topicPosition}
        translateX={translateX}
      />
    ))
  }

  if (isWeb) {
    return (
      <View>
        <View style={styles.container}>{renderTopics()}</View>
      </View>
    )
  }

  return (
    <PanGestureHandler {...{onGestureEvent}} activeOffsetX={[-10, 10]}>
      <Animated.View>
        <Animated.View style={styles.container}>{renderTopics()}</Animated.View>
      </Animated.View>
    </PanGestureHandler>
  )
}

const styles = StyleSheet.create({
  container: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    width: screenWidth,
    paddingHorizontal: containerPaddingHorizontal,
    marginTop: 32,
  },
  topicContainer: {
    //marginEnd: 8,
    marginEnd: 8,
    marginBottom: 16,
  },
})

Topics.displayName = 'Topics'

export default Topics

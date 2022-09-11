import React, {memo, useCallback, useRef, useState} from 'react'
import {LayoutChangeEvent, StyleSheet, Text, View} from 'react-native'
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSpring,
} from 'react-native-reanimated'

import {hideLoading} from '../../../appEventEmitter'
import {SkillCategoryModel, SkillModel} from '../../../models'
import {isNative, isWeb} from '../../../utils/device.utils'
import {maxWidth} from '../../../utils/layout.utils'
import {
  PanGestureHandler,
  useAnimatedGestureHandler,
} from '../../webSafeImports/webSafeImports'
import SkillListItem from './SkillListItem'

const screenWidth = maxWidth()
const topicContainerMargin = 5
const containerPaddingHorizontal = 10

interface SkillTopicProps {
  readonly topic: SkillModel
  readonly translateX: any
  readonly topicPosition: any
  readonly handleItemLayout: (event: LayoutChangeEvent, topic: number) => void
}

const SkillTopic: React.FC<SkillTopicProps> = memo(
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
        <SkillListItem skill={topic} />
      </Animated.View>
    )
  },
)

const TopicWeb: React.FC<SkillTopicProps> = memo(({topic}) => {
  return (
    <View style={[styles.topicContainer]}>
      <SkillListItem skill={topic} />
    </View>
  )
})

const TopicFC = isWeb ? TopicWeb : SkillTopic

export const SkillTopics: React.FC<{category: SkillCategoryModel}> = ({
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
          context.offset = rightBound
          translateX.value = withSpring(rightBound, {
            velocity: velocityX,
            mass: 0.6,
            stiffness: 90,
          })
        } else {
          context.isDecayAnimationRunning = true
          translateX.value = withDecay(
            {
              velocity: velocityX,
              clamp:
                velocityX < 0
                  ? [rightBound, translateX.value]
                  : [translateX.value, 0],
            },
            () => {
              context.isDecayAnimationRunning = false
              context.offset = translateX.value
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
      if (values.length !== category.skills[0].length) return
      hideLoading()
      const newTopicPosition = values.reduce(
        (accumulator: any, current: any) => {
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
        },
        topicPositionRef.current,
      )
      setTopicPosition(newTopicPosition)
    },
    [],
  )

  const renderTopics = () => {
    return (category.skills?.[0] ?? []).map((topic) => (
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
        <Text style={styles.sectionTitle}>{category.name}</Text>
        <View style={styles.container}>{renderTopics()}</View>
      </View>
    )
  }

  return (
    <PanGestureHandler {...{onGestureEvent}} activeOffsetX={[-10, 10]}>
      <Animated.View>
        <Text style={styles.sectionTitle}>{category.name}</Text>
        <Animated.View style={styles.container}>{renderTopics()}</Animated.View>
      </Animated.View>
    </PanGestureHandler>
  )
}

const styles = StyleSheet.create({
  container: {
    flexWrap: 'wrap',
    flexDirection: 'row',
    width: isNative ? screenWidth * 1.8 : screenWidth,
    paddingHorizontal: containerPaddingHorizontal,
  },
  topicContainer: {
    //marginEnd: 8,
    marginEnd: 8,
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 16,
    height: 32,
    lineHeight: 32,
    marginTop: 32,
  },
})

SkillTopics.displayName = 'Topics'

export default SkillTopics

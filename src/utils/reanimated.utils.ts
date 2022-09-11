import {useCallback, useEffect, useMemo} from 'react'
import {ImageStyle, TextStyle, ViewStyle} from 'react-native'
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'

import {
  ReanimatedStyleProp,
  ReanimatedWithTimingConfig,
} from '../components/webSafeImports/webSafeImports'
import {delay} from './date.utils'

interface NumberValueAnimationConfig {
  readonly sharedValue: Animated.SharedValue<number>
  readonly from: number
  readonly to: number
  readonly duration: number
  readonly delay?: number
  readonly easing?: (value: number) => number
}
interface DefaultAnimationConfig {
  readonly style: ReanimatedStyleProp<ViewStyle | ImageStyle | TextStyle>
  readonly start: () => void
}
interface UpDownAnimationConfig {
  readonly style: ReanimatedStyleProp<ViewStyle | ImageStyle | TextStyle>
  readonly up: () => Promise<void>
  readonly down: () => Promise<void>
}

export const animateNumberValue = (
  config: NumberValueAnimationConfig,
): Promise<void> => {
  return new Promise((resolve) => {
    config.sharedValue.value = config.from
    const easing = config.easing ? {easing: config.easing} : {}
    const valueUpdate = withTiming(
      config.to,
      {duration: config.duration, ...easing},
      (finish) => {
        'worklet'
        if (finish) runOnJS(resolve)()
      },
    )
    config.sharedValue.value = config.delay
      ? withDelay(config.delay, valueUpdate)
      : valueUpdate
  })
}

export const animateNumberValues = (
  ...configs: Array<NumberValueAnimationConfig>
): Promise<any> => {
  const animations = configs.map(animateNumberValue)
  return Promise.all(animations)
}

export const infiniteRippleAnimation = async (
  scale: NumberValueAnimationConfig,
  opacity: NumberValueAnimationConfig,
  rippleDelay: number,
) => {
  if (rippleDelay > 0) await delay(rippleDelay)
  opacity.sharedValue.value = opacity.from
  await animateNumberValue({
    sharedValue: scale.sharedValue,
    from: scale.from,
    to: scale.to,
    duration: scale.duration,
  })
  await animateNumberValue({
    sharedValue: opacity.sharedValue,
    from: opacity.from,
    to: opacity.to,
    duration: opacity.duration,
  })
  infiniteRippleAnimation(scale, opacity, rippleDelay)
}

export const useSimpleRippleAnimation = (
  overlayOpacity: number,
): ReanimatedStyleProp<ViewStyle | ImageStyle | TextStyle> => {
  const scaleSharedValue = useSharedValue(0)
  const opacitySharedValue = useSharedValue(overlayOpacity)
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scaleSharedValue.value}],
    opacity: opacitySharedValue.value,
  }))

  useEffect(() => {
    infiniteRippleAnimation(
      {
        sharedValue: scaleSharedValue,
        from: 0,
        to: 1,
        duration: 1000,
      },
      {
        sharedValue: opacitySharedValue,
        from: overlayOpacity,
        to: 0,
        duration: 600,
      },
      1500,
    )
    return () => {
      cancelAnimation(opacitySharedValue)
      cancelAnimation(scaleSharedValue)
    }
  }, [opacitySharedValue, overlayOpacity, scaleSharedValue])

  return animatedStyle
}

export const useRotateAnimation = (config: {
  degrees: number
  duration: number
}): DefaultAnimationConfig => {
  const rotateSharedValue = useSharedValue(0)
  const animatedStyle = useAnimatedStyle(
    (): ReanimatedStyleProp<ViewStyle | ImageStyle> => {
      return {
        transform: [{rotateZ: `${rotateSharedValue.value}deg`}],
      }
    },
  )
  const start = useCallback(
    async () =>
      animateNumberValue({
        sharedValue: rotateSharedValue,
        from: 0,
        to: config.degrees,
        duration: config.duration,
      }),
    [config.degrees, config.duration, rotateSharedValue],
  )
  useEffect(() => {
    return () => cancelAnimation(rotateSharedValue)
  }, [rotateSharedValue])
  return useMemo(() => ({style: animatedStyle, start}), [animatedStyle, start])
}

export const useUpByMarginAnimation = (config: {
  initialValue: number
  upValue: number
  downValue: number
  duration: number
}): UpDownAnimationConfig => {
  const marginValue = useSharedValue(config.initialValue)
  const animatedStyle = useAnimatedStyle(
    (): ReanimatedStyleProp<ViewStyle | ImageStyle> => ({
      marginTop: marginValue.value,
    }),
  )
  const up = useCallback(
    async () =>
      animateNumberValue({
        sharedValue: marginValue,
        from: config.downValue,
        to: config.upValue,
        duration: config.duration,
      }),
    [config.upValue, config.downValue, config.duration, marginValue],
  )
  const down = useCallback(
    async () =>
      animateNumberValue({
        sharedValue: marginValue,
        from: config.upValue,
        to: config.downValue,
        duration: config.duration,
      }),
    [config.upValue, config.downValue, config.duration, marginValue],
  )
  useEffect(() => {
    return () => cancelAnimation(marginValue)
  }, [marginValue])
  return useMemo(() => ({style: animatedStyle, up, down}), [
    animatedStyle,
    up,
    down,
  ])
}

export const useVerticalAnimationByTranslationY = (config: {
  initialValue: number
  upValue: number
  downValue: number
  duration: number
  delay?: number
}): UpDownAnimationConfig => {
  const translation = useSharedValue(config.initialValue)
  const animatedStyle = useAnimatedStyle(
    (): ReanimatedStyleProp<ViewStyle | ImageStyle> => ({
      transform: [{translateY: translation.value}],
    }),
  )
  const up = useCallback(
    async () =>
      animateNumberValue({
        sharedValue: translation,
        from: config.downValue,
        to: config.upValue,
        duration: config.duration,
        delay: config.delay,
      }),
    [
      config.upValue,
      config.downValue,
      config.duration,
      config.delay,
      translation,
    ],
  )
  const down = useCallback(
    async () =>
      animateNumberValue({
        sharedValue: translation,
        from: config.upValue,
        to: config.downValue,
        duration: config.duration,
        delay: config.delay,
      }),
    [
      config.upValue,
      config.downValue,
      config.duration,
      config.delay,
      translation,
    ],
  )
  useEffect(() => {
    return () => cancelAnimation(translation)
  }, [translation])
  return useMemo(() => ({style: animatedStyle, up, down}), [
    animatedStyle,
    up,
    down,
  ])
}

export const waitAnimateWithTiming = (
  animated: Animated.SharedValue<number>,
  value: number,
  userConfig?: ReanimatedWithTimingConfig,
) => {
  return new Promise<void>((resolve) => {
    animated.value = withTiming(value, userConfig, () => {
      runOnJS(resolve)()
    })
  })
}

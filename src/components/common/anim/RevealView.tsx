import React, {useCallback, useEffect, useRef, useState} from 'react'
import {Animated, Easing, StyleProp, ViewStyle} from 'react-native'

export type AnimType = 'scale' | 'fade'

export interface Props {
  readonly isRevealed?: boolean
  readonly animType?: AnimType
  readonly animDuration?: number
  readonly style?: StyleProp<ViewStyle>
  readonly pointerEvents?: 'none' | 'auto'
}

export const RevealView: React.FC<Props> = (props) => {
  const anim = useRef(new Animated.Value(1)).current
  const isVisible = props.isRevealed ?? true
  const animType = props.animType ?? 'scale'
  const duration = props.animDuration ?? 140
  const [isRevealed, setRevealed] = useState(isVisible)

  const hide = useCallback(() => {
    Animated.timing(anim, {
      toValue: 0,
      duration: duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setRevealed(false)
    })
  }, [anim, duration])

  const reveal = useCallback(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: duration,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setRevealed(true)
    })
  }, [anim, duration])

  useEffect(() => {
    if (isVisible) {
      if (!isRevealed) reveal()
    } else {
      if (isRevealed) hide()
    }
  }, [isVisible, isRevealed, reveal, hide])

  if (!isVisible && !isRevealed) return null

  let animStyle: any
  switch (animType) {
    case 'scale': {
      animStyle = {transform: [{scale: anim}]}
      break
    }
    case 'fade': {
      animStyle = {opacity: anim}
      break
    }
  }

  return (
    <Animated.View
      accessibilityLabel={'RevealView'}
      pointerEvents={props.pointerEvents}
      style={[animStyle, props.style]}>
      {props.children}
    </Animated.View>
  )
}

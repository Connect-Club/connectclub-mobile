import React, {memo, useEffect, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated'

import AppIcon from '../../assets/AppIcon'
import {PRIMARY_BACKGROUND, SUPPORT_BACKGROUND} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import {setNavigationBarColor} from './DecorConfigModule'
import FlexSpace from './FlexSpace'
import Vertical from './Vertical'

interface Props {}

const LoadRoomView: React.FC<Props> = () => {
  const {t} = useTranslation()
  const timerId = useRef<ReturnType<typeof setTimeout> | null>()
  const textFadeInValue = useSharedValue(0)
  const loaderFadeInValue = useSharedValue(0)
  const textBlockStyle = useAnimatedStyle(() => {
    return {
      opacity: textFadeInValue.value,
    }
  })
  const loadingIndicatorStyle = useAnimatedStyle(() => {
    return {
      opacity: loaderFadeInValue.value,
    }
  })

  const animateIn = () => {
    textFadeInValue.value = withTiming(1, {
      duration: 220,
      easing: Easing.in(Easing.ease),
    })
    loaderFadeInValue.value = withDelay(
      800,
      withTiming(1, {
        duration: 220,
        easing: Easing.in(Easing.ease),
      }),
    )
  }

  const startDelayedAnimation = () => {
    timerId.current = setTimeout(() => {
      animateIn()
    }, 2000)
  }

  useEffect(() => {
    setNavigationBarColor(SUPPORT_BACKGROUND, false)
    return () => setNavigationBarColor(PRIMARY_BACKGROUND, true)
  }, [])

  useEffect(() => {
    return () => {
      if (timerId.current) clearTimeout(timerId.current)
    }
  }, [])

  return (
    <View
      style={[
        {backgroundColor: SUPPORT_BACKGROUND, zIndex: 9999},
        StyleSheet.absoluteFill,
      ]}>
      <StatusBar
        barStyle='light-content'
        backgroundColor={SUPPORT_BACKGROUND}
        translucent={true}
      />

      <FlexSpace />

      <Vertical style={styles.vertical}>
        <AppIcon type={'icRoomLoading'} style={styles.icon} />
        <Animated.View style={textBlockStyle} onLayout={startDelayedAnimation}>
          <Text style={styles.text}>{t('loadingContent')}</Text>
        </Animated.View>
      </Vertical>

      <FlexSpace />
      <Animated.View style={loadingIndicatorStyle}>
        <ActivityIndicator
          style={styles.activityIndicator}
          size={'large'}
          color={'white'}
        />
      </Animated.View>
    </View>
  )
}

export default memo(LoadRoomView)

const styles = StyleSheet.create({
  activityIndicator: {
    marginBottom: ms(32),
  },

  icon: {
    transform: [{scale: 0.7}],
  },

  vertical: {
    alignSelf: 'center',
    alignItems: 'center',
  },

  text: {
    marginTop: ms(32),
    color: 'white',
    fontSize: ms(13),
  },
})

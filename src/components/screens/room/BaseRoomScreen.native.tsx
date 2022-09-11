import {useNavigation} from '@react-navigation/native'
import {activateKeepAwake} from '@sayem314/react-native-keep-awake'
import React, {useEffect, useRef, useState} from 'react'
import {Dimensions, StyleSheet} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import {analytics} from '../../../Analytics'
import {appEventEmitter} from '../../../appEventEmitter'
import RoomScreen, {RoomParams} from '../../../screens/RoomScreen'
import {SUPPORT_BACKGROUND} from '../../../theme/appTheme'
import {delay} from '../../../utils/date.utils'
import devicePermissionUtils from '../../../utils/device-permission.utils'
import {popToTop} from '../../../utils/navigation.utils'

const screenHeight = Dimensions.get('window').height
const BEFORE_EXPAND_DELAY = 600
const hiddenHeight = screenHeight + 300
const config = {duration: 500}

const BaseRoomScreen: React.FC = () => {
  const navigation = useNavigation()
  const [isVisible, setVisible] = useState(false)
  const roomParams = useRef<RoomParams | null>(null)
  const changeRoomParams = useRef<RoomParams | null>(null)
  const translationY = useSharedValue(hiddenHeight)
  const collapseState = useAnimatedStyle(() => ({
    transform: [{translateY: withTiming(translationY.value, config)}],
  }))

  useEffect(() => {
    const openCleaner = appEventEmitter.on(
      'openRoom',
      async (roomId, roomPass, eventScheduleId) => {
        if (navigation.canGoBack()) {
          popToTop(navigation)
          await delay(BEFORE_EXPAND_DELAY)
        }
        const current = roomParams.current
        if (current) {
          if (current.roomId === roomId) {
            if (translationY.value !== 0)
              appEventEmitter.trigger('collapseRoom', false)
            return
          }
          changeRoomParams.current = {roomId, roomPass}
          appEventEmitter.trigger('leaveRoom')
          return
        }
        await devicePermissionUtils.requestPhonePermission()
        await devicePermissionUtils.requestBluetoothPermission()
        roomParams.current = {roomId, roomPass, eventScheduleId}
        translationY.value = 0
        await delay(config.duration)
        setVisible(true)
        activateKeepAwake()
      },
    )

    const closeCleaner = appEventEmitter.on('closeRoom', () => {
      roomParams.current = null
      translationY.value = hiddenHeight
      setVisible(false)
    })

    const destroyCleaner = appEventEmitter.on('roomDestroyed', () => {
      const params = changeRoomParams.current
      changeRoomParams.current = null
      if (!params) return
      appEventEmitter.trigger('openRoom', params.roomId, params.roomPass)
    })

    const collapseCleaner = appEventEmitter.on(
      'collapseRoom',
      async (isCollapse) => {
        if (translationY.value === hiddenHeight && navigation.canGoBack()) {
          popToTop(navigation)
          await delay(BEFORE_EXPAND_DELAY)
        }
        translationY.value = isCollapse ? hiddenHeight : 0
      },
    )

    analytics.sendEvent('room_screen_open')
    return () => {
      openCleaner()
      closeCleaner()
      collapseCleaner()
      destroyCleaner()
    }
  }, [])

  return (
    <Animated.View style={[styles.base, collapseState]}>
      {isVisible && (
        <RoomScreen
          roomId={roomParams.current?.roomId!}
          roomPass={roomParams.current?.roomPass!}
          eventScheduleId={roomParams.current?.eventScheduleId}
        />
      )}
    </Animated.View>
  )
}

export default BaseRoomScreen

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: SUPPORT_BACKGROUND,
  },
})

import {
  activateKeepAwake,
  deactivateKeepAwake,
} from '@sayem314/react-native-keep-awake'
import {observer} from 'mobx-react'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
import {StyleSheet} from 'react-native'
import Animated from 'react-native-reanimated'

import {analytics} from '../../../../Analytics'
import {appEventEmitter} from '../../../../appEventEmitter'
import {useTheme} from '../../../../theme/appTheme'
import {ms} from '../../../../utils/layout.utils'
import {useVerticalAnimationByTranslationY} from '../../../../utils/reanimated.utils'
import {useBottomSafeArea} from '../../../../utils/safeArea.utils'
import {getCurrentRoomDeps, RoomDeps} from '../roomDeps'
import SpeakerCollapsedHeader from './SpeakerCollapsedHeader'

export const collapsedRoomHeaderHeight = ms(89)

const CollapsedRoomHeader: React.FC = () => {
  const {colors} = useTheme()
  const [deps, setDeps] = useState<RoomDeps | null>(null)
  const bottom = useBottomSafeArea()
  const animation = useVerticalAnimationByTranslationY({
    initialValue: 1000,
    upValue: 0,
    downValue: 1000,
    duration: 350,
    delay: 300,
  })

  useEffect(() => {
    const openCleaner = appEventEmitter.on('collapseRoom', (isCollapse) => {
      setDeps(isCollapse ? getCurrentRoomDeps().deps! : null)
      if (isCollapse) {
        deactivateKeepAwake()
        animation.up()
      } else {
        activateKeepAwake()
        animation.down()
      }
    })
    const closeCleaner = appEventEmitter.on('closeRoom', () => {
      deactivateKeepAwake()
      setDeps(null)
    })
    return () => {
      openCleaner()
      closeCleaner()
    }
  }, [animation])

  const collapseRoom = useCallback(() => {
    appEventEmitter.trigger('collapseRoom', false)
  }, [])

  const onLeavePress = useCallback(() => {
    analytics.sendEvent('click_leave_collapsed_room_button', {
      roomId: deps?.roomManager.getCurrentRoomId(),
      eventId: deps?.roomManager.roomEventId,
    })
    appEventEmitter.trigger('leaveRoom')
  }, [])

  const viewStyle = useMemo(
    () => ({
      height: collapsedRoomHeaderHeight + bottom,
      borderColor: colors.inactiveAccentColor,
      backgroundColor: colors.systemBackground,
    }),
    [],
  )

  if (!deps) return null
  return (
    <Animated.View style={[styles.root, viewStyle, animation.style]}>
      <SpeakerCollapsedHeader
        onLeavePress={onLeavePress}
        onReturnPress={collapseRoom}
      />
    </Animated.View>
  )
}

export default observer(CollapsedRoomHeader)

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    borderTopWidth: ms(1),
    marginStart: -ms(3),
    marginEnd: -ms(3),
  },
  pressable: {
    height: '100%',
    width: '100%',
    borderTopLeftRadius: ms(12),
    borderTopRightRadius: ms(12),
    marginTop: ms(7),
    marginStart: ms(3),
    marginEnd: ms(3),
  },
})

import React, {memo, useEffect, useRef} from 'react'
import {AppState, AppStateStatus} from 'react-native'

import {appEventEmitter} from '../../../appEventEmitter'
import {RoomManager} from './jitsi/RoomManager'
import {logJS} from './modules/Logger'

type Props = {roomManager: RoomManager}

const AppStateManager: React.FC<Props> = (props) => {
  const currentAppStateRef = useRef(AppState.currentState)
  const isRoomCollapsedRef = useRef(false)

  const onCollapseStateUpdated = () => {
    const isInBackground = currentAppStateRef.current.match(
      /inactive|background/,
    )
    if (isInBackground) return
    props.roomManager.phoneState(
      isRoomCollapsedRef.current ? 'background' : 'foreground',
    )
  }

  useEffect(() => {
    const onAppStateChanged = (nextAppState: AppStateStatus) => {
      const oldState = currentAppStateRef.current
      currentAppStateRef.current = nextAppState
      if (isRoomCollapsedRef.current) return
      if (oldState.match(/inactive|background/) && nextAppState === 'active') {
        logJS('debug', 'AppState -> FOREGROUND')
        props.roomManager.phoneState('foreground')
        return
      }
      if (oldState === 'active' && nextAppState.match(/inactive|background/)) {
        logJS('debug', 'AppState -> BACKGROUND')
        props.roomManager.phoneState('background')
        return
      }
    }
    const collapseCleaner = appEventEmitter.on('collapseRoom', (isCollapse) => {
      isRoomCollapsedRef.current = isCollapse
      onCollapseStateUpdated()
    })
    AppState.addEventListener('change', onAppStateChanged)
    return () => {
      collapseCleaner()
      AppState.removeEventListener('change', onAppStateChanged)
    }
  }, [])

  return null
}

export default memo(AppStateManager, () => true)

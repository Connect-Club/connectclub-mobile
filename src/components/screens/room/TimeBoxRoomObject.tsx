import {observer} from 'mobx-react'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {Platform, StyleSheet} from 'react-native'

import {appEventEmitter} from '../../../appEventEmitter'
import {storage} from '../../../storage'
import {useTheme} from '../../../theme/appTheme'
import {pad} from '../../../utils/stringHelpers'
import {toastHelper} from '../../../utils/ToastHelper'
import {profileFullName} from '../../../utils/userHelper'
import AppText from '../../common/AppText'
import DurationPickerModal from './DurationPickerModal'
import {RoomManager} from './jitsi/RoomManager'
import UserManager from './jitsi/UserManager'
import {convertRealRoomObjectToLocal} from './models/mappers'
import {logJS} from './modules/Logger'
import ClickableView from './nativeview/RTCClickableView'

interface Props {
  readonly roomManager: RoomManager
  readonly userManager: UserManager
}

const getDurationParts = (seconds: number): {min: number; sec: number} => {
  const m = Math.floor(seconds / 60)
  return {
    min: m,
    sec: seconds - m * 60,
  }
}

const timeToText = (time: number): string => {
  const duration = getDurationParts(time)
  return `${pad(duration.min, 2)}:${pad(duration.sec, 2)}`
}

const TimeBoxRoomObject: React.FC<Props> = ({roomManager, userManager}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  const [isSelectorShown, setSelectorShown] = useState(false)
  const [isInActive, setInActive] = useState(false)
  const suspendedTime = useRef<number>(0)
  const remainingTime = useRef<number>(0)
  const [timerText, setTimerText] = useState('00:00')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [min, setMin] = useState<number>(0)
  const [sec, setSec] = useState<number>(5)

  const obj = convertRealRoomObjectToLocal(roomManager.timeBoxPosition!)
  const isAdmin = userManager.isAdmin

  const onTimerFinished = () => {
    logJS('debug', 'TimeBoxRoomObject onTimerFinished')
    toastHelper.success(t('timerFinishedMessage'))
  }

  const doTimer = () => {
    remainingTime.current = remainingTime.current - 1
    if (remainingTime.current <= 0) {
      remainingTime.current = 0
      stopTimerInternal()
      onTimerFinished()
      return
    }
    setTimerText(timeToText(remainingTime.current))
  }

  const clearTimer = () => {
    const timer = timerRef.current
    if (timer) clearInterval(timer)
  }

  const stopTimerInternal = () => {
    setSelectorShown(false)
    clearTimer()
    setTimerText('00:00')
    setInActive(false)
  }

  const startTimerInternal = useCallback(
    (seconds: number) => {
      setSelectorShown(false)
      clearTimer()
      const duration = getDurationParts(seconds)
      setMin(duration.min)
      setSec(duration.sec)
      remainingTime.current = seconds
      setTimerText(timeToText(remainingTime.current))
      timerRef.current = setInterval(doTimer, 1000)
      setInActive(true)
    },
    [min, sec],
  )

  const stopTimer = useCallback(() => {
    stopTimerInternal()
    const user = storage.currentUser
    const userName = profileFullName(user?.name ?? '', user?.surname ?? '')
    roomManager.stopTimer(userName)
  }, [])

  const startTimer = useCallback(() => {
    startTimerInternal(min * 60 + sec)
    const user = storage.currentUser
    const userName = profileFullName(user?.name ?? '', user?.surname ?? '')
    roomManager.startTimer(min * 60 + sec, userName)
  }, [min, sec])

  useEffect(() => {
    const backgroundWatcherDisposable = appEventEmitter.on(
      'appInBackground',
      () => {
        suspendedTime.current = new Date().getTime()
      },
    )
    const foregroundWatcherDisposable = appEventEmitter.on(
      'appInForeground',
      () => {
        if (remainingTime.current === 0 || suspendedTime.current === 0) return
        const timeLag = Math.floor(
          (new Date().getTime() - suspendedTime.current) / 1000,
        )
        remainingTime.current = Math.max(1, remainingTime.current - timeLag)
        suspendedTime.current = 0
        doTimer()
      },
    )
    const startEventDisposable = appEventEmitter.once(
      'startRoundTimer',
      (seconds, startUserName) => {
        startTimerInternal(seconds)
        const duration = getDurationParts(seconds)
        toastHelper.success(
          t('timerStartedMessage', {
            name: startUserName,
            min: pad(duration.min, 2),
            sec: pad(duration.sec, 2),
          }),
        )
      },
    )
    const stopEventDisposable = appEventEmitter.once(
      'stopRoundTimer',
      (startUserName: string) => {
        stopTimerInternal()
        toastHelper.success(t('timerStoppedMessage', {name: startUserName}))
      },
    )
    return () => {
      backgroundWatcherDisposable()
      foregroundWatcherDisposable()
      clearTimer()
      startEventDisposable()
      stopEventDisposable()
    }
  }, [])

  const onCancelPress = useCallback(() => setSelectorShown(false), [])

  const showTimeSelectorDialog = () => {
    if (!isAdmin) return
    setSelectorShown(true)
  }

  const onSelectorDismiss = useCallback(() => {
    setSelectorShown(false)
  }, [])

  return (
    <>
      <ClickableView
        onClick={showTimeSelectorDialog}
        accessibilityLabel={'timeBox'}
        style={[
          styles.container,
          {
            top: obj.y ?? 0,
            left: obj.x ?? 0,
            minWidth: obj.width ?? 100,
            height: obj.height ?? 100,
          },
        ]}>
        <AppText
          style={[
            styles.timerText,
            {
              width: obj.width ?? 100,
              lineHeight: obj.height ?? 100,
              fontSize: (obj.height ?? 100) * 0.7,
              color: isInActive
                ? colors.textPrimary
                : 'rgba(255, 255, 255, 0.3)',
            },
          ]}>
          {timerText}
        </AppText>
      </ClickableView>
      <DurationPickerModal
        isVisible={isSelectorShown}
        isTimerActive={isInActive}
        onSelectorDismiss={onSelectorDismiss}
        minValue={min}
        onMinChanged={setMin}
        secValue={sec}
        onSecChanged={setSec}
        onStartTimerPress={startTimer}
        onStopTimerPress={stopTimer}
        onCancelPress={onCancelPress}
      />
    </>
  )
}

export default observer(TimeBoxRoomObject)

const styles = StyleSheet.create({
  container: {
    zIndex: 0,
    elevation: 0,
    position: 'absolute',
    overflow: 'visible',
  },
  timerText: {
    textAlign: 'center',
    textAlignVertical: 'center',
    fontVariant: ['tabular-nums'],
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'monospace',
  },
})

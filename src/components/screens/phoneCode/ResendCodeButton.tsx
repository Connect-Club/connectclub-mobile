import moment from 'moment'
import React, {useEffect, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import {analytics} from '../../../Analytics'
import {api} from '../../../api/api'
import {hideLoading, showLoading} from '../../../appEventEmitter'
import {commonStyles, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {toastHelper} from '../../../utils/ToastHelper'
import AppText from '../../common/AppText'
import InlineButton from '../../common/InlineButton'

interface Props {
  readonly phoneNumber: string
}

const ResendCodeButton: React.FC<Props> = (props) => {
  const {colors} = useTheme()
  const {t} = useTranslation()
  const [isActive, setActive] = useState(true)
  const resendTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [time, setTime] = useState('')

  const cleanupTimers = () => {
    const timeout = resendTimeout.current
    if (timeout) clearTimeout(timeout)
    const timer = timerRef.current
    if (timer) clearInterval(timer)
  }

  useEffect(() => {
    onPress()
    return () => {
      cleanupTimers()
    }
  }, [])

  const onResendPress = async () => {
    showLoading()
    const response = await api.getSMSCode(props.phoneNumber)
    hideLoading()
    if (response.error) return toastHelper.error(response.error)
  }

  const onPress = async (isFromUser?: boolean) => {
    if (!isActive) return
    setActive(false)
    if (isFromUser) {
      analytics.sendEvent('confirm_code_resend_click')
      await onResendPress()
    }
    cleanupTimers()
    resendTimeout.current = setTimeout(() => {
      setActive(true)
    }, 60 * 1000)

    const timerTime = moment().add(1, 'minute')
    const interval = () => {
      const diff = timerTime.diff(moment())
      const left = moment.utc(diff).format('mm:ss')
      setTime(left)
    }
    interval()
    timerRef.current = setInterval(interval, 1000)
  }

  return (
    <>
      {isActive && (
        <InlineButton
          isEnabled={isActive}
          style={styles.resendButton}
          textStyle={styles.resendButtonText}
          title={t('enterCodeTapToResend')}
          onPress={() => onPress(true)}
        />
      )}
      {!isActive && (
        <AppText style={[styles.countdown, {color: colors.secondaryBodyText}]}>
          {t('enterCodeNextResend', {time})}
        </AppText>
      )}
    </>
  )
}

export default ResendCodeButton

const styles = StyleSheet.create({
  resendButton: {
    paddingHorizontal: 0,
    minWidth: undefined,
    marginStart: ms(2),
  },
  resendButtonText: {
    ...commonStyles.registrationLink,
    fontWeight: 'bold',
  },
  countdown: {
    marginStart: ms(4),
    fontWeight: 'bold',
  },
})

import moment from 'moment'
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, TextInput} from 'react-native'

import AppText from '../../../src/components/common/AppText'
import AppTextInput from '../../../src/components/common/AppTextInput'
import AppTouchableOpacity from '../../../src/components/common/AppTouchableOpacity'
import Horizontal from '../../../src/components/common/Horizontal'
import Vertical from '../../../src/components/common/Vertical'

import {ms} from '../../../src/utils/layout.utils'
import {pad} from '../../../src/utils/stringHelpers'

import {commonStyles, useTheme} from '../../../src/theme/appTheme'

interface Props {
  readonly selectedDate?: number
  readonly onDateTimeSelected: (ts?: number) => void
}

type AmPm = 'AM' | 'PM'

interface State {
  hour?: number
  minute?: number
  amPm: AmPm
  isHourValid?: boolean
  isMinuteValid?: boolean
}

const isStateTimeValid = (state: State) => {
  if (!state.hour || !state.minute) return true
  return state.isHourValid && state.isMinuteValid
}

const getFormattedValues = (
  state: State,
): {
  hour: string
  minute: string
  amPm: AmPm
} => {
  return {
    hour: Number.isInteger(state.hour) ? `${state.hour}` : '',
    minute: Number.isInteger(state.minute) ? pad(state.minute!, 2) : '',
    amPm: state.amPm,
  }
}

const isStateTimeFilled = (state: State) => {
  return Number.isInteger(state.hour) && Number.isInteger(state.minute)
}

const InlineTimePickerWeb: React.FC<Props> = (props) => {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const hourInputRef = useRef<TextInput>(null)
  const minuteInputRef = useRef<TextInput>(null)

  const [state, setState] = useState<State>(() => {
    const date = props.selectedDate ? moment(props.selectedDate) : undefined
    if (!date) return {amPm: 'AM'}
    const amPm = date.format('A') as AmPm
    const hour = Number.parseInt(date.format('h'))
    return {
      hour,
      minute: date.minute(),
      amPm,
      isHourValid: true,
      isMinuteValid: true,
    }
  })
  const initialValues = useMemo(() => getFormattedValues(state), [])
  const hourValueRef = useRef<string>(initialValues.hour)
  const minuteValueRef = useRef<string>(initialValues.minute)
  const amPmValueRef = useRef<string>(initialValues.amPm)

  useEffect(() => {
    hourInputRef.current!.focus()
  }, [])

  const validateAndUpdate = () => {
    const amPm = amPmValueRef.current as AmPm
    const hour =
      hourValueRef.current.length > 0 ? Number(hourValueRef.current) : undefined
    const minute =
      minuteValueRef.current.length > 0
        ? Number(minuteValueRef.current)
        : undefined
    let isHourValid =
      hour == undefined || (Number.isInteger(hour) && hour > 0 && hour <= 12)
    const isMinuteValid =
      minute == undefined ||
      (Number.isInteger(minute) && minute >= 0 && minute <= 59)
    const next = {
      ...state,
      isHourValid,
      isMinuteValid,
      hour,
      minute,
      amPm,
    }
    setState(next)
    if (isStateTimeFilled(next) && isStateTimeValid(next)) {
      const date = moment(props.selectedDate)
      const setHour =
        next.amPm === 'AM'
          ? hour! == 12
            ? 0
            : hour!
          : hour! < 12
          ? hour! + 12
          : hour!
      date.set({hour: setHour, minute, second: 0})
      props.onDateTimeSelected(date.valueOf())
      return
    }
    props.onDateTimeSelected(undefined)
  }

  const onChangeAmPm = useCallback(() => {
    amPmValueRef.current === 'AM'
      ? (amPmValueRef.current = 'PM')
      : (amPmValueRef.current = 'AM')
    validateAndUpdate()
  }, [])

  const getFieldColor = (isValid?: boolean) => {
    return isValid ?? true ? {} : {color: colors.warning}
  }

  const hourStyle = getFieldColor(state.isHourValid)
  const minuteStyle = getFieldColor(state.isMinuteValid)

  return (
    <Horizontal>
      <Vertical style={styles.inputContainer}>
        <AppText style={[styles.text, {color: colors.thirdBlack}]}>
          {t('hour')}
        </AppText>
        <AppTextInput
          ref={hourInputRef}
          style={[styles.input, styles.field, hourStyle]}
          maxLength={2}
          value={hourValueRef.current}
          onChangeText={(text) => {
            hourValueRef.current = text
            if (text.length > 1) {
              minuteInputRef.current?.focus()
            }
            validateAndUpdate()
          }}
          keyboardType={'numeric'}
          selectTextOnFocus={true}
        />
      </Vertical>
      <Vertical style={styles.inputContainer}>
        <AppText style={[styles.text, {color: colors.thirdBlack}]}>
          {t('minute')}
        </AppText>
        <AppTextInput
          ref={minuteInputRef}
          style={[styles.input, styles.field, minuteStyle]}
          maxLength={2}
          value={minuteValueRef.current}
          onChangeText={(text) => {
            minuteValueRef.current = text
            validateAndUpdate()
          }}
          selectTextOnFocus={true}
        />
      </Vertical>
      <Vertical style={styles.inputContainer}>
        <AppText style={styles.text}> </AppText>
        <AppTouchableOpacity
          style={[styles.field, commonStyles.flexOne]}
          onPress={onChangeAmPm}>
          <AppText style={[styles.input, styles.amPm]}>
            {amPmValueRef.current}
          </AppText>
        </AppTouchableOpacity>
      </Vertical>
    </Horizontal>
  )
}

export default memo(InlineTimePickerWeb)

const styles = StyleSheet.create({
  inputContainer: {
    alignItems: 'center',
    marginStart: ms(12),
    marginEnd: ms(12),
  },
  text: {
    fontSize: ms(12),
    lineHeight: ms(18),
    fontWeight: '600',
  },
  field: {
    height: ms(52),
    marginTop: ms(8),
    backgroundColor: 'white',
    maxWidth: ms(52),
    borderRadius: ms(8),
    justifyContent: 'center',
    alignItems: 'center',
    width: ms(52),
  },
  input: {
    paddingHorizontal: ms(16),
    fontSize: ms(17),
  },
  amPm: {
    paddingHorizontal: ms(0),
  },
})

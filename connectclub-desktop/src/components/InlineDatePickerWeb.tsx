import moment from 'moment'
import React, {memo, useEffect, useMemo, useRef, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {LayoutChangeEvent, StyleSheet, TextInput} from 'react-native'

import AppText from '../../../src/components/common/AppText'
import AppTextInput from '../../../src/components/common/AppTextInput'
import Horizontal from '../../../src/components/common/Horizontal'
import Vertical from '../../../src/components/common/Vertical'

import {ms} from '../../../src/utils/layout.utils'
import {pad} from '../../../src/utils/stringHelpers'

import {useTheme} from '../../../src/theme/appTheme'

const yearBase = 2000

interface Props {
  readonly selectedDate?: number
  readonly onDateSelected: (ts?: number) => void
}

interface State {
  day?: number
  month?: number
  year?: number
  isDayValid?: boolean
  isMonthValid?: boolean
  isYearValid?: boolean
}

const isStateDateValid = (state: State) => {
  if (!state.day || !state.month || !state.year) return true
  if (!state.isDayValid || !state.isMonthValid || !state.isYearValid)
    return false
  return true
}

const getFormattedValues = (
  state: State,
): {
  day: string
  month: string
  year: string
} => {
  return {
    day: state.day ? pad(state.day, 2) : '',
    month: state.month ? pad(state.month, 2) : '',
    year: state.year ? `${state.year}` : '',
  }
}

const isStateDateFilled = (state: State) => {
  return (
    Number.isInteger(state.day) &&
    Number.isInteger(state.month) &&
    Number.isInteger(state.year)
  )
}

const InlineDatePickerWeb: React.FC<Props> = (props) => {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const dayInputRef = useRef<TextInput>(null)
  const monthRef = useRef<TextInput>(null)
  const yearRef = useRef<TextInput>(null)

  const [state, setState] = useState<State>(() => {
    const date = props.selectedDate ? moment(props.selectedDate) : undefined
    return date
      ? {
          day: date.date(),
          month: date.month() + 1,
          year: date.year() - yearBase,
          isDayValid: true,
          isMonthValid: true,
          isYearValid: true,
        }
      : {}
  })
  const initialValues = useMemo(() => getFormattedValues(state), [])
  const dayValueRef = useRef<string>(initialValues.day)
  const monthValueRef = useRef<string>(initialValues.month)
  const yearValueRef = useRef<string>(initialValues.year)

  useEffect(() => {
    dayInputRef.current!.focus()
  }, [])

  const validateAndUpdate = () => {
    const day =
      dayValueRef.current.length > 0 ? Number(dayValueRef.current) : undefined
    const month =
      monthValueRef.current.length > 0
        ? Number(monthValueRef.current)
        : undefined
    const year =
      yearValueRef.current.length > 0
        ? yearBase + Number(yearValueRef.current)
        : undefined
    let isDayValid =
      day === undefined || (Number.isInteger(day) && day > 0 && day <= 31)
    let isMonthValid =
      month === undefined ||
      (Number.isInteger(month) && month > 0 && month <= 12)
    let isYearValid = year === undefined || Number.isInteger(year)

    if (isYearValid && isMonthValid && isDayValid && day && month && year) {
      const maxDays = moment(
        `01${pad(month, 2)}${year}`,
        'DDMMYYYY',
      ).daysInMonth()
      isDayValid = isDayValid && day <= maxDays
    }
    const next = {
      ...state,
      isYearValid,
      isMonthValid,
      isDayValid,
      day,
      month,
      year,
    }
    setState(next)
    if (isStateDateFilled(next) && isStateDateValid(next)) {
      const dateStr = `${pad(next.day!, 2)}${pad(next.month!, 2)}${next.year}`
      props.onDateSelected(moment(dateStr, 'DDMMYYYY').valueOf())
      return
    }
    props.onDateSelected(undefined)
  }

  const getFieldColor = (isValid?: boolean) => {
    return isValid ?? true ? {} : {color: colors.warning}
  }

  const onInputLayout = (_: LayoutChangeEvent) => {
    dayInputRef.current!.focus()
  }

  const dayStyle = getFieldColor(state.isDayValid)
  const monthStyle = getFieldColor(state.isMonthValid)
  const yearStyle = getFieldColor(state.isYearValid)

  return (
    <Horizontal>
      <Vertical style={styles.inputContainer}>
        <AppText style={[styles.text, {color: colors.thirdBlack}]}>
          {t('day')}
        </AppText>
        <AppTextInput
          ref={dayInputRef}
          style={[styles.input, dayStyle]}
          maxLength={2}
          onLayout={onInputLayout}
          value={dayValueRef.current}
          onChangeText={(text) => {
            dayValueRef.current = text
            if (text.length > 1) {
              monthRef.current?.focus()
            }
            validateAndUpdate()
          }}
          keyboardType={'numeric'}
          selectTextOnFocus={true}
        />
      </Vertical>
      <Vertical style={styles.inputContainer}>
        <AppText style={[styles.text, {color: colors.thirdBlack}]}>
          {t('month')}
        </AppText>
        <AppTextInput
          ref={monthRef}
          style={[styles.input, monthStyle]}
          maxLength={2}
          value={monthValueRef.current}
          onChangeText={(text) => {
            monthValueRef.current = text
            if (text.length > 1) {
              yearRef.current!.focus()
            }
            validateAndUpdate()
          }}
          selectTextOnFocus={true}
        />
      </Vertical>
      <Vertical style={styles.inputContainer}>
        <AppText style={[styles.text, {color: colors.thirdBlack}]}>
          {t('year')}
        </AppText>
        <AppTextInput
          ref={yearRef}
          style={[styles.input, yearStyle]}
          maxLength={2}
          value={yearValueRef.current}
          onChangeText={(text) => {
            yearValueRef.current = text
            if (text.length > 1) {
              yearRef.current?.blur()
            }
            validateAndUpdate()
          }}
          selectTextOnFocus={true}
        />
      </Vertical>
    </Horizontal>
  )
}

export default memo(InlineDatePickerWeb)

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
  input: {
    height: ms(52),
    marginTop: ms(8),
    paddingHorizontal: ms(16),
    fontSize: ms(17),
    backgroundColor: 'white',
    borderRadius: ms(8),
    maxWidth: ms(52),
  },
})

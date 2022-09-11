import React from 'react'
import {View} from 'react-native'

interface Props {
  locale?: string
  mode?: 'date' | 'time' | 'datetime'
  date?: Date
  onDateChange: (date: Date) => void
  is24hourSource?: 'locale' | 'device'
  minuteInterval?: 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30
}

const DatePickerWeb: React.FC<Props> = () => {
  return <View>{'Date picker mock'}</View>
}

export default DatePickerWeb

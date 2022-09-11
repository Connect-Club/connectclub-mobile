import moment from 'moment'
import React, {memo, useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {Keyboard, Platform, StyleSheet, View} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import {commonStyles, useTheme} from '../../../theme/appTheme'
import {getCreateEventDate} from '../../../utils/date.utils'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import {clearWindowFocus} from '../../common/DecorConfigModule'
import {DatePicker} from '../../webSafeImports/webSafeImports'

interface Props {
  readonly selectedDate: Date
  readonly setSelectedDate: (date: Date) => void

  readonly selectedTime: Date
  readonly setSelectedTime: (date: Date) => void

  readonly onSelectDateExternal: () => void
  readonly onSelectTimeExternal: () => void
}

const dateTimeViewHeight = Platform.OS === 'ios' ? 216 : 180
const InlineDatePickerView: React.FC<Props> = ({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  onSelectDateExternal,
  onSelectTimeExternal,
}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()

  const dateViewSharedValue = useSharedValue(0)
  const timeViewSharedValue = useSharedValue(0)

  const dateViewStyle = useAnimatedStyle(() => ({
    height: withTiming(dateViewSharedValue.value * dateTimeViewHeight),
    opacity: withTiming(dateViewSharedValue.value),
  }))

  const timeViewStyle = useAnimatedStyle(() => ({
    height: withTiming(timeViewSharedValue.value * dateTimeViewHeight),
    opacity: withTiming(timeViewSharedValue.value),
  }))

  const onDateToggle = useCallback(() => {
    if (Platform.OS === 'web') return onSelectDateExternal()

    const wasVisible = dateViewSharedValue.value > 0
    dateViewSharedValue.value = wasVisible ? 0 : 1
    if (timeViewSharedValue.value > 0) {
      timeViewSharedValue.value = 0
    }
    if (wasVisible) {
      clearWindowFocus()
      Keyboard.dismiss()
    }
  }, [dateViewSharedValue, timeViewSharedValue])

  const onTimeToggle = useCallback(() => {
    if (Platform.OS === 'web') return onSelectTimeExternal()

    const wasVisible = timeViewSharedValue.value > 0
    timeViewSharedValue.value = wasVisible ? 0 : 1
    if (dateViewSharedValue.value > 0) {
      dateViewSharedValue.value = 0
    }

    if (wasVisible) {
      clearWindowFocus()
      Keyboard.dismiss()
    }
  }, [dateViewSharedValue, timeViewSharedValue])

  return (
    <View style={[styles.base, {backgroundColor: colors.floatingBackground}]}>
      <AppTouchableOpacity style={styles.line} onPress={onDateToggle}>
        <AppText style={styles.textStyle}>{t('date')}</AppText>
        <AppText style={[styles.dateStyle, {color: colors.secondaryBodyText}]}>
          {getCreateEventDate(t, selectedDate.getTime())}
        </AppText>
      </AppTouchableOpacity>
      {Platform.OS !== 'web' && (
        <Animated.View
          style={[
            commonStyles.flexCenter,
            commonStyles.flexOne,
            dateViewStyle,
          ]}>
          <DatePicker
            locale={'en'}
            mode={'date'}
            date={selectedDate}
            onDateChange={setSelectedDate}
          />
        </Animated.View>
      )}

      <View
        style={[styles.lineSeparator, {borderBottomColor: colors.separator}]}
      />

      <AppTouchableOpacity style={styles.line} onPress={onTimeToggle}>
        <AppText style={styles.textStyle}>{t('time')}</AppText>
        <AppText style={[styles.dateStyle, {color: colors.secondaryBodyText}]}>
          {moment(selectedTime).format('LT')}
        </AppText>
      </AppTouchableOpacity>
      {Platform.OS !== 'web' && (
        <Animated.View
          style={[
            commonStyles.flexCenter,
            commonStyles.flexOne,
            timeViewStyle,
          ]}>
          <DatePicker
            locale={moment().locale()}
            is24hourSource={'locale'}
            mode={'time'}
            minuteInterval={5}
            date={selectedTime}
            onDateChange={setSelectedTime}
          />
        </Animated.View>
      )}
    </View>
  )
}

export default memo(InlineDatePickerView)

const styles = StyleSheet.create({
  base: {
    minHeight: ms(48),
    marginTop: ms(24),
    marginHorizontal: ms(16),
    borderRadius: ms(8),
    overflow: 'hidden',
    flexDirection: 'column',
  },

  textStyle: {
    fontSize: ms(17),
    flex: 1,
  },

  dateStyle: {
    fontSize: ms(17),
  },

  lineSeparator: {
    borderBottomWidth: ms(1),
    marginHorizontal: ms(16),
  },

  line: {
    zIndex: 2,
    paddingHorizontal: ms(16),
    flexDirection: 'row',
    height: ms(56),
    alignItems: 'center',
  },
})

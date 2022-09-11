import Picker from '@dzhey/react-native-wheel-picker'
import React, {memo, useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {
  Modal,
  Platform,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
} from 'react-native'

import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Horizontal from '../../common/Horizontal'

interface Props {
  readonly isVisible: boolean
  readonly isTimerActive: boolean
  readonly onSelectorDismiss: () => void
  readonly minValue: number
  readonly onMinChanged: (value: number) => void
  readonly secValue: number
  readonly onSecChanged: (value: number) => void
  readonly onStartTimerPress: () => void
  readonly onStopTimerPress: () => void
  readonly onCancelPress: () => void
}

const PickerItem = Picker.Item

const minutes = [...Array(60)]
const secondsFrom10 = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55]
const secondsFrom0 = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55]

const DurationPickerModal: React.FC<Props> = ({
  isVisible,
  isTimerActive,
  onSelectorDismiss,
  minValue,
  onMinChanged,
  secValue,
  onSecChanged,
  onStartTimerPress,
  onStopTimerPress,
  onCancelPress,
}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  const [seconds, setSeconds] = useState(() => secondsFrom10)

  const isShowStartButton = !isTimerActive
  const itemStyle: StyleProp<TextStyle> = {
    color: colors.bodyText,
    fontSize: ms(24),
    lineHeight: ms(30),
    textAlign: 'left',
  }
  const textPrefix = Platform.OS === 'ios' ? '   ' : ''
  const textSuffix = Platform.OS === 'ios' ? '' : '    '

  useEffect(() => {
    if (isVisible) onMinChangedInternal(minValue)
  }, [isVisible])

  const onMinChangedInternal = (e: number) => {
    onMinChanged(e)
    const s = e === 0 ? secondsFrom10 : secondsFrom0
    if (e === 0 && secValue < 10) onSecChanged(10)
    setSeconds(s)
  }

  return (
    <Modal
      visible={isVisible}
      animationType={'fade'}
      onDismiss={onSelectorDismiss}
      onRequestClose={onSelectorDismiss}
      statusBarTranslucent={true}
      transparent={true}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <AppText style={[styles.modalText, {color: colors.bodyText}]}>
            {isTimerActive ? t('titleStopTimer') : t('titleSetTimer')}
          </AppText>
          {!isTimerActive && (
            <Horizontal style={styles.pickersContainer}>
              <Picker<number>
                selectedValue={minValue}
                curved
                indicator
                onValueChange={onMinChangedInternal}
                itemStyle={itemStyle}
                indicatorColor='#000000'
                indicatorSize={ms(1)}
                style={styles.pickerStyle}>
                {minutes.map((_, i) => {
                  const item = i
                  return (
                    <PickerItem
                      label={`${textPrefix}${item}${textSuffix}`}
                      key={item}
                      value={item}
                    />
                  )
                })}
              </Picker>
              <AppText
                style={[styles.selectorLabelMin, {color: colors.bodyText}]}>
                {t('min')}
              </AppText>
              <Picker<number>
                selectedValue={secValue}
                curved
                indicator
                onValueChange={onSecChanged}
                itemStyle={itemStyle}
                indicatorColor='#000000'
                indicatorSize={ms(1)}
                style={styles.pickerStyle}>
                {seconds.map((i) => {
                  const item = i
                  return (
                    <PickerItem
                      label={`${textPrefix}${item}${textSuffix}`}
                      key={item}
                      value={item}
                    />
                  )
                })}
              </Picker>
              <AppText
                style={[styles.selectorLabelSec, {color: colors.bodyText}]}>
                {t('sec')}
              </AppText>
            </Horizontal>
          )}
          <Horizontal>
            <AppTouchableOpacity
              style={[styles.button, {borderEndWidth: 1}]}
              onPress={onCancelPress}>
              <AppText
                style={[styles.buttonText, {color: colors.primaryClickable}]}>
                {t('cancelButton')}
              </AppText>
            </AppTouchableOpacity>
            {isShowStartButton && (
              <AppTouchableOpacity
                style={styles.button}
                onPress={onStartTimerPress}>
                <AppText
                  style={[
                    styles.buttonText,
                    {fontWeight: 'bold', color: colors.primaryClickable},
                  ]}>
                  {t('startButton')}
                </AppText>
              </AppTouchableOpacity>
            )}
            {!isShowStartButton && (
              <AppTouchableOpacity
                style={styles.button}
                onPress={onStopTimerPress}>
                <AppText
                  style={[
                    styles.buttonText,
                    {fontWeight: 'bold', color: colors.warning},
                  ]}>
                  {t('stopButton')}
                </AppText>
              </AppTouchableOpacity>
            )}
          </Horizontal>
        </View>
      </View>
    </Modal>
  )
}

export default memo(DurationPickerModal)

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  modalView: {
    width: ms(271),
    margin: ms(20),
    backgroundColor: 'white',
    borderRadius: ms(14),
    paddingTop: ms(20),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: ms(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: ms(4),
    elevation: 5,
  },
  button: {
    flex: 1,
    paddingVertical: ms(12),
    borderColor: 'rgba(0, 0, 0, 0.08)',
    borderWidth: 0,
    borderTopWidth: ms(1),
  },
  buttonText: {
    textAlign: 'center',
    fontSize: ms(17),
  },
  modalText: {
    marginBottom: ms(20),
    textAlign: 'center',
    fontSize: ms(17),
    fontWeight: 'bold',
  },
  pickersContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  pickerStyle: {
    flex: 1,
    ...Platform.select({
      android: {
        marginTop: ms(12),
        marginBottom: ms(12),
        height: ms(168),
      },
    }),
  },
  selectorLabelMin: {
    fontSize: ms(20),
    lineHeight: ms(24),
    position: 'absolute',
    start: '25%',
    marginStart: ms(8),
    marginTop: Platform.OS === 'android' ? -ms(10) : 0,
  },
  selectorLabelSec: {
    fontSize: ms(20),
    lineHeight: ms(24),
    position: 'absolute',
    end: ms(28),
    marginTop: Platform.OS === 'android' ? -10 : 0,
  },
})

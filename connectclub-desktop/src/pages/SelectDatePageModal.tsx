import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import React, {useCallback, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import FlexSpace from '../../../src/components/common/FlexSpace'
import Spacer from '../../../src/components/common/Spacer'
import WebModalHeader from '../../../src/components/common/WebModalHeader'
import {AppModal} from '../../../src/components/webSafeImports/webSafeImports'

import {ms} from '../../../src/utils/layout.utils'

import InlineDatePickerWeb from '../components/InlineDatePickerWeb'
import InlineTimePickerWeb from '../components/InlineTimePickerWeb'

type SelectorType = 'date' | 'time'

type ScreenRouteProp = RouteProp<
  {
    Screen: {
      currentTs?: number
      backTo: string
      selectorType?: SelectorType
      navigationRoot?: string
    }
  },
  'Screen'
>

const SelectDatePageModal: React.FC = () => {
  const {params} = useRoute<ScreenRouteProp>()
  const navigation = useNavigation()
  const {t} = useTranslation()
  const selectedDateTimeTs = useRef<number | undefined>(params.currentTs)
  const type = params.selectorType ?? 'date'

  const onDateSelected = useCallback((ts?: number) => {
    selectedDateTimeTs.current = ts
  }, [])

  const onGoBackPress = useCallback(() => {
    if (!selectedDateTimeTs.current) return navigation.goBack()
    switch (type) {
      case 'date':
        return navigation.navigate(params.backTo, {
          selectedDateTs: selectedDateTimeTs.current,
        })
      case 'time':
        return navigation.navigate(params.backTo, {
          selectedTimeTs: selectedDateTimeTs.current,
        })
    }
  }, [])

  const renderHeader = () => {
    return (
      <WebModalHeader
        title={t(type === 'date' ? 'createEventDate' : 'createEventTime')}
        navigationAction={'back'}
        onNavigationAction={onGoBackPress}
      />
    )
  }

  return (
    <AppModal
      visible
      navigationRoot={params?.navigationRoot}
      transparent={false}
      animationType={'fade'}
      header={renderHeader()}
      contentStyle={styles.content}
      containerStyle={styles.container}>
      <Spacer vertical={ms(70)} />
      <View style={[styles.content]}>
        {type === 'date' && (
          <InlineDatePickerWeb
            selectedDate={params.currentTs}
            onDateSelected={onDateSelected}
          />
        )}
        {type === 'time' && (
          <InlineTimePickerWeb
            selectedDate={params.currentTs}
            onDateTimeSelected={onDateSelected}
          />
        )}
      </View>
      <Spacer vertical={ms(108)} />
      <FlexSpace />
    </AppModal>
  )
}

export default SelectDatePageModal

const styles = StyleSheet.create({
  container: {
    top: '29%',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 0,
  },
})

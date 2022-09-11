import React, {useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {ActivityIndicator, StyleSheet, View} from 'react-native'

import {appEventEmitter} from '../../appEventEmitter'
import {commonStyles, useTheme} from '../../theme/appTheme'
import {alert} from '../webSafeImports/webSafeImports'

interface Props {}

const AppFullWindowLoading: React.FC<Props> = () => {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const loading = appEventEmitter.once('loading', setVisible)
    const error = appEventEmitter.once('error', (err: string) => {
      alert(t(err))
      setVisible(false)
    })
    return () => {
      loading()
      error()
    }
  }, [])

  if (!visible) return null

  return (
    <View
      style={[
        StyleSheet.absoluteFillObject,
        commonStyles.flexCenter,
        {backgroundColor: 'rgba(0, 0, 0, 0.3)', zIndex: 1000},
      ]}>
      <ActivityIndicator
        animating={true}
        size={'large'}
        color={colors.accentPrimary}
      />
    </View>
  )
}

export default AppFullWindowLoading

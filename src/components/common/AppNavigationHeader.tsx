import {useNavigation} from '@react-navigation/native'
import {HeaderTitle} from '@react-navigation/stack'
import React, {useCallback} from 'react'
import {StyleSheet, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {commonStyles, makeTextStyle, useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import {AppNavigationBackButton} from '../AppNavigationBackButton'
import AppText from './AppText'
import {clearWindowFocus} from './DecorConfigModule'
import FlexSpace from './FlexSpace'
import Horizontal from './Horizontal'
import Vertical from './Vertical'

export const appNavigationHeaderHeight = ms(56)

interface Props {
  readonly topInset?: boolean
  readonly headerLeft?: React.ReactElement
  readonly headerRight?: React.ReactElement
  readonly title?: string
  readonly subtitle?: string
  readonly accessibilityLabel?: string
}

const AppNavigationHeader: React.FC<Props> = (props) => {
  const inset = useSafeAreaInsets()
  const topInset = props.topInset ? inset.top : ms(8)
  const navigation = useNavigation()
  const {colors} = useTheme()
  const onGoBack = useCallback(() => {
    clearWindowFocus()
    navigation.goBack()
  }, [navigation])

  const horizontalAlign = props.subtitle
    ? {paddingTop: ms(2)}
    : commonStyles.alignCenter

  return (
    <View
      style={[
        styles.base,
        {
          height: appNavigationHeaderHeight,
          marginTop: topInset,
          backgroundColor: colors.systemBackground,
        },
      ]}
      accessibilityLabel={props.accessibilityLabel}>
      <Horizontal style={[styles.horizontal, horizontalAlign]}>
        <Vertical style={styles.headerTitleContent}>
          {!!props.title && (
            <HeaderTitle style={styles.headerTitle}>{props.title}</HeaderTitle>
          )}
          {!!props.subtitle && (
            <AppText
              style={[
                styles.headerSubtitle,
                {color: colors.secondaryBodyText},
              ]}>
              {props.subtitle}
            </AppText>
          )}
        </Vertical>
        {!props.headerLeft && navigation.canGoBack() && (
          <AppNavigationBackButton onPress={onGoBack} />
        )}
        {!!props.headerLeft && (
          <View style={styles.headerLeft}>{props.headerLeft}</View>
        )}
        <FlexSpace />
        {!!props.headerRight && (
          <View style={styles.headerRight}>{props.headerRight}</View>
        )}
      </Horizontal>
    </View>
  )
}

export default AppNavigationHeader

const styles = StyleSheet.create({
  base: {
    width: '100%',
    flexDirection: 'column',
  },

  horizontal: {
    height: ms(56),
  },

  headerRight: {
    marginEnd: ms(8),
  },

  headerLeft: {
    marginStart: ms(8),
  },

  headerTitleContent: {
    position: 'absolute',
    left: 0,
    right: 0,
    flex: 1,
  },
  headerTitle: {
    textAlign: 'center',
  },
  headerSubtitle: {
    ...makeTextStyle(12, 16),
    textAlign: 'center',
  },
})

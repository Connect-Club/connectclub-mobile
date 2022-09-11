import {useNavigation} from '@react-navigation/native'
import React, {useMemo} from 'react'
import {StyleSheet, View} from 'react-native'

import {useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import {AppNavigationBackButton} from '../AppNavigationBackButton'
import CloseButton from '../screens/startRoom/CloseButton'
import AppText from './AppText'
import FlexSpace from './FlexSpace'
import Horizontal from './Horizontal'
import Vertical from './Vertical'

type NavgiationAction = 'back' | 'close'

interface Props {
  readonly headerLeft?: React.ReactElement
  readonly headerRight?: React.ReactElement
  readonly title?: string
  readonly subtitle?: string
  readonly navigationAction?: NavgiationAction
  readonly onNavigationAction?: () => void
  readonly isVisible?: boolean
}

const WebModalHeader: React.FC<Props> = (props) => {
  const navigation = useNavigation()
  const {colors} = useTheme()
  const isVisible = props.isVisible ?? true
  const onNavigationPress = () => {
    if (props.onNavigationAction) return props.onNavigationAction()
    navigation.goBack()
  }
  const headerLeft = useMemo(() => {
    if (props.headerLeft) return props.headerLeft
    switch (props.navigationAction) {
      case 'back':
        return <AppNavigationBackButton onPress={onNavigationPress} />
      case 'close':
        return (
          <CloseButton
            onClosePress={onNavigationPress}
            style={styles.closeButton}
          />
        )
      default:
        if (navigation.canGoBack()) {
          return <AppNavigationBackButton onPress={onNavigationPress} />
        }
        return
    }
  }, [props.headerLeft, props.navigationAction])

  if (!isVisible) return null

  return (
    <View style={styles.base}>
      <Horizontal style={styles.horizontal}>
        <Vertical style={styles.titleContainer}>
          {!!props.title && (
            <AppText style={styles.headerTitle}>{props.title}</AppText>
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
        {!!headerLeft && <View style={styles.headerLeft}>{headerLeft}</View>}
        <FlexSpace />
        {!!props.headerRight && (
          <View style={styles.headerRight}>{props.headerRight}</View>
        )}
      </Horizontal>
    </View>
  )
}

export default WebModalHeader
export type {Props as WebModalHeaderProps}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    height: ms(88),
    flexDirection: 'column',
    backgroundColor: 'white',
    borderTopLeftRadius: ms(12),
    borderTopRightRadius: ms(12),
    borderBottomColor: '#DDD',
    borderBottomWidth: 1,
  },

  horizontal: {
    alignItems: 'center',
    height: '100%',
  },

  headerRight: {
    marginEnd: ms(8),
  },

  headerLeft: {
    marginStart: ms(8),
  },

  titleContainer: {
    position: 'absolute',
    width: '100%',
  },

  headerTitle: {
    textAlign: 'center',
    fontSize: ms(24),
    fontWeight: '700',
  },

  headerSubtitle: {
    fontWeight: '400',
    fontSize: ms(12),
    textAlign: 'center',
    marginTop: ms(6),
  },

  closeButton: {
    marginStart: ms(16),
  },
})

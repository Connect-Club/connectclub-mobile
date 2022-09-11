import React, {memo, PropsWithChildren, useCallback, useRef} from 'react'
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'

import {Unknown} from '../../models'
import {commonStyles, useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import {FadeViewOnStart} from '../screens/startRoom/FadeViewOnStart'
import {RevealView} from './anim/RevealView'
import TryAgainView from './TryAgainView'

type Props = {
  readonly onRetry?: () => void
  readonly loading?: boolean
  readonly showLoader?: boolean
  readonly error?: any | Unknown
  readonly animated?: boolean
  readonly style?: StyleProp<ViewStyle>
}

const ContentLoadingView: React.FC<PropsWithChildren<Props>> = ({
  onRetry,
  loading,
  showLoader,
  error,
  style,
  animated,
  children,
}) => {
  const {colors} = useTheme()
  const renderCount = useRef(0)
  const onRetryInternal = useCallback(() => {
    onRetry?.()
  }, [onRetry])
  const isAnimated = animated ?? true

  if (!loading && !error) {
    return (
      <FadeViewOnStart
        style={[commonStyles.flexOne, style]}
        duration={120}
        animated={isAnimated && renderCount.current !== 0}>
        {children}
      </FadeViewOnStart>
    )
  }

  renderCount.current++

  return (
    <View style={[commonStyles.flexOne, style]}>
      <TryAgainView onRetry={onRetryInternal} visible={!loading && !!error} />
      <RevealView
        isRevealed={loading && (showLoader ?? true)}
        animType={'fade'}
        animDuration={120}>
        <ActivityIndicator
          style={styles.loader}
          animating={true}
          size={'large'}
          color={colors.accentPrimary}
        />
      </RevealView>
    </View>
  )
}

const styles = StyleSheet.create({
  loader: {
    paddingHorizontal: ms(8),
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
})

export default memo(ContentLoadingView)

import {observer} from 'mobx-react'
import React from 'react'
import {
  ActivityIndicator,
  Platform,
  StyleProp,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from 'react-native'

import {useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import AppText from './AppText'
import AppTouchableOpacity from './AppTouchableOpacity'
import Horizontal from './Horizontal'

interface Props {
  readonly title: string
  readonly onPress?: () => void
  readonly style?: StyleProp<ViewStyle>
  readonly textStyle?: StyleProp<TextStyle>
  readonly iconLeft?: React.ReactElement
  readonly color?: string
  readonly isEnabled?: boolean
  readonly accessibilityLabel?: string
  readonly isLoading?: boolean
  readonly activityIndicatorColor?: string
}

const SecondaryButton: React.FC<Props> = ({
  title,
  onPress,
  style,
  textStyle,
  color,
  iconLeft = undefined,
  activityIndicatorColor,
  isEnabled = true,
  accessibilityLabel,
  isLoading = false,
}) => {
  const {colors} = useTheme()

  return (
    <AppTouchableOpacity
      accessibilityLabel={accessibilityLabel}
      style={[styles.button, style, {opacity: isEnabled ? 1 : 0.6}]}
      activeOpacity={isEnabled ? 0.6 : 1}
      onPress={isEnabled ? onPress : undefined}>
      <Horizontal style={styles.container}>
        {isLoading && (
          <ActivityIndicator
            color={activityIndicatorColor ?? colors.accentPrimary}
          />
        )}
        {!isLoading && (
          <>
            {iconLeft}
            <AppText
              style={[
                styles.title,
                {color: color ?? colors.accentPrimary},
                textStyle,
              ]}>
              {title}
            </AppText>
          </>
        )}
      </Horizontal>
    </AppTouchableOpacity>
  )
}

export default observer(SecondaryButton)

const styles = StyleSheet.create({
  button: {
    height: ms(48),
    borderRadius: ms(6),
    justifyContent: 'center',
    paddingHorizontal: ms(16),
    minWidth: ms(180),
    ...Platform.select({
      web: {
        height: ms(18),
        paddingHorizontal: ms(8),
        marginLeft: '30%',
        marginRight: '30%',
        minWidth: ms(90),
      },
    }),
  },

  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: ms(15),
    fontWeight: '600',
  },
})

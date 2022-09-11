import React, {memo, PropsWithChildren, useMemo} from 'react'
import {
  Dimensions,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

const ACCESSIBILITY_ID = 'shareScreenHUD'
const {width: screenW, height: screenH} = Dimensions.get('window')

interface Props {
  readonly contentStyle?: StyleProp<ViewStyle>
}

const HudView: React.FC<PropsWithChildren<Props>> = (props) => {
  const inset = useSafeAreaInsets()

  const hudTransform: StyleProp<ViewStyle> | undefined = useMemo(
    () =>
      Platform.select({
        default: {height: screenH + inset.top},
        ios: undefined,
      }),
    [inset.top],
  )
  const contentTransform: StyleProp<ViewStyle> | undefined = useMemo(
    () =>
      Platform.select<StyleProp<ViewStyle>>({
        ios: {
          width: screenH,
          height: screenW,
          marginBottom: inset.bottom,
        },
        default: {
          transform: [{rotateZ: '90deg'}],
          width: screenH + inset.top,
          maxWidth: screenH + inset.top,
          height: screenW,
          maxHeight: screenW,
        },
      }),
    [inset.top],
  )

  return (
    <View
      accessibilityLabel={ACCESSIBILITY_ID}
      pointerEvents={'box-none'}
      style={[styles.hud, hudTransform]}>
      <View
        pointerEvents={'box-none'}
        style={[styles.hudContent, props.contentStyle, contentTransform]}>
        {props.children}
      </View>
    </View>
  )
}

export default memo(HudView)

const styles = StyleSheet.create({
  hud: {
    position: 'absolute',
    top: 0,
    start: 0,
    justifyContent: 'center',
    ...Platform.select({
      default: {width: screenW, height: screenH},
      ios: {width: screenH, height: screenW},
    }),
  },
  hudContent: {
    alignSelf: 'center',
    // at the bottom
    justifyContent: 'flex-end',
  },
})

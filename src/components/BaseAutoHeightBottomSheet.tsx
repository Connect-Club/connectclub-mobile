import {
  useBottomSheet,
  useBottomSheetDynamicSnapPoints,
} from '@gorhom/bottom-sheet'
import {BottomSheetBackdropProps} from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop'
import React, {forwardRef, PropsWithChildren, useCallback, useMemo} from 'react'
import {Platform, StyleSheet, View} from 'react-native'

import {commonStyles} from '../theme/appTheme'
import {isNative} from '../utils/device.utils'
import AppTouchableOpacity from './common/AppTouchableOpacity'
import {
  BottomSheet,
  BottomSheetBackdrop,
  BottomSheetView,
} from './webSafeImports/webSafeImports'

interface Props {
  readonly isVisible: boolean
  readonly title?: string
  readonly onClose?: () => void
  readonly transparent?: boolean
}

const TouchableBottomSheetBackdrop: React.FC = () => {
  const {close} = useBottomSheet()
  const onBackdropPress = useCallback(() => close(), [close])
  return (
    <AppTouchableOpacity
      style={StyleSheet.absoluteFill}
      onPress={onBackdropPress}
    />
  )
}

const BaseAutoHeightBottomSheet = forwardRef<
  BottomSheet,
  PropsWithChildren<Props>
>((props, ref) => {
  const initialSnapPoints = useMemo(() => ['CONTENT_HEIGHT'], [])
  const {
    animatedHandleHeight,
    animatedSnapPoints,

    animatedContentHeight,
    handleContentLayout,
  } = useBottomSheetDynamicSnapPoints(initialSnapPoints)

  const backdrop = useCallback(
    (p: BottomSheetBackdropProps) => {
      if (isNative && props.transparent) {
        return <TouchableBottomSheetBackdrop />
      }
      return (
        <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} />
      )
    },
    [props.transparent],
  )

  const ContentRoot = Platform.OS === 'android' ? View : BottomSheetView

  return (
    <BottomSheet
      ref={ref}
      style={commonStyles.commonBottomSheet}
      enablePanDownToClose
      animateOnMount
      onClose={props.onClose}
      snapPoints={animatedSnapPoints}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
      backdropComponent={backdrop}>
      <ContentRoot onLayout={handleContentLayout}>{props.children}</ContentRoot>
    </BottomSheet>
  )
})
export default BaseAutoHeightBottomSheet

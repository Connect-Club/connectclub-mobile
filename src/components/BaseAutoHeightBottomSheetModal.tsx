import {useBottomSheetDynamicSnapPoints} from '@gorhom/bottom-sheet'
import {BottomSheetBackdropProps} from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop'
import React, {forwardRef, PropsWithChildren, useCallback, useMemo} from 'react'

import {commonStyles} from '../theme/appTheme'
import {HandleComponent} from './screens/room/CommonBottomSheet'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
} from './webSafeImports/webSafeImports'

interface Props {
  readonly isVisible: boolean
  readonly title?: string
}

const BaseAutoHeightBottomSheetModal = forwardRef<
  BottomSheetModal,
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
    (p: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} />
    ),
    [],
  )

  return (
    <BottomSheetModal
      style={commonStyles.commonBottomSheet}
      ref={ref}
      snapPoints={animatedSnapPoints}
      handleHeight={animatedHandleHeight}
      contentHeight={animatedContentHeight}
      handleComponent={HandleComponent}
      backdropComponent={backdrop}>
      <BottomSheetView onLayout={handleContentLayout}>
        {props.children}
      </BottomSheetView>
    </BottomSheetModal>
  )
})
export default BaseAutoHeightBottomSheetModal

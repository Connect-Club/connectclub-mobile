import {BottomSheetBackdropProps} from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop'
import React, {forwardRef, memo, ReactNode, useEffect, useRef} from 'react'
import {
  BackHandler,
  NativeEventSubscription,
  StyleSheet,
  View,
} from 'react-native'

import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {
  BottomSheet,
  BottomSheetBackdrop,
} from '../../webSafeImports/webSafeImports'

interface Props {
  readonly isVisible: boolean
  readonly snaps: Array<any>
  readonly index?: number
  readonly children?: ReactNode
  readonly onChange?: ((index: number) => void) | undefined
  readonly showBackdrop?: boolean
  readonly registerBackPressHandler?: boolean
  readonly onClose?: () => void
}

export const BackgroundComponent: React.FC = memo(() => {
  const {colors} = useTheme()
  return (
    <View
      style={[
        styles.contentContainer,
        {backgroundColor: colors.systemBackground},
      ]}
    />
  )
})

export const HandleComponent = memo(() => {
  const {colors} = useTheme()
  return (
    <View style={[styles.closeLineContainer]}>
      <View style={[styles.closeLine, {backgroundColor: colors.thirdBlack}]} />
    </View>
  )
})

const backdrop = (p: BottomSheetBackdropProps) => {
  return (
    <BottomSheetBackdrop {...p} appearsOnIndex={0} disappearsOnIndex={-1} />
  )
}

const CommonBottomSheet = forwardRef<BottomSheet, Props>((props, ref) => {
  const backRef = useRef<NativeEventSubscription | null>(null)

  useEffect(() => {
    if (props.registerBackPressHandler !== true) return
    backRef.current?.remove()
    if (props.isVisible) {
      //@ts-ignore
      ref?.current?.snapTo(1, true)
      backRef.current = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          //@ts-ignore
          ref?.current?.snapTo(0, true)
          return true
        },
      )
    }
  }, [props.isVisible])

  return (
    <BottomSheet
      backdropComponent={props.showBackdrop ? backdrop : undefined}
      onChange={props.onChange}
      onClose={props.onClose}
      ref={ref}
      backgroundComponent={BackgroundComponent}
      handleComponent={HandleComponent}
      index={props.index ?? 0}
      snapPoints={props.snaps}
      enablePanDownToClose
      enableContentPanningGesture
      enableHandlePanningGesture>
      {props.children}
    </BottomSheet>
  )
})

export default CommonBottomSheet

const styles = StyleSheet.create({
  contentContainer: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: ms(10),
    borderTopRightRadius: ms(10),
  },
  closeLineContainer: {
    alignSelf: 'center',
  },
  closeLine: {
    width: ms(51),
    height: ms(4),
    borderRadius: ms(2),
    marginTop: ms(8),
  },
})

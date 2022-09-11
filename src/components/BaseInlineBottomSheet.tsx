import {BottomSheetBackdropProps} from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop'
import React, {PureComponent, ReactNode} from 'react'
import {
  BackHandler,
  Dimensions,
  Keyboard,
  Platform,
  StyleSheet,
  View,
} from 'react-native'
import {EdgeInsets, withSafeAreaInsets} from 'react-native-safe-area-context'
import {ms} from 'react-native-size-matters'

import {commonStyles} from '../theme/appTheme'
import KeyboardSpacer from '../utils/KeyboardSpacer'
import {getHeightFromPercent} from '../utils/safeArea.utils'
import {
  BackgroundComponent,
  HandleComponent,
} from './screens/room/CommonBottomSheet'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
} from './webSafeImports/webSafeImports'

const WINDOW_HEIGHT = Dimensions.get('window').height
interface Props {
  readonly children?: ReactNode
  readonly snaps?: Array<number | string>
  readonly onDismiss?: () => void
  readonly itemsCount?: number
  readonly itemHeight?: number
  readonly height?: number
  readonly insets?: EdgeInsets
  readonly handleKeyboard?: boolean
  readonly useCustomHandle?: boolean
}

interface State {
  snaps: Array<number | string>
  readonly keyboardHeight: number
  readonly isVisible: boolean
}

class BaseInlineBottomSheet extends PureComponent<Props, State> {
  ref = React.createRef<BottomSheetModal>()
  private reopenOnDismiss = false

  constructor(props: Props) {
    super(props)
    this.state = {snaps: ['90%'], isVisible: false, keyboardHeight: 0}
  }

  get bottomInset(): number {
    if (this.isKeyboardVisible) return ms(8)
    return this.props.insets?.bottom ?? 0
  }

  get useCustomHandle(): boolean {
    return this.props.useCustomHandle ?? true
  }

  private get isKeyboardVisible(): boolean {
    return this.state.keyboardHeight > 0
  }

  private get isHandleKeyboard() {
    return this.props.handleKeyboard === true
  }

  private onBackPress = (): boolean => {
    if (this.state.isVisible) {
      this.onDismiss()
      return true
    }
    return false
  }

  private onVisible = async () => {
    this.ref.current?.present()
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress)
  }

  present = () => {
    Keyboard.dismiss()
    this.setState({isVisible: true}, this.onVisible)
  }

  dismiss = () => {
    this.ref.current?.dismiss()
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
  }

  dismissAndReopen = () => {
    this.reopenOnDismiss = true
    this.ref.current?.dismiss()
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress)
  }

  onDismiss = () => {
    this.setState({isVisible: false, keyboardHeight: 0}, () => {
      if (this.reopenOnDismiss) {
        this.reopenOnDismiss = false
        return this.present()
      }
      this.props.onDismiss?.()
    })
  }

  calculateSnaps = (): Array<number | string> => {
    const inset = this.bottomInset
    let height: number = 0
    if (this.props.snaps && typeof this.props.snaps[0] !== 'string') {
      height = this.props.snaps[0] + inset
    } else if (this.props.itemsCount) {
      const itemHeight = this.props.itemHeight ?? 0
      height = this.props.itemsCount * itemHeight
    } else if (this.props.height) {
      height = this.props.height
    } else {
      return ['90%']
    }

    height += inset
    height += 32
    //height += this.bottomInset
    if (this.isKeyboardVisible) height += this.state.keyboardHeight
    if (WINDOW_HEIGHT - ms(100) < height) {
      height = getHeightFromPercent('90%')
    }
    return [height]
  }

  onKeyboardToggle = (space: number) => {
    if (Platform.OS === 'android') return
    this.setState({keyboardHeight: space})
  }

  renderBackdrop = (props: BottomSheetBackdropProps) => {
    return (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior={'close'}
      />
    )
  }

  render() {
    if (!this.state.isVisible) return null
    const snaps = this.calculateSnaps()

    return (
      <BottomSheetModal
        snapPoints={snaps}
        ref={this.ref}
        style={commonStyles.commonBottomSheet}
        onDismiss={this.onDismiss}
        backgroundComponent={BackgroundComponent}
        handleComponent={this.useCustomHandle ? HandleComponent : undefined}
        backdropComponent={this.renderBackdrop}>
        <View style={[styles.container, {marginBottom: this.bottomInset}]}>
          {this.props.children}
          {this.isHandleKeyboard && (
            <KeyboardSpacer onToggle={this.onKeyboardToggle} />
          )}
        </View>
      </BottomSheetModal>
    )
  }
}

export type AppBottomSheet = BaseInlineBottomSheet
export default withSafeAreaInsets(BaseInlineBottomSheet)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
  },
})

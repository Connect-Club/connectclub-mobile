import React from 'react'
import {
  Modal,
  StyleProp,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native'

import {PRIMARY_BACKGROUND} from '../../../theme/appTheme'
import {tabletContainerWidthLimit} from '../../../utils/tablet.consts'

interface Props {
  children: React.ReactNode
  snapPoints?: Array<number | string>
  onDismiss?: () => void
  style?: StyleProp<ViewStyle>
  backdropComponent?: React.FC<any> | null
  backgroundComponent?: React.FC<any> | null
  handleComponent?: React.FC<any> | null
  dismissOnPanDown?: boolean
  handleHeight?: number
  ref: any
}

interface State {
  isVisible: boolean
}

class BottomSheetModalWeb extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)

    this.state = {
      isVisible: false,
    }
  }

  present() {
    this.setState({isVisible: true})
  }

  dismiss() {
    this.setState({isVisible: false})
    this.props?.onDismiss?.()
  }

  render() {
    const {isVisible} = this.state

    return (
      <Modal
        onRequestClose={() => this.dismiss()}
        visible={isVisible}
        transparent>
        <TouchableWithoutFeedback onPress={() => this.dismiss()}>
          <View style={styles.container}>
            <TouchableWithoutFeedback>
              <View
                onStartShouldSetResponder={() => true}
                style={styles.content}>
                {this.props.children}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: PRIMARY_BACKGROUND,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    width: tabletContainerWidthLimit,
    minHeight: 100,
    maxHeight: '90%',
  },
})

export default BottomSheetModalWeb

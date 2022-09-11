import React from 'react'
import {
  Modal,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

import {PRIMARY_BACKGROUND} from '../../../theme/appTheme'
import {
  popupHeight,
  tabletContainerWidthLimit,
} from '../../../utils/tablet.consts'

interface Props {
  children: React.ReactNode
  backdropComponent?: React.FC<any> | null
  onChange?: (index: number) => void
  onClose?: () => void
  backgroundComponent?: React.FC<any> | null
  handleComponent?: React.FC<any> | null
  index?: number
  snapPoints: Array<number | string>
  enableContentPanningGesture: boolean
  enableHandlePanningGesture: boolean
  enablePanDownToClose?: boolean
  animateOnMount?: boolean
}

class BottomSheetWeb extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
  }

  close() {
    this.props.onClose?.()
  }

  render() {
    return (
      <Modal onRequestClose={this.props.onClose} visible transparent>
        <TouchableWithoutFeedback onPress={this.props.onClose}>
          <View style={styles.container}>
            <TouchableWithoutFeedback>
              <ScrollView
                onStartShouldSetResponder={() => true}
                style={styles.content}>
                {this.props.children}
              </ScrollView>
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
    maxHeight: popupHeight,
  },
})

export default BottomSheetWeb

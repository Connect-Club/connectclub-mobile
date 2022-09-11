import React from 'react'
import {Modal, StyleSheet, View} from 'react-native'

import AppIcon from '../../assets/AppIcon'
import {useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import AppTouchableOpacity from './AppTouchableOpacity'

interface PopupProps {
  readonly handleOnClose: () => void
  readonly isVisible: boolean
}

const FloatingPopupView: React.FC<PopupProps> = (props) => {
  const {colors} = useTheme()

  return (
    <Modal animationType='fade' transparent visible={props.isVisible}>
      <View
        style={[styles.container, {backgroundColor: colors.modalBackground}]}>
        <View style={[styles.wrapper, {backgroundColor: colors.skeleton}]}>
          <AppTouchableOpacity
            style={styles.closeIcon}
            onPress={props.handleOnClose}>
            <AppIcon type='icNavigationClose' tint={colors.thirdBlack} />
          </AppTouchableOpacity>
          {props.children && props.children}
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  wrapper: {
    paddingHorizontal: ms(16),
    paddingTop: ms(48),
    paddingBottom: ms(24),
    width: '90%',
    borderRadius: ms(8),
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    position: 'absolute',
    bottom: ms(54),
  },

  closeIcon: {
    position: 'absolute',
    right: ms(21),
    top: ms(21),
  },
})

export default FloatingPopupView

import React, {memo} from 'react'
import {StyleSheet, View} from 'react-native'

import {ToastParams} from '../../models'
import CustomImageToastView from './CustomImageToastView'

interface Props extends ToastParams {
  toastId: string
}

const JoinRequestApprovedToastView: React.FC<Props> = (p) => {
  return (
    <View accessibilityLabel={'JoinRequestApprovedToast'} style={styles.base}>
      <CustomImageToastView
        body={'🗣 ' + p.body}
        toastId={p.toastId}
        title={p.title}
        leftImage={p.leftImage}
        rightImage={p.rightImage}
      />
    </View>
  )
}

export default memo(JoinRequestApprovedToastView)

const styles = StyleSheet.create({
  base: {
    flexDirection: 'column',
  },
})

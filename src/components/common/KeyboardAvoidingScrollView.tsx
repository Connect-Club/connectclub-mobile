import React, {useState} from 'react'
import {ScrollViewProps} from 'react-native'

import {useBottomSafeArea} from '../../utils/safeArea.utils'
import {KeyboardAwareScrollView} from '../webSafeImports/webSafeImports'

interface Props extends ScrollViewProps {}

const KeyboardAvoidingScrollView: React.FC<Props> = (props) => {
  const inset = useBottomSafeArea()
  const [paddingBottom, setPaddingBottom] = useState(0)

  return (
    <KeyboardAwareScrollView
      {...props}
      keyboardDismissMode={'on-drag'}
      enableOnAndroid={true}
      keyboardShouldPersistTaps={'handled'}
      showsVerticalScrollIndicator={false}
      onKeyboardDidShow={(f: any) => {
        setPaddingBottom(f?.endCoordinates?.height ?? 0)
      }}
      onKeyboardDidHide={() => setPaddingBottom(0)}
      contentContainerStyle={[
        props.contentContainerStyle,
        {paddingBottom: inset + 16 + paddingBottom},
      ]}>
      {props.children}
    </KeyboardAwareScrollView>
  )
}

export default KeyboardAvoidingScrollView

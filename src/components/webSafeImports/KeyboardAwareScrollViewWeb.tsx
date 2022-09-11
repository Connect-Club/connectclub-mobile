import React from 'react'
import {ScrollView} from 'react-native'
import {ScrollViewProps} from 'react-native'

interface Props extends ScrollViewProps {
  enableOnAndroid?: boolean
  onKeyboardDidShow?: (frames: Object) => void
  onKeyboardDidHide?: (frames: Object) => void
  children: React.ReactNode
}

const KeyboardAwareScrollViewWeb: React.FC<Props> = ({children}) => {
  return <ScrollView>{children}</ScrollView>
}

export default KeyboardAwareScrollViewWeb

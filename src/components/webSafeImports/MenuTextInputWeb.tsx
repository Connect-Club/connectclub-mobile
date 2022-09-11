import React, {forwardRef} from 'react'
import {TextInput, TextInputProps, ViewProps} from 'react-native'

interface OwnProps {
  value?: string | null
  onLinkText: (text: string, location: number) => void
  multiline?: boolean
  placeholder?: string
  placeholderTextColor?: string
  linkTextColor?: string
  maxLength?: number
  maxHeight?: number
  indentRight?: number
  shouldDismissKeyboard?: boolean
}

type Props = ViewProps & OwnProps & TextInputProps

const MenuTextInput = forwardRef<TextInput, Props>((props, ref) => {
  return (
    <TextInput
      ref={ref}
      {...props}
      onChangeText={(e: any) => props.onChangeText?.(e)}
    />
  )
})
export default MenuTextInput

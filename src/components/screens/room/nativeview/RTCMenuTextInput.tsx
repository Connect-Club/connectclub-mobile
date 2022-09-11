import React, {forwardRef} from 'react'
import {
  requireNativeComponent,
  TextInput,
  TextInputProps,
  ViewProps,
} from 'react-native'

interface NativeProps {
  value?: string | null
  onLinkText: (text: string, location: number) => void
  multiline?: boolean
  placeholder?: string
  placeholderTextColor?: string
  linkTextColor?: string
  maxLength?: number
  maxHeight?: number
  shouldDismissKeyboard?: boolean
}

const RTCMenuTextInput = requireNativeComponent<typeof MenuTextInput>(
  'MenuTextInput',
)

type MenuTextInputProps = ViewProps & NativeProps & TextInputProps

const MenuTextInput = forwardRef<TextInput, MenuTextInputProps>(
  (props, ref) => {
    return (
      <RTCMenuTextInput
        //@ts-ignore
        ref={ref}
        {...props}
        //@ts-ignore
        onChangeText={(e: any) => props.onChangeText(e.nativeEvent.text)}
        //@ts-ignore
        onLinkText={(e: any) =>
          props.onLinkText(e.nativeEvent.text, e.nativeEvent.location)
        }
      />
    )
  },
)
export default MenuTextInput

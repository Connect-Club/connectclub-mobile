import React from 'react'
import {PickerItemProps, PickerProps, View} from 'react-native'

interface Props<T> extends PickerProps {}

const PickerWeb = <ItemValue extends any>(props: Props<ItemValue>) => {
  return <View>{'Picker mock'}</View>
}

interface ItemProps extends PickerItemProps {
  label: string
  value: any
}

const PickerItem = (props: ItemProps) => {
  return null
}

PickerWeb.Item = PickerItem

export default PickerWeb

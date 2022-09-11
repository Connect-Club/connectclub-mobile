import React from 'react'
import {FlatList, FlatListProps} from 'react-native'

interface Props<TItem> extends FlatListProps<TItem> {}

const BottomSheetFlatListWeb = <TItem extends any>(props: Props<TItem>) => {
  return <FlatList {...props} />
}

export default BottomSheetFlatListWeb

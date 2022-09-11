import {observer} from 'mobx-react'
import React, {useCallback} from 'react'
import {StyleProp, ViewStyle} from 'react-native'

import {LanguageModel} from '../../models'
import LanguageSelectorStore from '../../stores/LanguageSelectorStore'
import {isNative} from '../../utils/device.utils'
import LanguageSelectorItem from '../screens/languageSelectorScreen/LanguageSelectorItem'
import {BottomSheetFlatList} from '../webSafeImports/webSafeImports'
import BaseFlatList from './BaseFlatList'

interface Props {
  readonly style?: StyleProp<ViewStyle>
  readonly contentContainerStyle?: StyleProp<ViewStyle>
  readonly store: LanguageSelectorStore
  readonly onItemSelect: (item: LanguageModel) => void
  readonly forBottomSheet?: boolean
}

const langKeyExtractor = (model: LanguageModel) => model.id.toString()

const LanguageSelectorView: React.FC<Props> = (p) => {
  const renderItem = useCallback(
    ({item}) => (
      <LanguageSelectorItem
        item={item}
        store={p.store}
        onSelect={p.onItemSelect}
      />
    ),
    [p.store, p.onItemSelect],
  )

  const languages = p.store.items
  const ListComponent =
    p.forBottomSheet === true && isNative ? BottomSheetFlatList : BaseFlatList
  return (
    <ListComponent<LanguageModel>
      style={p.style}
      contentContainerStyle={p.contentContainerStyle}
      showsHorizontalScrollIndicator={false}
      data={languages}
      keyExtractor={langKeyExtractor}
      renderItem={renderItem}
    />
  )
}

export default observer(LanguageSelectorView)

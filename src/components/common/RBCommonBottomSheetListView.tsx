import React from 'react'
import {StyleSheet} from 'react-native'

import {useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import {useBottomSafeArea} from '../../utils/safeArea.utils'
import AppText from './AppText'
import AppTouchableOpacity from './AppTouchableOpacity'
import BaseFlatList from './BaseFlatList'

export interface CommonBottomSheetListItemModel {
  readonly id: number
  readonly title: string
}

interface Props {
  readonly items: Array<CommonBottomSheetListItemModel>
  readonly onPress: (item: CommonBottomSheetListItemModel) => void
}

const RBCommonBottomSheetListView: React.FC<Props> = ({items, onPress}) => {
  const {colors} = useTheme()
  const inset = useBottomSafeArea()

  const color = {color: colors.bodyText}

  return (
    <BaseFlatList
      data={items}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={{paddingBottom: inset + 16}}
      renderItem={({item}) => {
        return (
          <AppTouchableOpacity
            style={styles.listItem}
            onPress={() => onPress(item)}>
            <AppText style={[styles.listItemTitle, color]}>
              {item.title}
            </AppText>
          </AppTouchableOpacity>
        )
      }}
    />
  )
}

export default RBCommonBottomSheetListView

const styles = StyleSheet.create({
  listItem: {
    height: ms(56),
    paddingHorizontal: ms(16),
    justifyContent: 'center',
  },

  listItemTitle: {
    fontSize: ms(17),
  },
})

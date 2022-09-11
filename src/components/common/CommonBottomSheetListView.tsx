import React from 'react'
import {StyleProp, StyleSheet, TextStyle, View} from 'react-native'

import {useTheme} from '../../theme/appTheme'
import {ms} from '../../utils/layout.utils'
import {BottomSheetFlatList} from '../webSafeImports/webSafeImports'
import AppText from './AppText'
import AppTouchableOpacity from './AppTouchableOpacity'

export interface CommonBottomSheetListItemModel {
  readonly id: number
  readonly title: string
  readonly style?: StyleProp<TextStyle>
}

interface Props {
  readonly items: Array<CommonBottomSheetListItemModel>
  readonly onPress: (item: CommonBottomSheetListItemModel) => void
}

const CommonBottomSheetListView: React.FC<Props> = ({items, onPress}) => {
  const {colors} = useTheme()

  const color = {color: colors.bodyText}
  const borderStyle = {
    borderTopWidth: ms(1),
    borderTopColor: colors.separator,
  }

  return (
    <View style={styles.base}>
      <BottomSheetFlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({item, index}) => {
          return (
            <AppTouchableOpacity
              style={[styles.listItem, index === 0 ? {} : borderStyle]}
              onPress={() => onPress(item)}>
              <AppText style={[styles.listItemTitle, color, item.style]}>
                {item.title}
              </AppText>
            </AppTouchableOpacity>
          )
        }}
      />
    </View>
  )
}

export default CommonBottomSheetListView

const styles = StyleSheet.create({
  base: {
    flex: 1,
  },
  listItem: {
    height: ms(56),
    paddingHorizontal: ms(16),
    justifyContent: 'center',
  },

  listItemTitle: {
    fontSize: ms(17),
  },
})

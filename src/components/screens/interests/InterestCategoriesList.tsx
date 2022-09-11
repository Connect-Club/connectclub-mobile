import {observer} from 'mobx-react'
import React, {useContext, useEffect} from 'react'
import {StyleProp, StyleSheet, ViewStyle} from 'react-native'
import {FlatList} from 'react-native-gesture-handler'

import {InterestCategoryModel} from '../../../models'
import InterestsStore from '../../../stores/InterestsStore'
import {isWeb} from '../../../utils/device.utils'
import {ms} from '../../../utils/layout.utils'
import Topics from './Topics'

interface Props {
  readonly headerComponent?: React.ReactElement
  readonly contentStyle?: StyleProp<ViewStyle>
  readonly globalLoader?: boolean
  readonly standalone?: boolean
}

const keyExtractor = (item: InterestCategoryModel) => `${item.id}_${item.name}`
const InterestCategoriesList: React.FC<Props> = ({
  headerComponent,
  contentStyle,
  globalLoader = true,
  standalone = true,
}) => {
  const store = useContext(InterestsStore)

  useEffect(() => {
    if (standalone) {
      store.fetch(globalLoader)
      return () => store.cleanup()
    }
    return
  }, [])

  return (
    <FlatList
      style={styles.list}
      data={store.merged}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={contentStyle}
      ListHeaderComponent={headerComponent}
      keyExtractor={keyExtractor}
      renderItem={({item}) => {
        return <Topics category={item} />
      }}
    />
  )
}

export default observer(InterestCategoriesList)

const styles = StyleSheet.create({
  list: {
    flex: 1,
    paddingStart: isWeb ? ms(16) : 0,
  },

  section: {
    marginBottom: ms(32),
  },

  sectionTitle: {
    fontSize: ms(16),
    fontWeight: 'bold',
    marginBottom: ms(12),
    paddingHorizontal: ms(16),
    height: ms(32),
    lineHeight: ms(32),
  },
})

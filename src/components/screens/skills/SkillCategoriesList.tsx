import {observer} from 'mobx-react'
import React, {useContext, useEffect} from 'react'
import {StyleProp, StyleSheet, ViewStyle} from 'react-native'
import {FlatList} from 'react-native-gesture-handler'

import {SkillCategoryModel} from '../../../models'
import SkillsStore from '../../../stores/SkillsStore'
import {isWeb} from '../../../utils/device.utils'
import {ms} from '../../../utils/layout.utils'
import SkillTopics from './SkillTopics'

interface Props {
  readonly headerComponent?: React.ReactElement
  readonly contentStyle?: StyleProp<ViewStyle>
}

const keyExtractor = (item: SkillCategoryModel) => item.id.toString()
const SkillCategoriesList: React.FC<Props> = ({
  headerComponent,
  contentStyle,
}) => {
  const store = useContext(SkillsStore)

  useEffect(() => {
    store.fetch()
    return () => store.cleanup()
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
        return <SkillTopics category={item} />
      }}
    />
  )
}

export default observer(SkillCategoriesList)

const styles = StyleSheet.create({
  list: {
    width: '100%',
    height: '100%',
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

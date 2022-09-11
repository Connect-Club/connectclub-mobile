import React from 'react'
import {StyleSheet} from 'react-native'

import {InterestModel} from '../../../models'
import {ms} from '../../../utils/layout.utils'
import BaseFlatList from '../../common/BaseFlatList'
import Vertical from '../../common/Vertical'
import InterestListItem from './InterestListItem'

interface Props {
  readonly interests: Array<Array<InterestModel>>
}

const keyExtractor = (item: InterestModel) => item.id.toString()
const InterestsList: React.FC<Props> = ({interests}) => {
  return (
    <Vertical>
      {interests.map((items, index) => (
        <BaseFlatList<InterestModel>
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.content}
          key={index}
          data={items}
          keyExtractor={keyExtractor}
          renderItem={({item}) => {
            return <InterestListItem isSelectable={true} interest={item} />
          }}
        />
      ))}
    </Vertical>
  )
}

export default InterestsList

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: ms(16),
    marginBottom: ms(8),
  },
})

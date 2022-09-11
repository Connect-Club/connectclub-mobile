import {observer} from 'mobx-react'
import React, {useCallback} from 'react'
import {StyleSheet, View} from 'react-native'

import {InterestModel} from '../../../models'
import {CreateEventStore} from '../../../stores/CreateEventStore'
import {ms} from '../../../utils/layout.utils'
import {toastHelper} from '../../../utils/ToastHelper'
import InterestListItem from './InterestListItem'

interface Props {
  readonly store: CreateEventStore
}

const InlineInterestsList: React.FC<Props> = (p) => {
  const onToggle = useCallback(async (interest: InterestModel) => {
    const result = await p.store.toggleInterest(interest)
    if (result === 'limit') return toastHelper.interestsLimit()
  }, [])
  if (p.store.eventInterests.interests.length === 0) return null
  const selectedIds = p.store.selectedInterestsIds
  return (
    <View style={styles.interestsContainer}>
      {p.store.eventInterests.interests.map((interest) => {
        return (
          <InterestListItem
            key={interest.id}
            itemStyle={styles.interestItem}
            inverted={true}
            interest={interest}
            isSelectable={true}
            isSelected={selectedIds.includes(interest.id)}
            onToggle={onToggle}
          />
        )
      })}
    </View>
  )
}

export default observer(InlineInterestsList)

const styles = StyleSheet.create({
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: ms(16),
    paddingBottom: ms(16),
  },
  interestItem: {
    marginTop: ms(8),
  },
})

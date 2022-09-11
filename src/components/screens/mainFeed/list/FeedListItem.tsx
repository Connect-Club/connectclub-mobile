import React, {memo} from 'react'

import {MainFeedItemModel} from '../../../../models'
import {NetworkFeedListItem} from './NetworkFeedListItem'
import PublicFeedListItem from './PublicFeedListItem'

interface Props {
  readonly item: MainFeedItemModel
  readonly onPress: (item: MainFeedItemModel) => void
  readonly onDetailsPress: (item: MainFeedItemModel) => void
}

const FeedListItem: React.FC<Props> = ({item, onPress, onDetailsPress}) => {
  switch (item.draftType) {
    case 'private':
    case 'l_networking':
    case 's_networking':
    case 'gallery':
      return (
        <NetworkFeedListItem
          item={item}
          onPress={onPress}
          onDetailsPress={onDetailsPress}
        />
      )
    case 'public':
    case 'multiroom':
    case 'l_broadcasting':
    case 's_broadcasting':
      return (
        <PublicFeedListItem
          item={item}
          onPress={onPress}
          onDetailsPress={onDetailsPress}
        />
      )
    default:
      return (
        <PublicFeedListItem
          item={item}
          onPress={onPress}
          onDetailsPress={onDetailsPress}
        />
      )
  }
}

export default memo(FeedListItem)

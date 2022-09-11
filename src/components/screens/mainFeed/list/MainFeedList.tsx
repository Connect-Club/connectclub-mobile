import React, {memo} from 'react'
import {FlatList, ViewProps} from 'react-native'

import {MainFeedItemModel} from '../../../../models'
import {ms} from '../../../../utils/layout.utils'
import MainFeedEmptyView from '../MainFeedEmptyView'
import MainFeedListHeader from '../MainFeedListHeader'
import FeedListItem from './FeedListItem'
import {MainFeedEmptyListView} from './MainFeedEmptyListView'
import MainFeedListSkeletonView from './MainFeedListSkeletonView'

interface Props {
  readonly isFirstLoading: boolean
  readonly feed: Array<MainFeedItemModel>
  readonly paddingBottom: number
  readonly onPress: (item: MainFeedItemModel) => void
  readonly onDetailsPress: (item: MainFeedItemModel) => void
  readonly onRefresh: () => void
  readonly isRefreshing: boolean
  readonly onLoadMore: () => void
  readonly isCalendarEventsEmpty: boolean
}

const keyExtractor = (item: MainFeedItemModel) => item.roomPass
const MainFeedList: React.FC<Props & ViewProps> = ({
  style,
  isFirstLoading,
  feed,
  paddingBottom,
  onPress,
  onDetailsPress,
  onRefresh,
  isRefreshing,
  onLoadMore,
  children,
  isCalendarEventsEmpty,
}) => {
  if (isFirstLoading) return <MainFeedListSkeletonView />

  if (feed.length === 0 && isCalendarEventsEmpty) {
    return (
      <MainFeedEmptyView isRefreshing={isRefreshing} onRefresh={onRefresh} />
    )
  }

  if (feed.length === 0) {
    return (
      <MainFeedEmptyListView isRefreshing={isRefreshing} onRefresh={onRefresh}>
        <MainFeedListHeader children={children} />
      </MainFeedEmptyListView>
    )
  }

  return (
    <>
      <FlatList<MainFeedItemModel>
        style={style}
        initialNumToRender={20}
        onRefresh={onRefresh}
        refreshing={isRefreshing}
        onEndReached={onLoadMore}
        ListHeaderComponent={<MainFeedListHeader children={children} />}
        contentContainerStyle={{
          paddingHorizontal: ms(16),
          paddingBottom,
        }}
        data={feed}
        keyExtractor={keyExtractor}
        renderItem={({item}) => {
          return (
            <FeedListItem
              item={item}
              onPress={onPress}
              onDetailsPress={onDetailsPress}
            />
          )
        }}
      />
    </>
  )
}

export default memo(MainFeedList) as typeof MainFeedList

import {observer} from 'mobx-react'
import React, {useCallback, useEffect, useRef, useState} from 'react'
import {Platform, StyleProp, StyleSheet, ViewStyle} from 'react-native'

import {analytics} from '../../../Analytics'
import {UserModel} from '../../../models'
import {RecommendedPeopleStore} from '../../../stores/RecommendedPeopleStore'
import {useLogRenderCount} from '../../../utils/debug.utils'
import {bottomInset} from '../../../utils/inset.utils'
import {ms} from '../../../utils/layout.utils'
import {useBottomSafeArea} from '../../../utils/safeArea.utils'
import BaseFlatList from '../../common/BaseFlatList'
import {clearWindowFocus} from '../../common/DecorConfigModule'
import ListLoadMoreIndicator from '../../common/ListLoadMoreIndicator'
import NoSearchResultsView from '../../common/NoSearchResultsView'
import {useExploreContext} from '../explore/ExploreContext'

interface Props {
  readonly store: RecommendedPeopleStore
  readonly style?: StyleProp<ViewStyle>
  readonly isActivated: boolean
}

const RecommendedPeopleView: React.FC<Props> = ({
  store,
  style,
  isActivated,
}) => {
  const {renderUserItem} = useExploreContext()
  const inset = useBottomSafeArea()
  const listRef = useRef<BaseFlatList<UserModel> | null>(null)
  const [scrollTracked, setScrollTracked] = useState(false)

  useLogRenderCount('RecommendedPeopleView')

  const onEndReached = useCallback(() => {
    if (!store.searchMode) return
    store.loadMore()
  }, [])

  useEffect(() => {
    analytics.sendEvent('explore_recommended_people_screen', {})
  }, [])

  useEffect(() => {
    if (isActivated && store.list.length > 0) {
      store.loadMore()
    }
  }, [store, isActivated])

  if (!store.searchStore.isInProgress && store.searchStore.list.length === 0) {
    if (store.searchStore.query?.length) {
      return <NoSearchResultsView query={store.searchStore.query} />
    }
  }

  const trackScrollRecommends = () => {
    if (!scrollTracked) {
      analytics.sendEvent('explore_recommended_people_scroll', {})
      setScrollTracked(true)
    }
  }

  return (
    <>
      <BaseFlatList<UserModel>
        ref={listRef}
        ListFooterComponent={
          <ListLoadMoreIndicator visible={store.isLoadingMore} />
        }
        onStartShouldSetResponder={() => !listRef.current?.canScroll}
        onTouchMove={clearWindowFocus}
        data={store.list}
        contentContainerStyle={{paddingBottom: bottomInset(inset)}}
        keyboardDismissMode={Platform.OS === 'ios' ? 'on-drag' : 'none'}
        onScrollBeginDrag={clearWindowFocus}
        onScrollEndDrag={trackScrollRecommends}
        keyboardShouldPersistTaps={'always'}
        style={[styles.flatList, style]}
        refreshing={store.isRefreshing}
        onRefresh={store.refresh}
        onEndReached={onEndReached}
        renderItem={renderUserItem}
      />
    </>
  )
}

const styles = StyleSheet.create({
  flatList: {
    paddingHorizontal: ms(16),
    height: '100%',
  },
})

export default observer(RecommendedPeopleView)

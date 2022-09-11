import {observer} from 'mobx-react'
import React, {useCallback, useEffect, useRef} from 'react'
import {Platform, StyleProp, StyleSheet, ViewStyle} from 'react-native'

import {analytics} from '../../../Analytics'
import {ClubModel} from '../../../models'
import {RecommendedClubsStore} from '../../../stores/ExploreSearchStore'
import {useLogRenderCount} from '../../../utils/debug.utils'
import {bottomInset} from '../../../utils/inset.utils'
import {ms} from '../../../utils/layout.utils'
import {useBottomSafeArea} from '../../../utils/safeArea.utils'
import BaseFlatList from '../../common/BaseFlatList'
import {clearWindowFocus} from '../../common/DecorConfigModule'
import ListLoadMoreIndicator from '../../common/ListLoadMoreIndicator'
import NoSearchResultsView from '../../common/NoSearchResultsView'
import {useExploreContext} from './ExploreContext'

interface Props {
  readonly store: RecommendedClubsStore
  readonly style?: StyleProp<ViewStyle>
  readonly isActivated: boolean
}

const RecommendedClubsView: React.FC<Props> = ({store, style, isActivated}) => {
  const {renderClubListItem} = useExploreContext()
  const inset = useBottomSafeArea()
  const listRef = useRef<BaseFlatList<ClubModel> | null>(null)

  useLogRenderCount('RecommendedClubsView')

  const onEndReached = useCallback(() => {
    if (!store.searchMode) return
    store.loadMore()
  }, [store])

  useEffect(() => {
    analytics.sendEvent('explore_recommended_clubs_screen_open')
  }, [])

  useEffect(() => {
    if (isActivated && store.list.length > 0) {
      store.loadMore()
    }
  }, [store, isActivated])

  if (!store.isInProgress && store.list.length === 0) {
    return <NoSearchResultsView query={store.query} />
  }

  return (
    <>
      <BaseFlatList<ClubModel>
        ref={listRef}
        onStartShouldSetResponder={() => !listRef.current?.canScroll}
        onTouchMove={clearWindowFocus}
        ListFooterComponent={
          <ListLoadMoreIndicator visible={store.isLoadingMore} />
        }
        scrollToOverflowEnabled
        contentContainerStyle={{paddingBottom: bottomInset(inset)}}
        keyboardDismissMode={Platform.OS === 'ios' ? 'on-drag' : 'none'}
        keyboardShouldPersistTaps={'always'}
        data={store.list}
        style={[styles.flatList, style]}
        refreshing={store.isRefreshing}
        onRefresh={store.refresh}
        onEndReached={onEndReached}
        renderItem={renderClubListItem}
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

export default observer(RecommendedClubsView)

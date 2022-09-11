import {observer} from 'mobx-react'
import React, {useCallback} from 'react'

import {UserModel} from '../../../models'
import {FollowingStore} from '../../../stores/FollowingStore'
import UserCountersStore from '../../../stores/UserCountersStore'
import {commonStyles} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {useBottomSafeArea} from '../../../utils/safeArea.utils'
import BaseFlatList from '../../common/BaseFlatList'
import FollowingListItem from '../../common/FollowingListItem'
import RecommendedPeopleEmptyView from '../myNetwork/RecommendedPeopleEmptyView'

interface Props {
  readonly store: FollowingStore
  readonly countersStore: UserCountersStore | null
  readonly onUserSelect: (userId: string) => void
  readonly emptyViewConfig: {
    title: string
    proposeToConnect?: UserModel
  }
}

const ConnectingPeopleView: React.FC<Props> = ({
  store,
  countersStore,
  onUserSelect,
  emptyViewConfig,
}) => {
  const inset = useBottomSafeArea()

  const onStateChanged = useCallback(
    (isFollowing: boolean, index: number) => {
      store.onFollowingStateChanged(isFollowing, index)
      isFollowing
        ? countersStore?.incConnecting()
        : countersStore?.decConnecting()
    },
    [store, countersStore],
  )

  const renderItem = useCallback(
    ({item, index}) => (
      <FollowingListItem
        index={index}
        user={item}
        onStateChanged={onStateChanged}
        onSelect={onUserSelect}
      />
    ),
    [onUserSelect, onStateChanged],
  )

  if (!store.internalStore.list.length) {
    if (store.internalStore.isFirstLoading) return null
    else return <RecommendedPeopleEmptyView text={emptyViewConfig.title} />
  }

  return (
    <BaseFlatList<UserModel>
      data={store.internalStore.list}
      contentContainerStyle={{paddingBottom: inset}}
      style={[
        commonStyles.wizardContainer,
        commonStyles.webScrollingContainer,
        {paddingHorizontal: ms(16)},
      ]}
      refreshing={store.internalStore.isRefreshing}
      onRefresh={store.internalStore.refresh}
      initialNumToRender={20}
      onEndReached={() => store.internalStore.loadMore()}
      renderItem={renderItem}
    />
  )
}

export default observer(ConnectingPeopleView)

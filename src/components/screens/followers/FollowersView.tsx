import {observer} from 'mobx-react'
import React, {useCallback} from 'react'

import {UserModel} from '../../../models'
import {FollowersStore} from '../../../stores/FollowersStore'
import UserCountersStore from '../../../stores/UserCountersStore'
import {commonStyles} from '../../../theme/appTheme'
import {useBottomSafeArea} from '../../../utils/safeArea.utils'
import BaseFlatList from '../../common/BaseFlatList'
import FollowerListItem from '../../common/FollowerListItem'
import RecommendedPeopleEmptyView from '../myNetwork/RecommendedPeopleEmptyView'

interface Props {
  readonly store: FollowersStore
  readonly countersStore: UserCountersStore | null
  readonly onUserSelect: (userId: string) => void
  readonly emptyViewConfig: {
    title: string
    proposeToConnect?: UserModel
  }
}

const FollowersView: React.FC<Props> = ({
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
        ? countersStore?.incConnected()
        : countersStore?.decConnected()
    },
    [store, countersStore],
  )

  if (!store.internalStore.list.length) {
    if (store.internalStore.isFirstLoading) return null
    else return <RecommendedPeopleEmptyView text={emptyViewConfig.title} />
  }

  return (
    <BaseFlatList<UserModel>
      data={store.internalStore.list}
      style={commonStyles.wizardContainer}
      contentContainerStyle={{paddingBottom: inset}}
      refreshing={store.internalStore.isRefreshing}
      initialNumToRender={20}
      onRefresh={store.internalStore.refresh}
      onEndReached={() => store.internalStore.loadMore()}
      renderItem={({item, index}) => (
        <FollowerListItem
          user={item}
          index={index}
          onStateChanged={onStateChanged}
          onSelect={onUserSelect}
        />
      )}
    />
  )
}

export default observer(FollowersView)

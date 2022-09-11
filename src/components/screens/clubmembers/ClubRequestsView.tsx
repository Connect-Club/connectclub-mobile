import {observer} from 'mobx-react'
import React, {useCallback} from 'react'
import {FlatList, ListRenderItem} from 'react-native'

import {ClubJoinRequestModel} from '../../../models'
import {ClubRequestsStore} from '../../../stores/ClubRequestsStore'
import {commonStyles} from '../../../theme/appTheme'
import ClubRequestListItem from '../club/ClubRequestListItem'

const keyExtractor = (item: ClubJoinRequestModel) => item.joinRequestId

type Props = {
  store: ClubRequestsStore
}

const ClubRequestsView: React.FC<Props> = ({store}) => {
  const renderItem = useCallback<ListRenderItem<ClubJoinRequestModel>>(
    ({item}) => (
      <ClubRequestListItem
        request={item}
        isLoading={store.actionRequestId === item.joinRequestId}
        onAcceptPress={store.acceptRequest}
      />
    ),
    [store],
  )

  return (
    <FlatList<ClubJoinRequestModel>
      keyboardShouldPersistTaps={'always'}
      extraData={!!store.actionRequestId}
      data={store.list}
      style={[commonStyles.flexOne]}
      refreshing={store.isRefreshing}
      onRefresh={store.refresh}
      initialNumToRender={20}
      onEndReached={store.loadMore}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
    />
  )
}

export default observer(ClubRequestsView)

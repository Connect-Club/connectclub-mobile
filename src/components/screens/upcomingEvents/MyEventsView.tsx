import {observer} from 'mobx-react'
import React from 'react'
import {View} from 'react-native'

import {ClubInfoModel, EventModel, UserModel} from '../../../models'
import BaseListStore from '../../../stores/BaseListStore'
import {commonStyles} from '../../../theme/appTheme'
import {useBottomSafeArea} from '../../../utils/safeArea.utils'
import BaseFlatList from '../../common/BaseFlatList'
import UpcomingEventEmptyView from './UpcomingEventEmptyView'
import UpcomingEventListItem from './UpcomingEventListItem'

interface Props {
  readonly store: BaseListStore<EventModel>
  readonly onEventPress: (event: EventModel) => void
  readonly onClubPress: (club: ClubInfoModel, dismiss: boolean) => void
  readonly onMemberPress: (item: EventModel, user: UserModel) => void
}

const MyEventsView: React.FC<Props> = (props) => {
  const store = props.store
  const inset = useBottomSafeArea()

  return (
    <View style={[commonStyles.wizardContainer]}>
      {store.list.length === 0 && (
        <UpcomingEventEmptyView
          isRefreshing={store.isRefreshing}
          onRefresh={store.refresh}
        />
      )}
      {store.list.length > 0 && (
        <BaseFlatList<EventModel>
          data={store.list}
          contentContainerStyle={{paddingBottom: inset}}
          onRefresh={store.refresh}
          refreshing={store.isLoading}
          onEndReached={() => store.loadMore()}
          renderItem={({item}) => (
            <UpcomingEventListItem
              onPress={props.onEventPress}
              event={item}
              onMemberPress={(u) => props.onMemberPress(item, u)}
              onClubPress={props.onClubPress}
            />
          )}
        />
      )}
    </View>
  )
}

export default observer(MyEventsView)

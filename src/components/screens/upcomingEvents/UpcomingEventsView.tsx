import {observer} from 'mobx-react'
import React from 'react'
import {View} from 'react-native'

import {ClubInfoModel, EventModel, UserModel} from '../../../models'
import {UpcomingEventsStore} from '../../../stores/UpcomingEventsStore'
import {commonStyles} from '../../../theme/appTheme'
import {useBottomSafeArea} from '../../../utils/safeArea.utils'
import BaseFlatList from '../../common/BaseFlatList'
import UpcomingEventListItem from './UpcomingEventListItem'

interface Props {
  readonly store: UpcomingEventsStore
  readonly onEventPress: (event: EventModel) => void
  readonly onClubPress: (club: ClubInfoModel, dismiss: boolean) => void
  readonly onMemberPress: (item: EventModel, user: UserModel) => void
}

const UpcomingEventsView: React.FC<Props> = (props) => {
  const store = props.store
  const inset = useBottomSafeArea()

  return (
    <View style={[commonStyles.wizardContainer]}>
      <BaseFlatList<EventModel>
        data={store.list}
        contentContainerStyle={{paddingBottom: inset}}
        onRefresh={store.refresh}
        refreshing={store.isRefreshing}
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
    </View>
  )
}

export default observer(UpcomingEventsView)

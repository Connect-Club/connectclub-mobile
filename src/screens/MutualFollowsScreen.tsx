import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useCallback, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {View} from 'react-native'

import BaseFlatList from '../components/common/BaseFlatList'
import FollowerListItem from '../components/common/FollowerListItem'
import {UserModel} from '../models'
import {MutualStore} from '../stores/MutualStore'
import UserCountersStore from '../stores/UserCountersStore'
import {commonStyles, useTheme} from '../theme/appTheme'
import {push, useTitle} from '../utils/navigation.utils'
import {useViewModel} from '../utils/useViewModel'

type ScreenRouteProp = RouteProp<{Screen: {userId: string}}, 'Screen'>

const MutualFollowsScreen: React.FC = () => {
  const {colors} = useTheme()
  const {params} = useRoute<ScreenRouteProp>()
  const {t} = useTranslation()
  const navigation = useNavigation()
  const store = useViewModel(() => new MutualStore(params.userId))

  const countersStore = useViewModel(() => new UserCountersStore())
  const counter = countersStore.counters?.mutualFriendsCount
  useTitle(t('mutualScreenTitle', {counter: counter ? `(${counter})` : ''}))

  useEffect(() => {
    countersStore.updateCounters(params.userId)
    store.internalStore.load()
  }, [])
  const onSelect = useCallback(
    (userId) =>
      push(navigation, 'ProfileScreen', {userId, showCloseButton: false}),
    [navigation],
  )
  const onStateChanged = useCallback(
    (isFollowing: boolean, index: number) => {
      store.onFollowingStateChanged(isFollowing, index)
      isFollowing
        ? countersStore.incMutualFriends()
        : countersStore.decMutualFriends()
    },
    [store, countersStore],
  )

  return (
    <View
      style={[
        commonStyles.flexOne,
        {backgroundColor: colors.systemBackground},
      ]}>
      <BaseFlatList<UserModel>
        data={store.internalStore.list}
        refreshing={store.internalStore.isLoading}
        onRefresh={store.internalStore.refresh}
        onEndReached={() => store.internalStore.loadMore()}
        renderItem={({item, index}) => (
          <FollowerListItem
            index={index}
            user={item}
            onStateChanged={onStateChanged}
            onSelect={onSelect}
          />
        )}
      />
    </View>
  )
}

export default observer(MutualFollowsScreen)

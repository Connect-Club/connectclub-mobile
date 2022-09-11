import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useCallback, useEffect, useMemo} from 'react'
import {useTranslation} from 'react-i18next'

import WebModalHeader from '../components/common/WebModalHeader'
import ConnectingPeopleView from '../components/screens/followers/ConnectingPeopleView'
import {AppModal} from '../components/webSafeImports/webSafeImports'
import {UserModel} from '../models'
import {storage} from '../storage'
import {FollowingStore} from '../stores/FollowingStore'
import UserCountersStore from '../stores/UserCountersStore'
import {push, useTitle} from '../utils/navigation.utils'
import {useViewModel} from '../utils/useViewModel'

type ScreenRouteProp = RouteProp<
  {Screen: {user: UserModel; navigationRoot?: string}},
  'Screen'
>

const FollowingScreen: React.FC = () => {
  const {params} = useRoute<ScreenRouteProp>()
  const {t} = useTranslation()
  const navigation = useNavigation()
  const store = useViewModel(() => new FollowingStore(params.user.id, true))

  const countersStore = useViewModel(() => new UserCountersStore())
  const counter = countersStore.counters?.connectingCount
  const title = t('connectingScreenTitle', {
    counter: counter ? `(${counter})` : '',
  })
  useTitle(title)

  useEffect(() => {
    countersStore.updateCounters(params.user.id)
    store.internalStore.load()
  }, [countersStore, store])

  const onSelect = useCallback(
    (user) =>
      push(navigation, 'ProfileScreen', {
        userId: user,
        showCloseButton: false,
        navigationRoot: params?.navigationRoot,
      }),
    [navigation],
  )

  const isOtherUser = params.user?.id !== storage.currentUser?.id

  const emptyViewConfig = useMemo(
    () => ({
      title: isOtherUser
        ? t('connectingScreenOtherProfileEmptyView', {
            name: params.user?.displayName ?? '',
          })
        : t('connectingListEmptyView'),
    }),
    [t],
  )

  return (
    <AppModal
      navigationRoot={params?.navigationRoot}
      isScrolling={false}
      header={<WebModalHeader title={title} navigationAction={'back'} />}>
      <ConnectingPeopleView
        store={store}
        countersStore={countersStore}
        emptyViewConfig={emptyViewConfig}
        onUserSelect={onSelect}
      />
    </AppModal>
  )
}

export default observer(FollowingScreen)

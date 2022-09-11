import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useCallback, useEffect, useMemo} from 'react'
import {useTranslation} from 'react-i18next'

import WebModalHeader from '../components/common/WebModalHeader'
import FollowersView from '../components/screens/followers/FollowersView'
import {AppModal} from '../components/webSafeImports/webSafeImports'
import {UserModel} from '../models'
import {storage} from '../storage'
import {FollowersStore} from '../stores/FollowersStore'
import UserCountersStore from '../stores/UserCountersStore'
import {push, useTitle} from '../utils/navigation.utils'
import {useViewModel} from '../utils/useViewModel'

type ScreenRouteProp = RouteProp<
  {
    Screen: {
      user: UserModel
      purposeToConnectOnEmptyScreen?: boolean
      navigationRoot?: string
    }
  },
  'Screen'
>

const FollowersScreen: React.FC = () => {
  const {params} = useRoute<ScreenRouteProp>()
  const {t} = useTranslation()
  const navigation = useNavigation()
  const store = useViewModel(
    () => new FollowersStore(params.user.id, {mutualOnly: true}),
  )
  const countersStore = useViewModel(() => new UserCountersStore())
  const counter = countersStore.counters?.connectedCount
  const title = t('connectedScreenTitle', {
    counter: counter ? `(${counter})` : '',
  })
  useTitle(title)
  useEffect(() => {
    countersStore.updateCounters(params.user.id)
    store.internalStore.load()
  }, [countersStore, store])
  const onUserSelect = useCallback(
    (userId) => {
      push(navigation, 'ProfileScreen', {
        userId: userId,
        showCloseButton: false,
      })
    },
    [navigation],
  )
  const purposeConnectToUser = params.purposeToConnectOnEmptyScreen
    ? params.user
    : undefined
  const emptyViewConfig = useMemo(
    () => ({
      title:
        params.user && params.user.id !== storage.currentUser?.id
          ? t('connectedScreenOtherProfileEmptyView', {
              name: params.user.displayName,
            })
          : t('connectedScreenEmptyView'),
      proposeToConnect: purposeConnectToUser,
    }),
    [purposeConnectToUser, t],
  )
  return (
    <AppModal
      navigationRoot={params?.navigationRoot}
      isScrolling={false}
      header={<WebModalHeader title={title} navigationAction={'back'} />}>
      <FollowersView
        store={store}
        countersStore={countersStore}
        onUserSelect={onUserSelect}
        emptyViewConfig={emptyViewConfig}
      />
    </AppModal>
  )
}

export default observer(FollowersScreen)

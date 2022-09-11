import {observer} from 'mobx-react'
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import {useTranslation} from 'react-i18next'
import {FlatList} from 'react-native'

import BaseInlineBottomSheet, {
  AppBottomSheet,
} from '../components/BaseInlineBottomSheet'
import Vertical from '../components/common/Vertical'
import HasNoInvitesView from '../components/screens/invites/HasNoInvitesView'
import {InvitePressHandler} from '../components/screens/invites/InviteButton'
import InviteContactListItem from '../components/screens/invites/InviteContactListItem'
import InvitesListHeader from '../components/screens/invites/InvitesListHeader'
import InvitesNoResultsView from '../components/screens/invites/InvitesNoResultsView'
import SelectPhoneBottomDialog, {
  SelectorConfig,
} from '../components/screens/invites/SelectPhoneBottomDialog'
import {useActiveState} from '../components/screens/invites/useActiveState'
import {InviteContactModel, UserPhone} from '../models'
import InvitesStore from '../stores/InvitesStore'
import MyCountersStore from '../stores/MyCountersStore'
import PendingInvitesStore from '../stores/PendingInvitesStore'
import {commonStyles} from '../theme/appTheme'
import {bottomInset} from '../utils/inset.utils'
import {ms} from '../utils/layout.utils'
import {useTitle} from '../utils/navigation.utils'
import {useBottomSafeArea} from '../utils/safeArea.utils'

const getItemLayout = (
  _data: Array<InviteContactModel> | null | undefined,
  index: number,
): {length: number; offset: number; index: number} => ({
  length: ms(56),
  offset: ms(56) * index,
  index,
})

const keyExtractor = (item: InviteContactModel) =>
  `${item.phone}_${item.displayName}`

const InvitesScreen: React.FC = () => {
  const {t} = useTranslation()
  const inset = useBottomSafeArea()
  const store = useContext(InvitesStore)
  const pendingStore = useContext(PendingInvitesStore)
  const countersStore = useContext(MyCountersStore)

  const sheetRef = useRef<AppBottomSheet>(null)
  const [selectorConfig, setSelectorConfig] = useState<SelectorConfig | null>(
    null,
  )

  const invitesCount = countersStore.counters.countFreeInvites
  useTitle(t('invitesScreenTitle', {count: invitesCount}))

  const onRefresh = useCallback(async () => {
    await store.refresh()
    await countersStore.readHasInvites()
  }, [])

  useActiveState(onRefresh)

  useEffect(() => {
    store.initialize(countersStore)
    return store.clear
  }, [])

  const onContactSelectedPress = useCallback<InvitePressHandler>(
    async (displayName, phones) => {
      if (phones.length === 1) {
        const userPhone = phones[0]
        if (
          userPhone.status === 'send_reminder' ||
          userPhone.status === 'pending'
        ) {
          pendingStore.sendReminder(displayName, userPhone.phone)
        } else {
          await store.invite(userPhone.phone)
          countersStore.updateCounters()
        }
        return
      }
      setSelectorConfig({displayName: displayName, phones: phones})
      requestAnimationFrame(() => sheetRef.current?.present())
    },
    [],
  )

  return (
    <>
      <Vertical style={commonStyles.wizardContainer}>
        {invitesCount === 0 && <HasNoInvitesView />}
        {invitesCount > 0 && (
          <FlatList<InviteContactModel>
            onRefresh={onRefresh}
            refreshing={store.isFetch}
            ListEmptyComponent={
              <InvitesNoResultsView query={store.searchQuery ?? ''} />
            }
            ListHeaderComponent={
              <InvitesListHeader
                onSetQuery={store.search}
                isSearching={store.isSearching}
              />
            }
            windowSize={41}
            maxToRenderPerBatch={50}
            onEndReached={store.loadMore}
            keyboardShouldPersistTaps={'always'}
            getItemLayout={getItemLayout}
            initialNumToRender={200}
            keyboardDismissMode={'on-drag'}
            contentContainerStyle={{
              paddingBottom: bottomInset(inset),
            }}
            keyExtractor={keyExtractor}
            data={store.invites}
            renderItem={({item}) => (
              <InviteContactListItem
                onContactSelectedPress={onContactSelectedPress}
                user={item}
                isPending={item.status === 'send_reminder'}
              />
            )}
          />
        )}
      </Vertical>
      {selectorConfig && (
        <BaseInlineBottomSheet
          ref={sheetRef}
          height={selectorConfig.phones.length * ms(56) + ms(56)}>
          <SelectPhoneBottomDialog
            buttons={selectorConfig.phones}
            onDismiss={() => setSelectorConfig(null)}
            onSelect={(phone: UserPhone) => {
              onContactSelectedPress(selectorConfig.displayName, [phone])
              setSelectorConfig(null)
            }}
          />
        </BaseInlineBottomSheet>
      )}
    </>
  )
}

export default observer(InvitesScreen)

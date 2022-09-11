import {toJS} from 'mobx'
import {observer} from 'mobx-react'
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import {useTranslation} from 'react-i18next'

import BaseInlineBottomSheet, {
  AppBottomSheet,
} from '../components/BaseInlineBottomSheet'
import BaseFlatList from '../components/common/BaseFlatList'
import Vertical from '../components/common/Vertical'
import {InvitePressHandler} from '../components/screens/invites/InviteButton'
import InviteContactListItem from '../components/screens/invites/InviteContactListItem'
import SelectPhoneBottomDialog, {
  SelectorConfig,
} from '../components/screens/invites/SelectPhoneBottomDialog'
import {InviteContactModel, UserPhone} from '../models'
import InvitesStore from '../stores/InvitesStore'
import MyCountersStore from '../stores/MyCountersStore'
import PendingInvitesStore from '../stores/PendingInvitesStore'
import {commonStyles} from '../theme/appTheme'
import {bottomInset} from '../utils/inset.utils'
import {ms} from '../utils/layout.utils'
import {useTitle} from '../utils/navigation.utils'
import {useBottomSafeArea} from '../utils/safeArea.utils'

const keyExtractor = (item: InviteContactModel) =>
  `${item.phone}_${item.displayName}`

const getItemLayout = (
  _data: Array<InviteContactModel> | null | undefined,
  index: number,
): {length: number; offset: number; index: number} => ({
  length: ms(56),
  offset: ms(56) * index,
  index,
})

const InvitesPendingScreen: React.FC = () => {
  const {t} = useTranslation()
  const inset = useBottomSafeArea()

  const pendingStore = useContext(PendingInvitesStore)
  const invitesStore = useContext(InvitesStore)
  const countersStore = useContext(MyCountersStore)
  const sheetRef = useRef<AppBottomSheet>(null)

  const [selectorConfig, setSelectorConfig] = useState<SelectorConfig | null>(
    null,
  )

  useTitle(t('invitesPendingScreenTitle', {count: 2}))

  useEffect(() => {
    pendingStore.initialize()
    return pendingStore.clear
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
          await invitesStore.invite(userPhone.phone)
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
      <Vertical style={[commonStyles.wizardContainer, commonStyles.flexOne]}>
        <BaseFlatList<InviteContactModel>
          onEndReached={pendingStore.loadMore}
          keyboardShouldPersistTaps={'always'}
          keyboardDismissMode={'on-drag'}
          contentContainerStyle={{
            paddingBottom: bottomInset(inset),
            paddingTop: ms(24),
          }}
          getItemLayout={getItemLayout}
          keyExtractor={keyExtractor}
          data={toJS(pendingStore.pending)}
          renderItem={({item}) => (
            <InviteContactListItem
              onContactSelectedPress={onContactSelectedPress}
              user={item}
              isPending={true}
            />
          )}
        />
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

export default observer(InvitesPendingScreen)

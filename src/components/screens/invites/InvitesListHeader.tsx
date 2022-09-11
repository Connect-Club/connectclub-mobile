import {observer} from 'mobx-react'
import React, {useCallback, useContext, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import InvitesStore from '../../../stores/InvitesStore'
import MyCountersStore from '../../../stores/MyCountersStore'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import InviteBlockView from '../../common/InviteBlockView'
import AppSearchBar from '../AppSearchBar'
import PendingInvitesButton from './PendingInvitesButton'

interface Props {
  onSetQuery: (text: string) => void
  isSearching: boolean
}

const InvitesListHeader: React.FC<Props> = (props) => {
  const {t} = useTranslation()
  const {colors} = useTheme()

  const store = useContext(InvitesStore)
  const countersStore = useContext(MyCountersStore)
  const [queryLength, setQueryLength] = useState<number>(0)
  const onSearchDone = useCallback(() => store.search(null), [store])
  const pendingInvitesCount = countersStore.counters.countPendingInvites
  const isShowPendingButton = pendingInvitesCount > 0 && queryLength === 0

  const onChangeValue = (newValue: string) => {
    setQueryLength(newValue.length)
    props.onSetQuery(newValue)
  }

  return (
    <View accessibilityLabel={'InvitesListHeader'}>
      <AppText style={[styles.title, {color: colors.secondaryBodyText}]}>
        {t('invitesScreenDescription')}
      </AppText>
      <AppSearchBar
        placeholderText={t('enterPhoneOrNamePlaceholder')}
        onSearchDone={onSearchDone}
        onChangeText={onChangeValue}
        isLoading={props.isSearching}
      />
      {isShowPendingButton && (
        <PendingInvitesButton
          style={styles.pendingButtonStyle}
          count={pendingInvitesCount}
        />
      )}
      <InviteBlockView
        style={styles.inviteBlock}
        title={t('sendInviteBlockTitle')}
        text={t('sendInviteBlockText')}
        icon={'icLink'}
        accessibilitySuffix={'Invite'}
      />
    </View>
  )
}

export default observer(InvitesListHeader)

const styles = StyleSheet.create({
  pendingButtonStyle: {
    marginBottom: ms(16),
  },
  inviteBlock: {
    marginHorizontal: ms(16),
    marginBottom: ms(6),
  },
  title: {
    width: '100%',
    fontSize: ms(15),
    lineHeight: ms(22),
    textAlign: 'center',
    marginTop: ms(16),
    paddingHorizontal: ms(16),
  },
})

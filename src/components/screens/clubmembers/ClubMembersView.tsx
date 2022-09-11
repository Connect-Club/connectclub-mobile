import {observer} from 'mobx-react'
import React, {useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'
import {SwipeListView} from 'react-native-swipe-list-view'

import {analytics} from '../../../Analytics'
import {ClubModel, UserModel} from '../../../models'
import {ClubMembersStore} from '../../../stores/ClubMembersStore'
import {commonStyles, makeTextStyle, useTheme} from '../../../theme/appTheme'
import {isAtLeastClubModerator} from '../../../utils/club.utils'
import {ms} from '../../../utils/layout.utils'
import {toastHelper} from '../../../utils/ToastHelper'
import AppText from '../../common/AppText'
import {alert} from '../../webSafeImports/webSafeImports'
import {ClubMemberListRow} from '../club/ClubMemberListItem'
import {logJS} from '../room/modules/Logger'

type Props = {
  club: ClubModel
  store: ClubMembersStore
}

const keyExtractor = (item: UserModel) => item.id

const ClubMembersView: React.FC<Props> = ({club, store}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  const canModerate = isAtLeastClubModerator(club.clubRole)

  useEffect(() => {
    if (store.actionError) {
      toastHelper.error('somethingWentWrong')
    }
  }, [store.actionError])

  const onPromoteToModeratorConfirmPress = async (userId: string) => {
    logJS('debug', 'ClubMembersView', 'promote user to moderator pressed')
    analytics.sendEvent('club_set_moderator_confirm_click', {
      clubId: store.clubId,
      userId,
    })
    await store.promoteToModerator(userId)
  }

  const onRemoveModeratorConfirmPress = async (userId: string) => {
    logJS('debug', 'ClubMembersView', 'remove moderator pressed')
    analytics.sendEvent('club_remove_moderator_confirm_click', {
      clubId: store.clubId,
      userId,
    })
    await store.removeModerator(userId)
  }

  const onRemoveMemberConfirmPress = async (userId: string) => {
    logJS('debug', 'ClubMembersView', 'remove member confirm pressed')
    analytics.sendEvent('club_remove_member_click', {
      clubId: store.clubId,
      userId: userId,
    })
    await store.removeClubMember(userId)
  }

  const onPromotePress = (member: UserModel) => {
    if (isAtLeastClubModerator(member.clubRole)) {
      analytics.sendEvent('club_remove_moderator_click', {
        clubId: store.clubId,
        userId: member.id,
      })
      alert(
        t('removeClubModeratorTitle', {name: member.displayName}),
        t('removeClubModeratorMessage'),
        [
          {style: 'cancel', text: t('cancelButton')},
          {
            style: 'destructive',
            text: t('removeButton'),
            onPress: () => onRemoveModeratorConfirmPress(member.id),
          },
        ],
      )
      return
    }
    analytics.sendEvent('club_set_moderator_click', {
      clubId: store.clubId,
      userId: member.id,
    })
    alert(
      t('makeClubModeratorTitle', {name: member.displayName}),
      t('promoteToModeratorMessage'),
      [
        {style: 'cancel', text: t('cancelButton')},
        {
          style: 'default',
          text: t('makeButton'),
          onPress: () => onPromoteToModeratorConfirmPress(member.id),
        },
      ],
    )
  }

  const onRemovePress = (member: UserModel) => {
    analytics.sendEvent('club_remove_member_click', {
      clubId: store.clubId,
      userId: member.id,
    })
    alert(
      t('removeUserFromClubTitle', {name: member.displayName}),
      t('removeUserFromClubMessage'),
      [
        {style: 'cancel', text: t('cancelButton')},
        {
          style: 'default',
          text: t('removeButton'),
          onPress: () => onRemoveMemberConfirmPress(member.id),
        },
      ],
    )
  }

  const renderItem = ({item, index}: {item: UserModel; index: number}) => {
    return (
      <ClubMemberListRow
        canModerate={canModerate}
        index={index}
        member={item}
        onPromotePress={onPromotePress}
        onRemovePress={onRemovePress}
      />
    )
  }

  if (!store.list.length) return null

  const header = () => {
    if (
      !store.internalStore.totalCount ||
      store.internalStore.totalCount === 0
    ) {
      return null
    }
    return (
      <AppText style={[styles.header, {color: colors.thirdBlack}]}>
        {store.internalStore.totalCount}
      </AppText>
    )
  }

  return (
    <SwipeListView<UserModel>
      ListHeaderComponent={header}
      keyboardShouldPersistTaps={'always'}
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

export default observer(ClubMembersView)

const styles = StyleSheet.create({
  header: {
    ...makeTextStyle(ms(11), ms(14.3), 'bold'),
  },
})

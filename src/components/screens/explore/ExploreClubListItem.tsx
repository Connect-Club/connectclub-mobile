import {observer} from 'mobx-react'
import React, {useCallback} from 'react'
import {useTranslation} from 'react-i18next'

import {analytics} from '../../../Analytics'
import {ClubModel, ClubUser} from '../../../models'
import ClubStore from '../../../stores/ClubStore'
import {isJoinedClub} from '../../../utils/club.utils'
import {toastHelper} from '../../../utils/ToastHelper'
import {useViewModel} from '../../../utils/useViewModel'
import {alert} from '../../webSafeImports/webSafeImports'
import JoinClubButton from '../clublist/JoinClubButton'
import JoinableClubListItem from '../exploreClubs/JoinableClubListItem'
import {logJS} from '../room/modules/Logger'

interface Props {
  readonly club: ClubModel
  readonly onClubPress: (club: ClubModel) => void
  readonly onOwnerPress: (user: ClubUser) => void
}

const ExploreClubListItem: React.FC<Props> = (props) => {
  const {t} = useTranslation()
  const store = useViewModel(() => new ClubStore(props.club))
  const club = store.club!
  const isUserJoinedClub = isJoinedClub(club.clubRole)

  const onClubLeaveConfirmPress = useCallback(async () => {
    logJS(
      'debug',
      'ExploreContext',
      'club leave confirm pressed',
      store.club!.id,
    )
    analytics.sendEvent('explore_leave_club_confirm_click', {
      clubId: store.club!.id,
    })
    await store.leaveClub()
    if (!store.actionError) {
      toastHelper.success(
        t('leftClubSuccess', {title: store.club!.title}),
        false,
      )
    } else {
      toastHelper.error('somethingWentWrong')
    }
  }, [store, t])

  const onClubJoinPress = useCallback(async () => {
    logJS('debug', 'ExploreContext', 'club join pressed', store.club!.id)
    analytics.sendEvent('explore_join_club_click', {clubId: store.club!.id})
    await store.joinRequest()
  }, [store])

  const onToggleJoinPress = useCallback(() => {
    if (!club) return
    if (isJoinedClub(club.clubRole)) {
      analytics.sendEvent('explore_leave_club_click', {
        clubId: club.id,
      })
      alert(t('leaveClubTitle', {title: club.title}), t('leaveClubMessage'), [
        {style: 'cancel', text: t('cancelButton')},
        {
          style: 'destructive',
          text: t('leave'),
          onPress: onClubLeaveConfirmPress,
        },
      ])
      return
    }
    onClubJoinPress()
  }, [club, onClubJoinPress, onClubLeaveConfirmPress, t])

  return (
    <JoinableClubListItem
      club={club}
      onClubPress={props.onClubPress}
      onOwnerPress={props.onOwnerPress}
      statusWithIcon={isUserJoinedClub}
      buttonComponent={
        <JoinClubButton
          isLoading={store.isInJoinAction}
          clubRole={club.clubRole}
          onToggleJoinPress={onToggleJoinPress}
        />
      }
    />
  )
}

export default observer(ExploreClubListItem)

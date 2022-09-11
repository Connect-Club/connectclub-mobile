import {useNavigation} from '@react-navigation/native'
import React, {useCallback} from 'react'
import {useTranslation} from 'react-i18next'

import {UserModel} from '../../../models'
import {ProfileStore} from '../../../stores/ProfileStore'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {getProfileLink, shareLink} from '../../../utils/sms.utils'
import {toastHelper} from '../../../utils/ToastHelper'
import FlexSpace from '../../common/FlexSpace'
import Horizontal from '../../common/Horizontal'
import NavigationIconButton from '../mainFeed/NavigationIconButton'
import ProfileContextMenu from './ProfileContextMenu'

interface Props {
  readonly store: ProfileStore
  readonly roomName?: string
  readonly isUserAdmin: boolean
  readonly isCurrentUserAdmin: boolean
  readonly showSeparator?: boolean
  readonly onContextMenuPress?: () => void
  readonly showCloseInsteadOfBack?: boolean
  readonly onToggleBlockUser: () => void
  readonly isWaitingInvitation?: boolean
}

const ProfileNavigation: React.FC<Props> = ({
  store,
  roomName,
  isUserAdmin,
  isCurrentUserAdmin,
  onContextMenuPress,
  showCloseInsteadOfBack = false,
  showSeparator = false,
  onToggleBlockUser,
  isWaitingInvitation,
}) => {
  const navigation = useNavigation()
  const {t} = useTranslation()
  const {colors} = useTheme()

  const onBanUser = useCallback(
    async (u: UserModel) => {
      if (!roomName) return
      const isBanned = await store.banUser(roomName, u.id)
      if (isBanned) {
        navigation.goBack()
        toastHelper.error(
          t('banSuccessMessage', {abuserName: u.displayName}),
          false,
        )
      }
    },
    [navigation, roomName, store, t],
  )

  const onShareProfilePress = useCallback(() => {
    if (!store.user?.username) return
    shareLink(getProfileLink(store.user?.username))
  }, [store.user?.username])

  return (
    <Horizontal
      style={[
        {backgroundColor: colors.systemBackground},
        {
          width: '100%',
          height: ms(56),
          borderBottomWidth: ms(showSeparator ? 1 : 0),
          borderBottomColor: showSeparator ? colors.separator : undefined,
          alignItems: 'flex-end',
        },
      ]}>
      {navigation.canGoBack() && (
        <NavigationIconButton
          icon={
            showCloseInsteadOfBack === true
              ? 'icNavigationClose'
              : 'icNavigationBack'
          }
          accessibilityLabel={'closeProfileButton'}
          tint={colors.accentPrimary}
          onPress={navigation.goBack}
        />
      )}
      <FlexSpace />
      {!isWaitingInvitation && (
        <NavigationIconButton
          icon={'icShare'}
          tint={colors.accentPrimary}
          onPress={onShareProfilePress}
        />
      )}
      {!isWaitingInvitation && store.isCurrentUser && (
        <NavigationIconButton
          icon={store.isCurrentUser ? 'icSettings' : 'icVerticalMenu'}
          tint={colors.accentPrimary}
          onPress={onContextMenuPress}
          accessibilityLabel={store.isCurrentUser ? 'settings' : 'menu'}
        />
      )}
      {!isWaitingInvitation && !store.isCurrentUser && store.user && (
        <ProfileContextMenu
          user={store.user}
          isUserAdmin={isUserAdmin}
          isCurrentUserAdmin={isCurrentUserAdmin}
          isCurrentUser={store.isCurrentUser}
          onBanUser={onBanUser}
          onToggleBlockUser={onToggleBlockUser}
        />
      )}
    </Horizontal>
  )
}

export default ProfileNavigation

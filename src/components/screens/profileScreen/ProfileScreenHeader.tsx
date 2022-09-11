import {TFunction} from 'i18next'
import {observer} from 'mobx-react'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {FullUserModel, UserCounters} from '../../../models'
import {ProfileStore} from '../../../stores/ProfileStore'
import {makeTextStyle, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import Horizontal from '../../common/Horizontal'
import InlineButton from '../../common/InlineButton'
import PrimaryButton from '../../common/PrimaryButton'
import Spacer from '../../common/Spacer'
import Vertical from '../../common/Vertical'
import ConnectButton, {
  ConnectionState,
  getConnectionState,
} from './ConnectButton'
import {ProfileAdminUserToggleMedia} from './ProfileAdminUserToggleMedia'
import ProfileAvatarView from './ProfileAvatarView'
import ProfileModerateButtons from './ProfileModerateButtons'

export interface ClubControls {
  readonly onAccept: () => void
  readonly onReject: () => void
}

interface Props {
  readonly store: ProfileStore
  readonly counters: UserCounters | undefined
  readonly onFollowersPress: (user: FullUserModel) => void
  readonly onFollowingPress: (user: FullUserModel) => void
  readonly onUnblockUserPress: () => void
  readonly onConnectEstablished: () => void
  readonly setAvatar?: (url: string) => void
  readonly disableUploadPhoto?: boolean
  readonly isCrownVisible?: boolean
  readonly showMediaToggles?: boolean
  readonly videoEnabled?: boolean
  readonly audioEnabled?: boolean
  readonly manageProfileCallbacks?: ClubControls
  readonly isWaitingInvitation?: boolean
}

const ProfileScreenHeader: React.FC<Props> = ({
  store,
  counters,
  onFollowersPress,
  onFollowingPress,
  onUnblockUserPress,
  onConnectEstablished,
  setAvatar,
  disableUploadPhoto,
  isCrownVisible = false,
  showMediaToggles = false,
  videoEnabled = false,
  audioEnabled = false,
  manageProfileCallbacks,
  isWaitingInvitation,
}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()

  const user = store.user

  const connectedCount = counters?.connectedCount ?? 0
  const connectingCount = counters?.connectingCount ?? 0

  if (!user) return null

  const bodyText = {color: colors.bodyText}
  const connected = t('connected', {count: connectedCount})
  const connecting = t('connecting', {count: connectingCount})
  const allowUploadPhoto = disableUploadPhoto !== true && store.isCurrentUser
  const blockedButtonStyle = [
    styles.blockedButton,
    {backgroundColor: colors.warning},
  ]

  return (
    <Vertical style={styles.container}>
      <View>
        <ProfileAvatarView
          user={user}
          isCrownVisible={isCrownVisible}
          setAvatar={setAvatar}
          allowUploadPhoto={allowUploadPhoto}
        />

        {showMediaToggles && (
          <ProfileAdminUserToggleMedia
            isVideoEnabled={videoEnabled}
            isAudioEnabled={audioEnabled}
            userId={user.id}
          />
        )}

        {!store.isCurrentUser && store.user?.isBlocked && (
          <PrimaryButton
            title={t('userBlocked')}
            style={blockedButtonStyle}
            textStyle={styles.blockedButtonText}
            onPress={onUnblockUserPress}
          />
        )}

        {!manageProfileCallbacks &&
          !store.isCurrentUser &&
          !store.user?.isBlocked && (
            <ConnectButton
              style={styles.connectButton}
              mode={'profile'}
              user={user}
              onFollowingStateChanged={store.onFollowingStateChanged}
              onConnectEstablished={onConnectEstablished}
            />
          )}
        {!!manageProfileCallbacks && !store.user?.isBlocked && (
          <ProfileModerateButtons
            onAccept={manageProfileCallbacks.onAccept}
            onReject={manageProfileCallbacks.onReject}
          />
        )}
      </View>

      <AppText style={[styles.fullName, bodyText]} numberOfLines={2}>
        {user.displayName}
      </AppText>
      <View style={styles.usernameContainer}>
        <AppText
          style={[styles.username, bodyText]}
          numberOfLines={1}
          accessibilityLabel={'usernameLabel'}>
          @{user.username} {__DEV__ && `(${user.id})`}
        </AppText>
        <AppText
          style={[styles.connectionDescription, {color: colors.thirdBlack}]}>
          {getConnectionDescription(getConnectionState(user), t)}
        </AppText>
      </View>

      {!isWaitingInvitation && (
        <Horizontal style={styles.countersContainer}>
          <InlineButton
            textStyle={styles.counterText}
            onPress={() => onFollowersPress(user)}
            title={connected}
            accessibilityLabel={'connected'}
          />
          <Spacer horizontal={ms(32)} />
          <InlineButton
            textStyle={styles.counterText}
            onPress={() => onFollowingPress(user)}
            title={connecting}
            accessibilityLabel={'connecting'}
          />
        </Horizontal>
      )}
    </Vertical>
  )
}

export default observer(ProfileScreenHeader)

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: ms(16),
    paddingTop: ms(16),
  },
  fullName: {
    fontSize: ms(20),
    fontWeight: 'bold',
    marginTop: ms(16),
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: ms(8),
    flexWrap: 'wrap',
  },
  username: {
    ...makeTextStyle(13, 18),
    marginEnd: ms(16),
  },
  connectionDescription: {
    ...makeTextStyle(13, 18),
  },
  followButton: {
    position: 'absolute',
    bottom: 0,
    end: 0,
  },
  connectButton: {
    position: 'absolute',
    bottom: 0,
    end: 0,
  },
  blockedButton: {
    position: 'absolute',
    height: ms(38),
    minWidth: ms(107),
    bottom: 0,
    end: 0,
  },
  blockedButtonText: {
    fontSize: ms(15),
    lineHeight: ms(18),
  },
  countersContainer: {marginTop: ms(8)},
  counterText: {
    marginStart: undefined,
    ...makeTextStyle(15, 24, 'bold'),
  },
})

const getConnectionDescription = (state: ConnectionState, t: TFunction) => {
  switch (state) {
    case 'IRequested':
      return t('connectionDescriptionIRequested')
    case 'TheyRequested':
      return t('connectionDescriptionTheyRequested')
    case 'Connected':
      return t('connectionDescriptionConnected')
    default:
      return ''
  }
}

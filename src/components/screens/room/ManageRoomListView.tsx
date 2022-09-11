import {observer} from 'mobx-react'
import React, {useCallback, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {analytics} from '../../../Analytics'
import AppIcon from '../../../assets/AppIcon'
import {commonStyles, makeTextStyle, useTheme} from '../../../theme/appTheme'
import {askMakeRoomPublic} from '../../../utils/alerts'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import {alert, BottomSheetFlatList} from '../../webSafeImports/webSafeImports'
import AdminListItemView from './AdminListItemView'
import {RoomManager} from './jitsi/RoomManager'
import UserManager from './jitsi/UserManager'
import {logJS} from './modules/Logger'
import RoomBottomSheetHeader from './RoomBottomSheetHeader'
import RoomSettingsButton from './RoomSettingsButton'

interface Props {
  readonly userManager: UserManager
  readonly roomManager: RoomManager
  readonly endRoom: () => void
  readonly adminsProvider: () => Promise<string>
}

const HeaderView = () => {
  const {colors} = useTheme()
  const {t} = useTranslation()
  return (
    <AppText
      style={[
        styles.sectionTitle,
        {color: colors.thirdBlack, marginBottom: ms(15)},
      ]}>
      {t('moderators')}
    </AppText>
  )
}

const FooterView: React.FC<{onEndRoomPress: () => void}> = ({
  onEndRoomPress,
}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  return (
    <View style={[styles.footerView, {borderTopColor: colors.separator}]}>
      <AppTouchableOpacity
        onPress={onEndRoomPress}
        style={[styles.endRoomButton, {backgroundColor: colors.warning}]}>
        <AppText style={[styles.endRoomButtonText]}>{t('endRoom')}</AppText>
      </AppTouchableOpacity>
    </View>
  )
}

const ManageRoomListView: React.FC<Props> = ({
  adminsProvider,
  userManager,
  endRoom,
  roomManager,
}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  const ownerId = roomManager.getOwnerId()

  const isPrivateRoom = roomManager.isPrivateRoom
  const isSilentModeOn = roomManager.isSilentModeEnabled
  const isSilentModeAvailable = roomManager.withSpeakers

  const fetchAdmins = async () => {
    await userManager.fetchAdminUsers(await adminsProvider())
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const onEndRoomPress = useCallback(() => {
    alert(
      t('endTheRoom'),
      t('endRoomConfirmation', {count: userManager.listenersCount}),
      [
        {text: t('cancelButton'), style: 'default'},
        {text: t('endTheRoom'), style: 'destructive', onPress: endRoom},
      ],
    )
  }, [])

  const admins = userManager.adminUsers
  const isShowFooter = userManager.user?.isAdmin === true && admins.length !== 0

  const onMakePublicPress = useCallback(async () => {
    logJS('info', 'make room public')
    analytics.sendEvent('click_make_room_public_button')
    if (!(await askMakeRoomPublic(t))) return
    await roomManager.makeRoomPublic()
  }, [roomManager, t])

  const onTurnSilentModeOn = () => {
    logJS('info', 'silent mode on')
    analytics.sendEvent('click_silent_mode_on_button', {
      roomId: roomManager.getCurrentRoomId(),
      eventId: roomManager.roomEventId,
    })
    roomManager.makeRoomSilent(true)
  }

  const onTurnSilentModeOff = () => {
    logJS('info', 'silent mode off')
    analytics.sendEvent('click_silent_mode_off_button', {
      roomId: roomManager.getCurrentRoomId(),
      eventId: roomManager.roomEventId,
    })
    roomManager.makeRoomSilent(false)
  }

  return (
    <View style={commonStyles.wizardContainer}>
      <RoomBottomSheetHeader title={t('manageRoomButton')} />
      <View style={styles.privacyControlsContainer}>
        <AppText style={[styles.sectionTitle, {color: colors.thirdBlack}]}>
          {t('roomSettingsSection')}
        </AppText>

        {isPrivateRoom && (
          <RoomSettingsButton
            icon={'icLock16'}
            onPress={onMakePublicPress}
            titleKey={'makeTheRoomPublic'}
          />
        )}

        {!isPrivateRoom && (
          <View style={styles.publicRoomLabel}>
            <AppIcon type={'icCheck24'} tint={colors.bodyText} />
            <AppText
              style={[styles.publicRoomLabelText, {color: colors.bodyText}]}>
              {t('publicRoomLabel')}
            </AppText>
          </View>
        )}

        {isSilentModeAvailable && isSilentModeOn && (
          <RoomSettingsButton
            titleKey={'silentModeOn'}
            icon={'icRaisedHandSmall'}
            onPress={onTurnSilentModeOff}
            hintKey={'silentModeOnHint'}
          />
        )}

        {isSilentModeAvailable && !isSilentModeOn && (
          <RoomSettingsButton
            titleKey={'silentModeOff'}
            icon={'icRaisedHandSmall'}
            onPress={onTurnSilentModeOn}
            hintKey={'silentModeOffHint'}
          />
        )}
      </View>

      <BottomSheetFlatList
        style={styles.list}
        data={admins}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={<HeaderView />}
        ListFooterComponent={
          isShowFooter ? (
            <FooterView onEndRoomPress={onEndRoomPress} />
          ) : undefined
        }
        renderItem={({item}) => (
          <AdminListItemView isOwner={item.id === ownerId} user={item} />
        )}
      />
    </View>
  )
}

export default observer(ManageRoomListView)

const styles = StyleSheet.create({
  contentContainer: {
    overflow: 'visible',
  },

  list: {
    paddingHorizontal: ms(16),
    overflow: 'visible',
  },

  sectionTitle: {
    textTransform: 'uppercase',
    width: '100%',
    ...makeTextStyle(ms(11), ms(15), 'bold'),
  },

  endRoomButton: {
    height: ms(38),
    borderRadius: ms(38) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ms(60),
    marginTop: ms(16),
  },

  endRoomButtonText: {
    color: 'white',
    ...makeTextStyle(ms(15), ms(18), '600'),
  },

  footerView: {
    alignItems: 'center',
    borderTopWidth: ms(1),
    marginTop: ms(16),
    marginBottom: ms(16),
  },

  privacyControlsContainer: {
    marginHorizontal: ms(16),
    marginBottom: ms(37),
    alignItems: 'center',
  },

  publicRoomLabel: {
    marginTop: ms(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: ms(38),
  },

  publicRoomLabelText: {
    fontSize: ms(12),
    fontWeight: 'bold',
    lineHeight: ms(18),
    marginStart: ms(6),
  },
})

import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import {
  addToAdmin,
  moveFromStage,
  moveToStage,
  removeFromAdmin,
} from '../../../appEventEmitter'
import {useTheme} from '../../../theme/appTheme'
import {isWebOrTablet} from '../../../utils/device.utils'
import {ms} from '../../../utils/layout.utils'
import {popToTop} from '../../../utils/navigation.utils'
import {useBottomSafeArea} from '../../../utils/safeArea.utils'
import BottomGradientView from '../../common/BottomGradientView'
import Horizontal from '../../common/Horizontal'
import PrimaryButton from '../../common/PrimaryButton'
import PrimaryPaleButton from '../../common/PrimaryPaleButton'
import Spacer from '../../common/Spacer'
import Vertical from '../../common/Vertical'
import {RoomType} from '../room/jitsi/RoomManager'
import {UserRoomMode} from '../room/models/jsonModels'

export interface ProfileRoomBottomButtonsProps {
  readonly userId: string
  readonly isCurrentUserAdmin: boolean
  readonly isCurrentUser: boolean
  readonly isUserAdmin: boolean
  readonly isUserOwner: boolean
  readonly roomType: RoomType
  readonly userMode: UserRoomMode
  readonly userIsLocal: boolean
  readonly videoEnabled: boolean
  readonly audioEnabled: boolean
  readonly isConnected?: boolean
}

interface Props {
  readonly isConnected: boolean
  readonly onPrivateMeetingPress: () => void
  readonly params?: ProfileRoomBottomButtonsProps
}

export const profileRoomBottomButtonsHeightBase = ms(30 + 16 + 30 + 16 + 32)
export const profileRoomBottomButtonsHeight = isWebOrTablet()
  ? profileRoomBottomButtonsHeightBase * 1.5
  : profileRoomBottomButtonsHeightBase

export const isProfileButtonsVisible = (
  storeId: string,
  isConnected: boolean,
  params?: ProfileRoomBottomButtonsProps,
): boolean => {
  if (isConnected) return true
  if (!params) return false
  if (params.userId !== storeId) return false

  const isShowGoToAudience =
    params.roomType !== 'networking' &&
    params.userMode === 'room' &&
    (params.userIsLocal || params.isCurrentUserAdmin)
  const isShowRemoveFromModerators =
    params.isCurrentUserAdmin &&
    params.isUserAdmin &&
    !params.userIsLocal &&
    !params.isUserOwner
  const isShowInviteAsSpeaker =
    params.userMode === 'popup' &&
    params.isCurrentUserAdmin &&
    !params.userIsLocal
  const isShowMoveToStage =
    params.userMode === 'popup' &&
    params.isCurrentUserAdmin &&
    params.userIsLocal
  const isShowAddToModerators =
    params.isCurrentUserAdmin && !params.isUserAdmin && !params.isCurrentUser

  return !(
    !isShowGoToAudience &&
    !isShowRemoveFromModerators &&
    !isShowInviteAsSpeaker &&
    !isShowMoveToStage &&
    !isShowAddToModerators
  )
}

const ProfileRoomBottomButtons: React.FC<Props> = ({
  isConnected,
  onPrivateMeetingPress,
  params,
}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const navigation = useNavigation()
  const inset = useBottomSafeArea()

  const isShowGoToAudience =
    params?.roomType !== 'networking' &&
    params?.userMode === 'room' &&
    (params?.userIsLocal || params?.isCurrentUserAdmin)
  const isShowRemoveFromModerators =
    params?.isCurrentUserAdmin &&
    params?.isUserAdmin &&
    !params?.userIsLocal &&
    !params?.isUserOwner
  const isShowInviteAsSpeaker =
    params?.userMode === 'popup' &&
    params?.isCurrentUserAdmin &&
    !params?.userIsLocal
  const isShowMoveToStage =
    params?.userMode === 'popup' &&
    params?.isCurrentUserAdmin &&
    params?.userIsLocal
  const isShowAddToModerators =
    params?.isCurrentUserAdmin && !params?.isUserAdmin && !params?.isCurrentUser

  const accentBackground = {backgroundColor: colors.accentSecondary}
  const title = {color: colors.accentPrimary, fontSize: ms(12)}

  return (
    <BottomGradientView height={profileRoomBottomButtonsHeight + inset}>
      <Vertical style={styles.bottomButtons}>
        {isConnected && (
          <>
            <PrimaryPaleButton
              title={t('privateMeetingText')}
              onPress={onPrivateMeetingPress}
              accessibilityLabel={'profilePrivateMeetingButton'}
            />
            <Spacer vertical={ms(16)} />
          </>
        )}
        <Horizontal>
          {isShowGoToAudience && (
            <>
              <PrimaryButton
                shouldVibrateOnClick
                style={[styles.button, accentBackground]}
                textStyle={title}
                accessibilityLabel={'goToAudience'}
                title={t('userBottomSheetGoToAudience')}
                onPress={() => {
                  moveFromStage(params.userId)
                  popToTop(navigation)
                }}
              />
              <Spacer horizontal={ms(16)} />
            </>
          )}

          {isShowInviteAsSpeaker && (
            <>
              <PrimaryButton
                shouldVibrateOnClick
                style={[styles.button, accentBackground]}
                textStyle={title}
                title={t('userBottomSheetInviteAsSpeaker')}
                icon={'icSpeaker'}
                onPress={() => {
                  moveToStage(params.userId, true)
                  popToTop(navigation)
                }}
              />
              <Spacer horizontal={ms(16)} />
            </>
          )}

          {isShowMoveToStage && (
            <>
              <PrimaryButton
                shouldVibrateOnClick
                style={[styles.button, accentBackground]}
                textStyle={title}
                title={t('userBottomSheetMakeAsSpeaker')}
                onPress={() => {
                  moveToStage(params.userId, false)
                  popToTop(navigation)
                }}
              />
              <Spacer horizontal={ms(16)} />
            </>
          )}

          {isShowRemoveFromModerators && (
            <>
              <PrimaryButton
                shouldVibrateOnClick
                style={[styles.button, {backgroundColor: colors.warning}]}
                textStyle={[{color: colors.textPrimary, fontSize: ms(12)}]}
                title={t('removeFromModeratorButton')}
                onPress={() => {
                  removeFromAdmin(params.userId)
                  popToTop(navigation)
                }}
              />
              <Spacer horizontal={ms(16)} />
            </>
          )}

          {isShowAddToModerators && (
            <PrimaryButton
              style={[styles.button, accentBackground]}
              textStyle={title}
              icon={'icModerator'}
              title={t('addToModeratorButton')}
              onPress={() => {
                addToAdmin(params.userId)
                popToTop(navigation)
              }}
            />
          )}
        </Horizontal>
      </Vertical>
    </BottomGradientView>
  )
}

export default ProfileRoomBottomButtons

const styles = StyleSheet.create({
  bottomButtons: {
    marginHorizontal: ms(16),
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  button: {
    height: ms(30),
    paddingHorizontal: ms(8),
    flex: 1,
    minWidth: undefined,
    minHeight: undefined,
    maxWidth: ms(209),
  },
})

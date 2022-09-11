import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {DraftType, LanguageModel} from '../../../models'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {useBottomSafeArea} from '../../../utils/safeArea.utils'
import {toastHelper} from '../../../utils/ToastHelper'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import PrimaryButton from '../../common/PrimaryButton'
import RoomName from './RoomName'
import RoomTypesListView from './RoomTypesListView'
import StartRoomLanguageButton from './StartRoomLanguageButton'

const toastId = 'ID_TOAST_ROOM_IS_PRIVATE'

interface Props {
  readonly roomName: string
  readonly onAddRoomNamePress: () => void
  readonly onCreatePress: () => void
  readonly isPrivateDefault: boolean
  readonly isPrivate: boolean
  readonly language?: LanguageModel
  readonly onLanguageSelect: () => void
  readonly onSetPrivate: (isPrivate: boolean) => void
  readonly onDraftSelect: (draft: DraftType) => void
}

const StartRoomNameFooter: React.FC<Props> = (props) => {
  const {colors} = useTheme()
  const {t} = useTranslation()
  const inset = useBottomSafeArea()

  const onLockPress = () => {
    const newPrivacyState = !props.isPrivate
    props.onSetPrivate(newPrivacyState)
    const messageRes = newPrivacyState ? 'roomWillPrivate' : 'roomWillPublic'
    if (newPrivacyState !== props.isPrivateDefault) {
      toastHelper.success(messageRes, true, {
        id: toastId,
        queueMode: 'immediate',
      })
    } else {
      toastHelper.clearByToastId(toastId)
    }
  }

  return (
    <>
      <RoomName
        roomName={props.roomName}
        onAddRoomNamePress={props.onAddRoomNamePress}
      />

      <RoomTypesListView onDraftSelect={props.onDraftSelect} />

      <View style={[styles.buttonsContainer, {marginBottom: inset + ms(32)}]}>
        <StartRoomLanguageButton
          style={styles.languageSelector}
          language={props.language}
          onPress={props.onLanguageSelect}
        />
        <PrimaryButton
          style={[styles.primaryButton, {backgroundColor: colors.textPrimary}]}
          textStyle={{color: colors.secondaryHeader}}
          accessibilityLabel={'createNewRoomButton'}
          title={t('createNewRoomButton')}
          onPress={props.onCreatePress}
        />
        <AppTouchableOpacity
          style={styles.privacyIndicator}
          onPress={onLockPress}
          shouldVibrateOnClick>
          <AppIcon
            type={props.isPrivate ? 'icClosedLock' : 'icOpenedLock'}
            tint={colors.textPrimary}
          />
        </AppTouchableOpacity>
      </View>
    </>
  )
}

export default StartRoomNameFooter

const styles = StyleSheet.create({
  primaryButton: {
    minWidth: ms(142),
  },

  buttonsContainer: {
    width: '100%',
    maxWidth: ms(375),
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: ms(32),
  },
  languageSelector: {
    position: 'absolute',
    left: ms(27),
    width: ms(48),
    height: ms(48),
  },
  privacyIndicator: {
    position: 'absolute',
    right: ms(27),
    width: ms(48),
    height: ms(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
})

import {observer} from 'mobx-react'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import {analytics} from '../../../Analytics'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import {WsCurrentUser} from './models/jsonModels'

interface Props {
  readonly onMoveToStage: () => void
  readonly currentUser: WsCurrentUser | null
  readonly roomId: string | undefined
  readonly eventId: string | undefined
}

const BackToStageButton: React.FC<Props> = ({
  currentUser,
  onMoveToStage,
  roomId,
  eventId,
}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()

  if (!currentUser) return null

  const background = {
    backgroundColor: currentUser.isHandRaised
      ? colors.accentPrimary
      : colors.floatingBackground,
  }

  const textColor = {
    color: currentUser.isHandRaised ? colors.textPrimary : colors.bodyText,
  }

  const text = t('userBottomSheetMakeAsSpeaker')

  const proxyOnPress = () => {
    analytics.sendEvent('click_admin_back_to_stage_button', {roomId, eventId})
    onMoveToStage()
  }

  return (
    <AppTouchableOpacity
      accessibilityLabel={'BackToStageButtonButton'}
      nativeID={'BackToStageButton'}
      style={[styles.button, background]}
      shouldVibrateOnClick
      onPress={proxyOnPress}>
      <AppText style={[styles.title, textColor]}>{text}</AppText>
    </AppTouchableOpacity>
  )
}

export default observer(BackToStageButton)

const styles = StyleSheet.create({
  button: {
    height: ms(48),
    paddingHorizontal: ms(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(48 / 2),
    marginStart: ms(16),
  },

  title: {
    fontSize: ms(13),
    fontWeight: 'bold',
    marginStart: ms(8),
    marginEnd: ms(8),
  },
})

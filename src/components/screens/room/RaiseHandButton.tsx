import {observer} from 'mobx-react'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import {RoomManager} from './jitsi/RoomManager'
import UserManager from './jitsi/UserManager'

interface Props {
  readonly roomManager: RoomManager
  readonly userManager: UserManager
}

const RaiseHandButton: React.FC<Props> = ({userManager, roomManager}) => {
  const {t} = useTranslation()
  const {colors} = useTheme()

  const user = userManager.user
  if (!user) return null
  const isHandRaised = user.isHandRaised

  const background = {
    backgroundColor: isHandRaised
      ? colors.accentPrimary
      : colors.floatingBackground,
  }

  const textColor = {
    color: isHandRaised ? colors.textPrimary : colors.bodyText,
  }

  const text = t(isHandRaised ? 'raisedButton' : 'raiseButton')

  return (
    <AppTouchableOpacity
      accessibilityLabel={'RaiseHandButton'}
      style={[styles.button, background]}
      onPress={() => {
        if (isHandRaised) roomManager.handDown('user')
        else roomManager.handUp()
      }}>
      <AppIcon type={'icRaiseHand'} />
      <AppText style={[styles.title, textColor]}>{text}</AppText>
    </AppTouchableOpacity>
  )
}

export default observer(RaiseHandButton)

const styles = StyleSheet.create({
  button: {
    height: ms(42),
    paddingHorizontal: ms(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(48) / 2,
    marginEnd: ms(16),
  },

  title: {
    fontSize: ms(13),
    fontWeight: 'bold',
    marginStart: ms(8),
  },
})

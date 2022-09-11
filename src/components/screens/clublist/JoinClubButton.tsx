import {observer} from 'mobx-react'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import {Unknown, UserClubRole} from '../../../models'
import {makeTextStyle, useTheme} from '../../../theme/appTheme'
import {isJoinedClub} from '../../../utils/club.utils'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Vertical from '../../common/Vertical'

interface Props {
  readonly clubRole: UserClubRole | Unknown
  readonly onToggleJoinPress?: () => void
  readonly isLoading?: boolean
}

const JoinClubButton: React.FC<Props> = (props) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  const buttonStyleJoin = {backgroundColor: colors.accentPrimary}
  const buttonStyleJoined = {backgroundColor: colors.accentSecondary}
  const buttonStyle = isJoinedClub(props.clubRole)
    ? buttonStyleJoined
    : buttonStyleJoin
  const statusTextStyle = {color: colors.thirdBlack}
  const isStatusOnly =
    props.clubRole === 'owner' || props.clubRole === 'join_request_moderation'
  let buttonTextStyle = {color: colors.primaryClickable}
  let text = ''
  switch (props.clubRole) {
    case 'join_request_moderation':
      text = t('clubRegistrationRequestTitle')
      break
    case 'moderator':
    case 'member':
      text = t('joinedClub')
      break
    case 'owner':
      text = t('clubOwner')
      break
    default:
      text = t('joinClubButton')
      buttonTextStyle = {color: colors.indicatorColorInverse}
  }
  if (props.isLoading) {
    text = t('loading')
  }

  return (
    <Vertical>
      {isStatusOnly && (
        <AppText style={[styles.statusText, statusTextStyle]}>{text}</AppText>
      )}
      {!isStatusOnly && (
        <AppTouchableOpacity
          style={[styles.button, buttonStyle]}
          onPress={props.onToggleJoinPress}>
          <AppText style={[styles.buttonText, buttonTextStyle]}>{text}</AppText>
        </AppTouchableOpacity>
      )}
    </Vertical>
  )
}

export default observer(JoinClubButton)

const styles = StyleSheet.create({
  statusText: {
    ...makeTextStyle(ms(12), ms(18), 'bold'),
  },
  button: {
    height: ms(28),
    borderRadius: ms(28),
    alignContent: 'center',
    justifyContent: 'center',
    paddingHorizontal: ms(12),
  },
  buttonText: {
    alignSelf: 'center',
    ...makeTextStyle(12, 16, 'bold'),
  },
  counter: {
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: ms(40),
    marginStart: ms(4),
  },
  counterText: {
    paddingHorizontal: ms(4),
    fontSize: ms(10),
    fontWeight: '700',
    lineHeight: ms(12),
  },
})

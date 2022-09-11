import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import {analytics} from '../../../Analytics'
import AppIcon from '../../../assets/AppIcon'
import {ClubInfoModel} from '../../../models'
import ClubStore from '../../../stores/ClubStore'
import {makeTextStyle, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  readonly store: ClubStore
  readonly isModal?: boolean
}

const ClubEventButton: React.FC<Props> = (p) => {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const navigation = useNavigation()

  const textStyle = makeTextStyle(ms(12), ms(18), 'bold')

  const club = p.store.club
  if (!club) return null
  if (p.store.isLoading) return null

  switch (club.clubRole) {
    case 'moderator':
    case 'owner':
      break
    default:
      return null
  }

  const onEventPress = () => {
    analytics.sendEvent('club_add_event_header_button_click')
    const args = {selectedClub: club as ClubInfoModel, isModal: p.isModal}
    navigation.navigate('CreateEventScreen', args)
  }

  return (
    <AppTouchableOpacity
      style={[styles.button, {backgroundColor: colors.secondaryClickable}]}
      onPress={onEventPress}>
      <AppIcon
        style={styles.icon}
        type={'icAdd16'}
        tint={colors.accentPrimary}
      />
      <AppText style={[textStyle, styles.text, {color: colors.accentPrimary}]}>
        {t('createEventClubButton')}
      </AppText>
    </AppTouchableOpacity>
  )
}

export default ClubEventButton

const styles = StyleSheet.create({
  button: {
    borderRadius: ms(24),
    height: ms(28),
    marginEnd: ms(6),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: ms(12),
  },
  text: {
    alignSelf: 'center',
  },
  icon: {
    marginTop: ms(1),
    marginEnd: ms(2),
  },
})

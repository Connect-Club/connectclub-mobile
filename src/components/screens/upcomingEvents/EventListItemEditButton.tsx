import {useNavigation} from '@react-navigation/native'
import React, {memo} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleProp, TextStyle, ViewStyle} from 'react-native'

import {appEventEmitter} from '../../../appEventEmitter'
import {EventModel} from '../../../models'
import {storage} from '../../../storage'
import {useTheme} from '../../../theme/appTheme'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  readonly event: EventModel
  readonly style?: StyleProp<ViewStyle>
  readonly textStyle?: StyleProp<TextStyle>
}

const EventListItemEditButton: React.FC<Props> = (props) => {
  const {colors} = useTheme()
  const {t} = useTranslation()
  const navigation = useNavigation()

  const currentUserId = storage.currentUser?.id
  const isCoHost =
    currentUserId &&
    !!props.event.participants.find(
      (p) => p.id === currentUserId && !p.isSpecialGuest,
    )
  const isShowEdit = props.event.isOwned || isCoHost

  const onEditPress = () => {
    appEventEmitter.trigger('hideEventDialog')
    navigation.navigate('CreateEventScreen', {event: props.event})
  }

  if (!isShowEdit) return null

  return (
    <AppTouchableOpacity onPress={onEditPress} style={props.style}>
      <AppText style={[props.textStyle, {color: colors.accentPrimary}]}>
        {t('editButton')}
      </AppText>
    </AppTouchableOpacity>
  )
}

export default memo(EventListItemEditButton)

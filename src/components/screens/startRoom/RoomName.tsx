import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet} from 'react-native'

import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Horizontal from '../../common/Horizontal'

interface Props {
  readonly roomName: string
  readonly onAddRoomNamePress: () => void
}

const RoomName: React.FC<Props> = (props) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  const isEmptyName = props.roomName.length === 0

  return (
    <Horizontal style={styles.horizontal}>
      {!isEmptyName && (
        <AppText
          numberOfLines={1}
          style={[{color: colors.textPrimary}, styles.roomName]}>
          {props.roomName}・
        </AppText>
      )}
      <AppTouchableOpacity
        accessibilityLabel={'addRoomNameButton'}
        onPress={props.onAddRoomNamePress}>
        <AppText style={[styles.addRoomName]}>
          {props.roomName.length === 0
            ? t('startRoomAddRoomNameButton')
            : t('editButton')}
        </AppText>
      </AppTouchableOpacity>
    </Horizontal>
  )
}

export default RoomName

const styles = StyleSheet.create({
  addRoomName: {
    fontSize: ms(15),
    fontWeight: 'bold',
    textAlign: 'center',
    height: ms(38),
    lineHeight: ms(38),
    color: '#5DC56E',
  },

  roomName: {
    fontWeight: 'bold',
  },

  horizontal: {
    alignItems: 'center',
    maxWidth: '100%',
    paddingHorizontal: ms(32),
    marginTop: ms(16),
  },
})

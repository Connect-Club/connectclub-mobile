import React, {useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleProp, StyleSheet, ViewStyle} from 'react-native'

import {removeFromAdmin} from '../../../appEventEmitter'
import {UserModel} from '../../../models'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import RoomBottomSheetUserListItem from './RoomBottomSheetUserListItem'

interface Props {
  readonly user: UserModel
  readonly isOwner: boolean
  readonly style?: StyleProp<ViewStyle>
}

const AdminListItemView: React.FC<Props> = ({user, isOwner}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  const right = useCallback(() => {
    return (
      <AppTouchableOpacity
        style={[styles.addButton, {backgroundColor: colors.accentSecondary}]}
        onPress={() => removeFromAdmin(user.id)}>
        <AppText
          style={[styles.removeButtonText, {color: colors.accentPrimary}]}>
          {t('remove')}
        </AppText>
      </AppTouchableOpacity>
    )
  }, [])

  return (
    <RoomBottomSheetUserListItem
      user={user}
      right={!isOwner ? right : undefined}
    />
  )
}

export default AdminListItemView

const styles = StyleSheet.create({
  addButton: {
    paddingHorizontal: ms(16),
    height: ms(28),
    borderRadius: ms(28) / 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },

  removeButtonText: {
    fontWeight: 'bold',
    fontSize: ms(12),
  },

  id: {
    position: 'absolute',
    top: 0,
    color: 'white',
    backgroundColor: 'black',
    fontSize: ms(8),
  },
})

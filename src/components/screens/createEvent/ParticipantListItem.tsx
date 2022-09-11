import React, {memo} from 'react'
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {UserModel} from '../../../models'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {profileFullName, profileShortName} from '../../../utils/userHelper'
import AppAvatar from '../../common/AppAvatar'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Checked from '../../common/Checked'
import Horizontal from '../../common/Horizontal'

interface Props {
  readonly user: UserModel
  readonly style?: StyleProp<ViewStyle>
  readonly onPress?: (user: UserModel) => void
  readonly isSelected?: boolean
  readonly isRemovable?: boolean
  readonly showTopSeparator?: boolean
}

const ParticipantListItem: React.FC<Props> = ({
  user,
  style,
  onPress,
  isSelected,
  isRemovable,
  showTopSeparator,
}) => {
  const {colors} = useTheme()
  const bodyText = {color: colors.bodyText}

  return (
    <AppTouchableOpacity
      style={[styles.listItem, style]}
      onPress={() => onPress?.(user)}>
      {showTopSeparator && (
        <View style={[styles.separator, {backgroundColor: colors.separator}]} />
      )}
      <Horizontal style={styles.container}>
        <AppAvatar
          shortName={profileShortName(user.name, user.surname)}
          avatar={user.avatar}
          style={styles.avatar}
          size={ms(32)}
        />
        <AppText
          style={[styles.withNameText, bodyText]}
          numberOfLines={1}
          ellipsizeMode={'tail'}>
          {profileFullName(user.name, user.surname)}
        </AppText>

        {isSelected === true && <Checked size={24} />}
        {isRemovable === true && (
          <AppIcon style={styles.iconClose} tint={'black'} type={'icClose'} />
        )}
      </Horizontal>
    </AppTouchableOpacity>
  )
}

export default memo(ParticipantListItem)

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    height: ms(56),
  },
  avatar: {
    width: ms(32),
    height: ms(32),
  },
  listItem: {
    width: '100%',
    height: ms(56),
    justifyContent: 'center',
    margin: 2,
  },
  withNameText: {
    fontSize: ms(17),
    paddingStart: ms(8),
    flex: 1,
  },
  separator: {
    height: ms(1),
    width: '100%',
  },
  iconClose: {marginEnd: 12},
})

import React from 'react'
import {StyleSheet} from 'react-native'

import {UserModel} from '../../../models'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {getUserShortName} from '../../../utils/userHelper'
import AppAvatar from '../../common/AppAvatar'
import AppText from '../../common/AppText'
import Horizontal from '../../common/Horizontal'
import Vertical from '../../common/Vertical'

interface Props {
  readonly user: UserModel
}

const ReportingOnUserView: React.FC<Props> = ({user}) => {
  const {colors} = useTheme()

  return (
    <Horizontal style={styles.userContainer}>
      <AppAvatar
        size={ms(40)}
        avatar={user.avatar}
        style={styles.avatar}
        shortName={getUserShortName(user)}
      />
      <Vertical style={styles.userTextContainer}>
        <AppText
          style={[styles.userDisplayName, {color: colors.bodyText}]}
          ellipsizeMode={'tail'}
          numberOfLines={1}>
          {user.displayName}
        </AppText>
        <AppText
          style={[styles.userUsername, {color: colors.secondaryBodyText}]}
          ellipsizeMode={'tail'}
          numberOfLines={1}>
          @{user.username}
        </AppText>
      </Vertical>
    </Horizontal>
  )
}

export default ReportingOnUserView

const styles = StyleSheet.create({
  avatar: {
    width: ms(40),
    height: ms(40),
  },

  userContainer: {
    marginTop: ms(8),
  },

  userTextContainer: {
    marginStart: ms(12),
    justifyContent: 'center',
    flex: 1,
  },

  userDisplayName: {
    fontSize: ms(12),
    fontWeight: 'bold',
  },

  userUsername: {
    fontSize: ms(12),
  },
})

import React, {useCallback} from 'react'
import {Platform, ScrollView, StyleSheet, View} from 'react-native'

import {RasterIconType} from '../../../assets/rasterIcons'
import {UserModel} from '../../../models'
import {useTheme} from '../../../theme/appTheme'
import {
  getClubRoleBadgeForUser,
  getSpecialRoleBadgeForUser,
} from '../../../utils/avatar.utils'
import {ms} from '../../../utils/layout.utils'
import {getUserShortName} from '../../../utils/userHelper'
import AppAvatarWithBadge from '../../common/AppAvatarWithBadge'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Horizontal from '../../common/Horizontal'

interface Props {
  readonly participants: Array<UserModel>
  readonly onMemberPress?: (user: UserModel, dismiss: boolean) => void
  readonly badgesWithBorder: boolean
}

const Wrapper: React.FC = ({children}) => {
  return Platform.OS === 'android' ? <View>{children}</View> : <>{children}</>
}

const UpcomingEventListItemParticipants: React.FC<Props> = (props) => {
  const {colors} = useTheme()

  const borderStyle = {
    borderWidth: ms(1),
    borderColor: colors.separator,
  }

  const renderParticipant = useCallback(
    (m: UserModel) => {
      let icon: RasterIconType | undefined = getSpecialRoleBadgeForUser(m)
      if (!icon) icon = getClubRoleBadgeForUser(m.clubRole)
      return (
        <AppTouchableOpacity
          onPress={() => props.onMemberPress?.(m, false)}
          key={m.id}
          style={styles.member}>
          <AppAvatarWithBadge
            icon={icon}
            key={m.id}
            avatar={m.avatar}
            shortName={getUserShortName(m)}
            style={styles.avatar}
            size={ms(32)}
            badgeStyle={props.badgesWithBorder ? borderStyle : undefined}
          />
        </AppTouchableOpacity>
      )
    },
    [props],
  )

  return (
    <Wrapper>
      <ScrollView
        contentContainerStyle={styles.membersContent}
        horizontal={true}
        showsHorizontalScrollIndicator={false}>
        <Horizontal>
          {props.participants.map((m) => renderParticipant(m))}
        </Horizontal>
      </ScrollView>
    </Wrapper>
  )
}

export default UpcomingEventListItemParticipants

const styles = StyleSheet.create({
  member: {
    marginEnd: ms(8),
  },

  membersContent: {
    marginTop: ms(8),
  },

  avatar: {
    width: ms(32),
    height: ms(32),
  },
})

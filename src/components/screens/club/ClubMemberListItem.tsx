import {useNavigation} from '@react-navigation/native'
import React, {memo, useCallback, useRef} from 'react'
import {StyleSheet, View} from 'react-native'
import {SwipeRow} from 'react-native-swipe-list-view'

import AppIcon, {AppIconType} from '../../../assets/AppIcon'
import {UserModel} from '../../../models'
import {ClubOptions} from '../../../screens/ProfileScreen'
import {storage} from '../../../storage'
import {commonStyles, makeTextStyle, useTheme} from '../../../theme/appTheme'
import {getClubRoleBadgeForUser} from '../../../utils/avatar.utils'
import {ms} from '../../../utils/layout.utils'
import {push} from '../../../utils/navigation.utils'
import {shortFromDisplayName} from '../../../utils/userHelper'
import AppAvatarWithBadge from '../../common/AppAvatarWithBadge'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Horizontal from '../../common/Horizontal'
import MarkdownHyperlink from '../profileScreen/MarkdownHyperlink'

interface ClubMemberListItemProps {
  readonly member: UserModel
  readonly index: number
  readonly onPromotePress?: (item: UserModel) => void
  readonly onRemovePress?: (item: UserModel) => void
}

const ClubMemberListItem: React.FC<ClubMemberListItemProps> = ({member}) => {
  const {colors} = useTheme()
  const navigation = useNavigation()

  const onUserPress = useCallback(() => {
    const clubOptions: ClubOptions = {}
    push(navigation, 'ProfileScreenModal', {userId: member.id, clubOptions})
  }, [navigation, member.id])
  const about = member.about?.trim()
  return (
    <AppTouchableOpacity
      style={[
        styles.base,
        styles.clickableContainer,
        {backgroundColor: colors.systemBackground},
      ]}
      onPress={onUserPress}>
      <AppAvatarWithBadge
        containerStyle={styles.avatar}
        icon={getClubRoleBadgeForUser(member.clubRole)}
        shortName={shortFromDisplayName(member.displayName)}
        scale={0.4}
        avatar={member.avatar}
        size={ms(40)}
        offset={ms(28)}
      />
      <View style={styles.textContainer}>
        <AppText style={styles.nameText}>{member.displayName}</AppText>
        {!!about && (
          <MarkdownHyperlink linkStyle={commonStyles.link}>
            <AppText
              style={[
                styles.descriptionText,
                {color: colors.secondaryBodyText},
              ]}
              numberOfLines={2}>
              {about}
            </AppText>
          </MarkdownHyperlink>
        )}
      </View>
    </AppTouchableOpacity>
  )
}

export const ClubMemberActionsView: React.FC<ClubMemberListItemProps> = memo(
  ({member, onPromotePress, onRemovePress}) => {
    const {colors} = useTheme()
    const promoteIconType: AppIconType =
      member.clubRole === 'moderator' ? 'icCrownFilled24' : 'icCrown24'

    return (
      <Horizontal style={styles.actionsContainer}>
        <AppTouchableOpacity
          onPress={() => onPromotePress?.(member)}
          style={[
            styles.adminButton,
            {backgroundColor: colors.secondaryClickable},
          ]}>
          <AppIcon type={promoteIconType} tint={colors.accentPrimary} />
        </AppTouchableOpacity>
        <AppTouchableOpacity
          onPress={() => onRemovePress?.(member)}
          style={[
            styles.removeButton,
            {backgroundColor: colors.secondaryClickable},
          ]}>
          <AppIcon type={'icBucket24'} tint={colors.warning} />
        </AppTouchableOpacity>
      </Horizontal>
    )
  },
)

interface RowProps extends ClubMemberListItemProps {
  readonly canModerate: boolean
}

export const ClubMemberListRow: React.FC<RowProps> = (props) => {
  const rowRef = useRef<SwipeRow<any>>()
  const disableLeft =
    !props.canModerate ||
    props.member.id === storage.currentUser!.id ||
    props.member.clubRole === 'owner'
  const onPromotePressInternal = (item: UserModel) => {
    rowRef.current!.closeRow()
    props.onPromotePress?.(item)
  }
  const onRemovePressInternal = (item: UserModel) => {
    rowRef.current!.closeRow()
    props.onRemovePress?.(item)
  }
  return (
    <SwipeRow
      ref={rowRef}
      rightOpenValue={-ms(142)}
      disableRightSwipe
      disableLeftSwipe={disableLeft}>
      <ClubMemberActionsView
        member={props.member}
        index={props.index}
        onPromotePress={onPromotePressInternal}
        onRemovePress={onRemovePressInternal}
      />
      <ClubMemberListItem member={props.member} index={props.index} />
    </SwipeRow>
  )
}

export default memo(ClubMemberListRow)

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    paddingHorizontal: ms(16),
    paddingVertical: ms(14),
  },
  clickableContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  avatar: {
    alignSelf: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    marginStart: ms(16),
    marginEnd: ms(16),
  },
  nameText: {
    ...makeTextStyle(ms(12), ms(16), 'bold'),
  },
  descriptionText: {
    ...makeTextStyle(ms(12), ms(16), 'normal'),
  },
  button: {
    height: ms(28),
    marginStart: ms(8),
    marginEnd: ms(12),
    paddingHorizontal: ms(12),
    alignSelf: 'center',
    borderRadius: ms(100),
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    alignSelf: 'center',
    ...makeTextStyle(ms(12), ms(18), 'bold'),
  },
  connectButton: {
    alignSelf: 'center',
  },
  actionsContainer: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingEnd: ms(16),
  },
  adminButton: {
    width: ms(48),
    height: ms(48),
    borderRadius: ms(24),
    ...commonStyles.flexCenter,
    marginEnd: ms(20),
  },
  removeButton: {
    width: ms(48),
    height: ms(48),
    borderRadius: ms(24),
    ...commonStyles.flexCenter,
  },
})

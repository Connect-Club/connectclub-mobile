import {observer} from 'mobx-react'
import React, {useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {ClubUser} from '../../../models'
import {ClubRequestsStore} from '../../../stores/ClubRequestsStore'
import ClubStore from '../../../stores/ClubStore'
import {
  makeTextStyle,
  PRIMARY_BACKGROUND,
  useTheme,
} from '../../../theme/appTheme'
import {isAtLeastClubModerator} from '../../../utils/club.utils'
import {ms} from '../../../utils/layout.utils'
import {shortFromDisplayName} from '../../../utils/userHelper'
import {useViewModel} from '../../../utils/useViewModel'
import AppAvatar from '../../common/AppAvatar'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import FlexSpace from '../../common/FlexSpace'
import Horizontal from '../../common/Horizontal'
import InlineButton from '../../common/InlineButton'
import Section from '../../common/Section'
import Vertical from '../../common/Vertical'

const MAX_DISPLAYING_MEMBERS = 3

interface Props {
  readonly clubId: string
  readonly members: Array<ClubUser>
  readonly store: ClubStore
  readonly totalMembersCount: number
  readonly onMembersPress?: () => void
  readonly onModeratePress?: () => void
}

const ClubMembers: React.FC<Props> = ({
  store,
  members,
  totalMembersCount,
  onMembersPress,
  onModeratePress,
}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()
  const requestsStore = useViewModel(() => new ClubRequestsStore(store.clubId!))

  useEffect(() => {
    requestsStore.load(true)
  }, [requestsStore])

  const membersNames = members.map((m) => m.displayName).join(', ')
  const linkColor = {
    color:
      onMembersPress === undefined ? colors.bodyText : colors.accentPrimary,
  }
  const canModerate = isAtLeastClubModerator(store.club?.clubRole)

  return (
    <Vertical style={styles.base}>
      <Horizontal style={styles.header}>
        <Section
          onPress={onMembersPress}
          style={styles.sectionTitle}
          title={t('members').toUpperCase()}
          count={totalMembersCount}
        />
        <FlexSpace />
        {canModerate && (
          <>
            <InlineButton
              title={t('moderateClubButton')}
              textStyle={styles.moderateButtonText}
              onPress={onModeratePress}
            />
            {requestsStore.list.length > 0 && (
              <AppTouchableOpacity
                style={styles.counter}
                onPress={onModeratePress}>
                <AppText
                  style={[
                    styles.counterText,
                    {
                      backgroundColor: colors.accentPrimary,
                      color: colors.floatingBackground,
                    },
                  ]}>
                  {requestsStore.list.length > 9
                    ? '9+'
                    : requestsStore.list.length}
                </AppText>
              </AppTouchableOpacity>
            )}
          </>
        )}
      </Horizontal>
      <AppTouchableOpacity style={styles.content} onPress={onMembersPress}>
        <View style={styles.avatarsContainer}>
          {members.map((member) => (
            <AppAvatar
              key={member.id}
              style={styles.memberAvatar}
              shortName={shortFromDisplayName(member.displayName)}
              avatar={member.avatar}
              size={ms(32)}
              borderColor={PRIMARY_BACKGROUND}
            />
          ))}
        </View>
        <AppText style={styles.membersLineText}>
          {membersNames.length > 0 && (
            <AppText style={[styles.memberText, linkColor]}>
              {membersNames}
            </AppText>
          )}
          {totalMembersCount > MAX_DISPLAYING_MEMBERS && (
            <>
              {' '}
              {t('and')}
              <AppText style={[styles.memberText, linkColor]}>
                {` ${t('followedByShortInfoOthers', {
                  count: totalMembersCount - members.length,
                })}`}
              </AppText>
            </>
          )}
        </AppText>
      </AppTouchableOpacity>
    </Vertical>
  )
}

export default observer(ClubMembers)

const MEMBER_AVATAR_NEGATIVE_OFFSET = 8
const styles = StyleSheet.create({
  base: {
    paddingTop: ms(24),
  },
  header: {
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    paddingTop: ms(16),
    paddingStart: ms(MEMBER_AVATAR_NEGATIVE_OFFSET),
  },
  avatarsContainer: {
    flexDirection: 'row',
  },
  memberAvatar: {
    marginStart: -ms(MEMBER_AVATAR_NEGATIVE_OFFSET),
  },
  membersLineText: {
    flex: 1,
    alignSelf: 'center',
    marginStart: ms(12),
    ...makeTextStyle(ms(12), ms(16)),
  },
  memberText: {
    fontWeight: 'bold',
  },
  sectionTitle: {
    marginTop: ms(0),
    marginBottom: ms(0),
  },
  moderateButtonText: {
    ...makeTextStyle(11, 14, 'bold'),
  },
  counter: {
    alignSelf: 'center',
    overflow: 'hidden',
    borderRadius: ms(8),
    marginStart: ms(4),
  },
  counterText: {
    paddingHorizontal: ms(4),
    paddingVertical: ms(2),
    fontSize: ms(9),
    fontWeight: '700',
    lineHeight: ms(10),
  },
})

import {useNavigation} from '@react-navigation/native'
import React, {memo, useCallback} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {ClubParams, InvitedToClubInfoModel} from '../../../models'
import {commonStyles, makeTextStyle, useTheme} from '../../../theme/appTheme'
import {joinedSince} from '../../../utils/date.utils'
import {ms} from '../../../utils/layout.utils'
import {push} from '../../../utils/navigation.utils'
import {shortFromDisplayName} from '../../../utils/userHelper'
import AppAvatar from '../../common/AppAvatar'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Horizontal from '../../common/Horizontal'

interface Props {
  readonly invitedInfo: InvitedToClubInfoModel
}

const JoinedIntoClubBy: React.FC<Props> = ({invitedInfo}) => {
  const {colors} = useTheme()
  const navigation = useNavigation()
  const {t} = useTranslation()

  const onClubPress = useCallback(() => {
    const clubParams: ClubParams = {clubId: invitedInfo.id}
    navigation.navigate('ClubScreen', clubParams)
  }, [navigation, invitedInfo.id])

  const onInvitorPress = useCallback(() => {
    push(navigation, 'ProfileScreenModal', {
      userId: invitedInfo.by.id,
      showCloseButton: false,
    })
  }, [navigation, invitedInfo.by.id])

  return (
    <View style={styles.base}>
      <View style={styles.avatarsContainer}>
        <AppAvatar
          style={styles.memberAvatar}
          shortName={shortFromDisplayName(invitedInfo.title)}
          avatar={invitedInfo.avatar}
          size={ms(32)}
          borderColor={colors.floatingBackground}
        />
        <AppAvatar
          style={styles.memberAvatar}
          shortName={shortFromDisplayName(invitedInfo.by.displayName)}
          avatar={invitedInfo.by.avatar}
          size={ms(32)}
          borderColor={colors.floatingBackground}
        />
      </View>
      <View style={styles.membersContainer}>
        <AppText style={styles.membersLineText}>
          {t('joined', {date: joinedSince(invitedInfo.joinedAt)})}
        </AppText>
        <Horizontal style={[commonStyles.flexOne, commonStyles.flexWrap]}>
          <AppText style={styles.membersLineText}>
            {t('clubInvitedTo')}{' '}
          </AppText>
          <AppTouchableOpacity onPress={onClubPress}>
            <AppText
              style={[styles.highlightedText, {color: colors.accentPrimary}]}>
              {invitedInfo.title}
            </AppText>
          </AppTouchableOpacity>
          <AppText style={styles.membersLineText}>
            {' '}
            {t('whoInvitedInClubLabel')}{' '}
          </AppText>
          <AppTouchableOpacity onPress={onInvitorPress}>
            <AppText
              style={[styles.highlightedText, {color: colors.accentPrimary}]}>
              {invitedInfo.by.displayName}
            </AppText>
          </AppTouchableOpacity>
        </Horizontal>
      </View>
    </View>
  )
}

export default memo(JoinedIntoClubBy)

const MEMBER_AVATAR_NEGATIVE_OFFSET = 8
const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    marginHorizontal: ms(16),
    paddingStart: ms(MEMBER_AVATAR_NEGATIVE_OFFSET),
  },
  avatarsContainer: {
    flexDirection: 'row',
  },
  memberAvatar: {
    marginStart: -ms(MEMBER_AVATAR_NEGATIVE_OFFSET),
  },
  membersContainer: {
    flex: 1,
    alignSelf: 'center',
    paddingStart: ms(12),
  },
  membersLineText: {
    ...makeTextStyle(ms(12), ms(16)),
  },
  highlightedText: {
    ...makeTextStyle(ms(12), ms(16), 'bold'),
  },
})

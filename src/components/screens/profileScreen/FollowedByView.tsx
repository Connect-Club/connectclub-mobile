import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {
  Image,
  ImageStyle,
  Platform,
  StyleProp,
  StyleSheet,
  TextStyle,
  View,
} from 'react-native'

import {MUTUAL_SHORT_INFO_USERS_LIMIT} from '../../../api/api'
import {FollowedByShortModel, UserModel} from '../../../models'
import {useTheme} from '../../../theme/appTheme'
import {setSizeForAvatar} from '../../../utils/avatar.utils'
import {ms} from '../../../utils/layout.utils'
import {push} from '../../../utils/navigation.utils'
import {getUserShortName} from '../../../utils/userHelper'
import AppAvatar from '../../common/AppAvatar'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Horizontal from '../../common/Horizontal'

interface Props {
  readonly userId: string
  readonly info?: FollowedByShortModel
}

const AndroidAvatar: React.FC<{u: UserModel}> = ({u}) => {
  const {colors} = useTheme()
  const background: ImageStyle = {
    backgroundColor: colors.separator,
    borderWidth: ms(1),
    borderColor: colors.systemBackground,
  }

  if (u.avatar) {
    return (
      <Image
        source={{uri: setSizeForAvatar(u.avatar, 300, 300)}}
        style={[styles.avatar, background]}
        width={ms(32)}
        height={ms(32)}
        resizeMode={'cover'}
      />
    )
  }

  return <View style={[styles.avatar, background]} />
}

const FollowedByView: React.FC<Props> = ({info, userId}) => {
  const {colors} = useTheme()
  const navigation = useNavigation()
  const {t} = useTranslation()
  if (!info) return null
  if (info.users.length === 0) return null

  const joinedNames = info.users.map((u) => u.displayName).join(', ')
  const followedByStyles: Array<StyleProp<TextStyle>> = [
    styles.followedBy,
    {color: colors.bodyText},
  ]
  const nameTextStyles: Array<StyleProp<TextStyle>> = [
    styles.nameText,
    {color: colors.accentPrimary},
  ]

  return (
    <AppTouchableOpacity
      style={styles.base}
      onPress={() => push(navigation, 'MutualFollowsScreen', {userId})}>
      {info.users.map((u) => {
        if (Platform.OS === 'ios') {
          return (
            <AppAvatar
              style={[
                {
                  borderWidth: ms(1),
                  borderColor: colors.systemBackground,
                },
                styles.avatar,
              ]}
              key={u.id}
              size={ms(32)}
              avatar={u.avatar}
              shortName={getUserShortName(u)}
            />
          )
        }
        return <AndroidAvatar key={u.id} u={u} />
      })}
      <Horizontal style={styles.namesContainer}>
        <AppText style={nameTextStyles}>
          <AppText style={followedByStyles}>{t('connectedWith')} </AppText>
          {joinedNames}
          {info.totalCount > MUTUAL_SHORT_INFO_USERS_LIMIT && (
            <>
              <AppText style={followedByStyles}>&nbsp;{t('and')}&nbsp;</AppText>
              <AppText style={nameTextStyles}>
                {t('followedByShortInfoOthers', {
                  count: info.totalCount - MUTUAL_SHORT_INFO_USERS_LIMIT,
                })}
              </AppText>
            </>
          )}
        </AppText>
      </Horizontal>
    </AppTouchableOpacity>
  )
}

export default FollowedByView

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    marginBottom: ms(16),
    alignItems: 'center',
    paddingHorizontal: ms(16),
  },

  namesContainer: {
    flex: 1,
    flexWrap: 'wrap',
    marginStart: ms(20),
  },

  followedBy: {
    fontSize: ms(12),
    marginEnd: ms(8),
  },

  nameText: {
    fontWeight: '500',
    fontSize: ms(13),
  },

  avatar: {
    marginEnd: -ms(8),
    width: ms(32),
    height: ms(32),
    borderRadius: ms(32) / 2,
    overflow: 'hidden',
  },
})

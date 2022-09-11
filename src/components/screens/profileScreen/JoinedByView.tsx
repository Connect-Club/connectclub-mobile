import {useNavigation} from '@react-navigation/native'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {UserModel} from '../../../models'
import {commonStyles, useTheme} from '../../../theme/appTheme'
import {joinedSince} from '../../../utils/date.utils'
import {ms} from '../../../utils/layout.utils'
import {push} from '../../../utils/navigation.utils'
import {fullName, getUserShortName} from '../../../utils/userHelper'
import AppAvatar from '../../common/AppAvatar'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Horizontal from '../../common/Horizontal'
import Vertical from '../../common/Vertical'

interface Props {
  readonly user: UserModel
  readonly joinedByUser: UserModel
}

const JoinedByView: React.FC<Props> = ({user, joinedByUser}) => {
  const navigation = useNavigation()
  const {colors} = useTheme()
  const {t} = useTranslation()
  const bodyText = {color: colors.bodyText}

  const isTheSameUser = user.id === joinedByUser.id

  let onPress
  const Component =
    isTheSameUser || joinedByUser.isDeleted ? View : AppTouchableOpacity
  if (!isTheSameUser) {
    onPress = () => {
      push(navigation, 'ProfileScreen', {
        userId: joinedByUser.id,
        showCloseButton: false,
      })
    }
  }

  return (
    <Component
      accessibilityLabel={'joinedBy'}
      style={styles.touchable}
      activeOpacity={1}
      onPress={onPress}>
      <Horizontal style={{paddingHorizontal: ms(16)}}>
        <AppAvatar
          size={ms(36)}
          shortName={getUserShortName(joinedByUser)}
          avatar={joinedByUser.avatar}
          style={styles.avatar}
        />
        <Vertical style={[commonStyles.justifyCenter, commonStyles.flexOne]}>
          <AppText style={[styles.joinedText, bodyText]}>
            {t('joined', {
              date: joinedSince(user.createdAt),
            })}
          </AppText>
          <Horizontal>
            <AppText style={[styles.nominatedText, bodyText]}>
              {t('nominatedBy')}
            </AppText>
            <AppText
              style={[
                styles.fullNameText,
                commonStyles.flexOne,
                {
                  color: joinedByUser.isDeleted
                    ? colors.bodyText
                    : colors.accentPrimary,
                  fontWeight: joinedByUser.isDeleted ? 'normal' : 'bold',
                },
              ]}
              numberOfLines={1}
              ellipsizeMode={'tail'}>
              {fullName(joinedByUser)}
            </AppText>
          </Horizontal>
        </Vertical>
      </Horizontal>
    </Component>
  )
}

export default JoinedByView

const styles = StyleSheet.create({
  touchable: {
    paddingVertical: ms(6),
  },

  joinedText: {
    fontSize: ms(12),
  },

  nominatedText: {
    marginTop: ms(2),
    fontSize: ms(12),
  },

  fullNameText: {
    marginTop: ms(2),
    fontSize: ms(12),
  },

  avatar: {
    width: ms(36),
    height: ms(36),
    marginEnd: ms(8),
  },
})

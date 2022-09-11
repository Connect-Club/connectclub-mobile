import React, {memo} from 'react'
import {StyleSheet, View} from 'react-native'

import {UserModel} from '../../../models'
import {commonStyles, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {profileFullName, profileShortName} from '../../../utils/userHelper'
import AppAvatar from '../../common/AppAvatar'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Checked from '../../common/Checked'
import Vertical from '../../common/Vertical'
import MarkdownHyperlink from '../profileScreen/MarkdownHyperlink'

interface Props {
  readonly user: UserModel
  readonly isSelected: boolean
  readonly onSelect: (user: UserModel) => void
}

const FindPeopleListItem: React.FC<Props> = ({user, isSelected, onSelect}) => {
  const {colors} = useTheme()

  return (
    <AppTouchableOpacity
      style={[
        styles.clickableContainer,
        {backgroundColor: colors.floatingBackground},
      ]}
      onPress={() => onSelect(user)}>
      <View style={styles.base}>
        <AppAvatar
          size={ms(40)}
          style={styles.avatar}
          avatar={user.avatar}
          shortName={profileShortName(user.name, user.surname)}
        />
        <Vertical
          style={[
            styles.content,
            commonStyles.flexOne,
            commonStyles.justifyCenter,
          ]}>
          <AppText style={[styles.title, {color: colors.bodyText}]}>
            {profileFullName(user.name, user.surname)}
          </AppText>
          {!!user.about && (
            <MarkdownHyperlink linkStyle={commonStyles.link}>
              <AppText
                style={[styles.subtitle, {color: colors.secondaryBodyText}]}
                ellipsizeMode={'tail'}
                numberOfLines={2}>
                {user.about}
              </AppText>
            </MarkdownHyperlink>
          )}
        </Vertical>

        <Checked size={ms(24)} isChecked={isSelected} />
      </View>
    </AppTouchableOpacity>
  )
}

export default memo(FindPeopleListItem)

const styles = StyleSheet.create({
  clickableContainer: {
    marginBottom: ms(8),
    borderRadius: ms(8),
  },

  base: {
    height: ms(56),
    paddingHorizontal: ms(16),
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: ms(40),
    height: ms(40),
  },

  title: {
    fontSize: ms(12),
    fontWeight: 'bold',
    marginStart: ms(16),
  },

  subtitle: {
    width: '100%',
    fontSize: ms(12),
    marginStart: ms(16),
  },

  content: {
    marginEnd: ms(16),
  },
})

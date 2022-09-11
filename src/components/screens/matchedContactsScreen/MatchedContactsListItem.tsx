import React from 'react'
import {StyleSheet} from 'react-native'

import {UserModel} from '../../../models'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {profileFullName, profileShortName} from '../../../utils/userHelper'
import AppAvatar from '../../common/AppAvatar'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Checked from '../../common/Checked'
import Vertical from '../../common/Vertical'

interface Props {
  readonly contact: UserModel
  readonly onSelect: (model: UserModel) => void
  readonly isSelected: boolean
}

const MatchedContactsListItem: React.FC<Props> = ({
  contact,
  onSelect,
  isSelected,
}) => {
  const {colors} = useTheme()

  return (
    <AppTouchableOpacity activeOpacity={0.9} onPress={() => onSelect(contact)}>
      <Vertical style={styles.base}>
        <AppAvatar
          size={ms(80)}
          style={styles.avatar}
          avatar={contact.avatar}
          shortName={profileShortName(contact.name, contact.surname)}
        />
        <AppText style={[styles.text, {color: colors.bodyText}]}>
          {profileFullName(contact.name, contact.surname)}
        </AppText>
        <Checked style={styles.check} isChecked={isSelected} />
      </Vertical>
    </AppTouchableOpacity>
  )
}

export default MatchedContactsListItem

const styles = StyleSheet.create({
  base: {
    width: ms(140),
    alignItems: 'center',
    marginBottom: ms(16),
  },

  avatar: {
    width: ms(80),
    height: ms(80),
  },

  text: {
    textAlign: 'center',
    lineHeight: ms(14),
    marginTop: ms(8),
  },

  check: {
    position: 'absolute',
    top: 0,
    end: ms(10),
  },
})

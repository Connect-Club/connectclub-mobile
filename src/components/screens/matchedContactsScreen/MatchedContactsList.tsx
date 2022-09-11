import React from 'react'
import {StyleProp, StyleSheet, ViewStyle} from 'react-native'

import {UserModel} from '../../../models'
import Horizontal from '../../common/Horizontal'
import MatchedContactsListItem from './MatchedContactsListItem'

interface Props {
  readonly selected: {[key: string]: UserModel}
  readonly contacts: Array<UserModel>
  readonly onToggleSelect: (model: UserModel) => void
  readonly style?: StyleProp<ViewStyle>
}

const MatchedContactsList: React.FC<Props> = ({
  contacts,
  selected,
  onToggleSelect,
  style,
}) => {
  return (
    <Horizontal style={[styles.base, style]}>
      {contacts.map((c) => (
        <MatchedContactsListItem
          onSelect={onToggleSelect}
          isSelected={!!selected[c.id]}
          contact={c}
          key={c.id}
        />
      ))}
    </Horizontal>
  )
}

export default MatchedContactsList

const styles = StyleSheet.create({
  base: {
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
})

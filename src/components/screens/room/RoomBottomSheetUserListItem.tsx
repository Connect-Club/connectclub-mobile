import React from 'react'
import {StyleProp, StyleSheet, ViewStyle} from 'react-native'

import {UserModel} from '../../../models'
import {commonStyles, useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import {getUserShortName} from '../../../utils/userHelper'
import AppAvatar from '../../common/AppAvatar'
import AppText from '../../common/AppText'
import Horizontal from '../../common/Horizontal'
import Vertical from '../../common/Vertical'
import MarkdownHyperlink from '../profileScreen/MarkdownHyperlink'

interface Props {
  readonly user: UserModel
  readonly style?: StyleProp<ViewStyle>
  readonly right?: () => React.ReactElement
}

const RoomBottomSheetUserListItem: React.FC<Props> = (props) => {
  const {colors} = useTheme()

  return (
    <Horizontal style={styles.listItem}>
      <AppAvatar
        size={ms(40)}
        style={styles.avatar}
        avatar={props.user.avatar}
        shortName={getUserShortName(props.user)}
      />
      <Vertical style={[commonStyles.flexOne, styles.textContainer]}>
        <AppText
          style={[styles.title, {color: colors.bodyText}]}
          numberOfLines={2}>
          {props.user.displayName}
        </AppText>
        {!!props.user.about && (
          <MarkdownHyperlink linkStyle={commonStyles.link}>
            <AppText
              style={[styles.about, {color: colors.secondaryBodyText}]}
              numberOfLines={2}>
              {props.user.about}
            </AppText>
          </MarkdownHyperlink>
        )}
      </Vertical>
      {__DEV__ && <AppText style={styles.id}>{props.user.id}</AppText>}

      {props.right && props.right()}
    </Horizontal>
  )
}

export default RoomBottomSheetUserListItem

const styles = StyleSheet.create({
  listItem: {
    alignItems: 'center',
    marginBottom: ms(8),
  },

  avatar: {
    width: ms(40),
    height: ms(40),
  },

  title: {
    fontSize: ms(12),
    fontWeight: 'bold',
  },

  about: {
    fontSize: ms(12),
  },

  textContainer: {
    marginStart: ms(16),
    marginEnd: ms(16),
  },

  id: {
    position: 'absolute',
    top: 0,
    color: 'white',
    backgroundColor: 'black',
    fontSize: ms(8),
  },
})

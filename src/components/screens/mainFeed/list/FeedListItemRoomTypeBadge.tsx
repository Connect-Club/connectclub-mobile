import React from 'react'
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native'

import AppIcon from '../../../../assets/AppIcon'
import {useTheme} from '../../../../theme/appTheme'
import {ms} from '../../../../utils/layout.utils'
import AppText from '../../../common/AppText'
import Horizontal from '../../../common/Horizontal'

interface Props {
  readonly isPrivate: boolean
  readonly withSpeakers: boolean
  readonly draftType: string
  readonly style?: StyleProp<ViewStyle>
}

const FeedListItemRoomTypeBadge: React.FC<Props> = (props) => {
  const {colors} = useTheme()

  const badgeText = () => {
    switch (props.draftType) {
      case 'multiroom':
        return 'Multiroom'
      case 's_networking':
      case 'l_networking':
        return 'Networking'
      default:
        return props.withSpeakers ? 'Broadcasting' : 'Networking'
    }
  }

  return (
    <View
      style={[
        props.style,
        styles.roomType,
        {backgroundColor: colors.floatingBackground},
      ]}>
      <Horizontal>
        {props.isPrivate && (
          <AppIcon style={styles.icon} type={'icLockCompact'} />
        )}
        <AppText style={[styles.text, {color: colors.accentIcon}]}>
          {badgeText()}
        </AppText>
      </Horizontal>
    </View>
  )
}

export default FeedListItemRoomTypeBadge

const styles = StyleSheet.create({
  roomType: {
    paddingHorizontal: ms(14),
    height: ms(26),
    borderRadius: ms(8),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    fontSize: ms(13),
  },

  icon: {
    marginEnd: ms(8),
  },
})

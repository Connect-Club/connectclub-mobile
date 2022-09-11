import React, {memo} from 'react'
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {ClubInfoModel} from '../../../models'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Horizontal from '../../common/Horizontal'

interface Props {
  readonly club: ClubInfoModel
  readonly style?: StyleProp<ViewStyle>
  readonly onPress?: (user: ClubInfoModel) => void
  readonly isSelected?: boolean
  readonly showTopSeparator?: boolean
}

const ClubListItem: React.FC<Props> = ({
  club,
  style,
  onPress,
  isSelected,
  showTopSeparator,
}) => {
  const {colors} = useTheme()
  const bodyText = {color: colors.bodyText}

  return (
    <AppTouchableOpacity
      style={[styles.listItem, style]}
      onPress={() => onPress?.(club)}>
      {showTopSeparator && (
        <View style={[styles.separator, {backgroundColor: colors.separator}]} />
      )}
      <Horizontal style={styles.container}>
        <AppText
          style={[styles.withNameText, bodyText]}
          numberOfLines={1}
          ellipsizeMode={'tail'}>
          {club.title}
        </AppText>
        {isSelected === true && <AppIcon type={'icCheck24Primary'} />}
      </Horizontal>
    </AppTouchableOpacity>
  )
}

export default memo(ClubListItem)

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    height: ms(56),
    paddingHorizontal: ms(8),
  },
  listItem: {
    width: '100%',
    height: ms(56),
    justifyContent: 'center',
    margin: 2,
  },
  withNameText: {
    fontSize: ms(17),
    flex: 1,
  },
  separator: {
    height: ms(1),
    width: '100%',
  },
})

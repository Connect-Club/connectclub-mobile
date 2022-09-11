import React, {memo} from 'react'
import {StyleSheet, View, ViewProps} from 'react-native'

import {UserModel} from '../../../models'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import TouchableAppAvatarView from '../../common/TouchableAppAvatarView'
import CreatedAtView from './CreatedAtView'

interface Props {
  readonly head?: string
  readonly title: string
  readonly isNew: boolean
  readonly createdAt: number
  readonly relatedUsers: Array<UserModel>
  readonly onPress: () => void
  readonly accessibilityLabel?: string
}

const ClickableActivityView: React.FC<Props & ViewProps> = (props) => {
  const {colors} = useTheme()

  const itemOpacity = props.isNew ? 1 : 0.4

  const highlightedStyle = [styles.title, {color: colors.bodyText}]
  const regularStyle = [styles.subtitle, {color: colors.bodyText}]

  const user = props.relatedUsers[0]

  return (
    <View
      style={[styles.listItem, {opacity: itemOpacity}]}
      accessibilityLabel={props.accessibilityLabel}>
      <TouchableAppAvatarView
        user={user}
        moveOnPressTo={'ProfileScreenModal'}
        initialsMode={'auto'}
      />
      <AppTouchableOpacity style={styles.touchableView} onPress={props.onPress}>
        <View style={styles.textContainer}>
          {props.head && (
            <AppText style={highlightedStyle}>{props.head}</AppText>
          )}
          <AppText style={regularStyle}>{props.title}</AppText>
        </View>
        <CreatedAtView style={styles.createdAt} createdAt={props.createdAt} />
      </AppTouchableOpacity>
    </View>
  )
}

export default memo(ClickableActivityView)

const styles = StyleSheet.create({
  listItem: {
    marginBottom: ms(16),
    paddingBottom: ms(16),
    flexDirection: 'row',
  },

  touchableView: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'flex-start',
    alignSelf: 'center',
  },

  textContainer: {
    justifyContent: 'flex-start',
    marginLeft: ms(16),
    flexWrap: 'nowrap',
    flex: 1,
  },

  title: {
    fontSize: ms(12),
    fontWeight: 'bold',
  },

  subtitle: {
    fontSize: ms(12),
  },

  createdAt: {
    marginTop: 1,
    lineHeight: ms(16),
    paddingStart: ms(4),
    justifyContent: 'center',
  },
})

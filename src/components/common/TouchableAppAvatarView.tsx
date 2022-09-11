import {useNavigation} from '@react-navigation/native'
import React, {memo} from 'react'
import {StyleSheet, ViewProps} from 'react-native'

import {UserModel} from '../../models'
import {ms} from '../../utils/layout.utils'
import {getUserShortName} from '../../utils/userHelper'
import {AvatarInitialsMode} from '../screens/room/nativeview/RTCAvatarView'
import AppAvatar from './AppAvatar'
import AppTouchableOpacity from './AppTouchableOpacity'

interface Props {
  readonly user: UserModel
  readonly moveOnPressTo: 'ProfileScreenModal'
  readonly onPress?: () => void
  readonly initialsMode?: AvatarInitialsMode
}

const TouchableAppAvatarView: React.FC<Props & ViewProps> = (props) => {
  const navigation = useNavigation()
  const onPress = () => {
    props.onPress?.()
    switch (props.moveOnPressTo) {
      case 'ProfileScreenModal':
        navigation.navigate('ProfileScreenModal', {userId: props.user.id})
        break
    }
  }
  return (
    <AppTouchableOpacity style={props.style} onPress={onPress}>
      <AppAvatar
        shortName={getUserShortName(props.user)}
        avatar={props.user.avatar}
        style={styles.avatar}
        size={ms(32)}
      />
    </AppTouchableOpacity>
  )
}

export default memo(TouchableAppAvatarView)

const styles = StyleSheet.create({
  avatar: {
    width: ms(32),
    height: ms(32),
  },
})

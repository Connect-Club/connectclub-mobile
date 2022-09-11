import {useNavigation} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React from 'react'
import {StyleSheet} from 'react-native'

import {storage} from '../../../storage'
import {ms} from '../../../utils/layout.utils'
import {profileShortName} from '../../../utils/userHelper'
import AppAvatar from '../../common/AppAvatar'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {}

const NavigationUserButton: React.FC<Props> = () => {
  const navigation = useNavigation()
  const user = storage.currentUser

  if (!user) return null

  const {name, surname, avatar} = user
  const userId = storage.currentUser?.id

  return (
    <AppTouchableOpacity
      style={styles.button}
      accessibilityLabel={'myProfileButton'}
      onPress={() =>
        navigation.navigate('ProfileScreenModal', {
          userId: userId,
          navigationRoot: 'LocalMainFeedListScreen',
        })
      }>
      <AppAvatar
        size={ms(32)}
        shortName={profileShortName(name, surname)}
        avatar={avatar}
        style={styles.avatar}
      />
    </AppTouchableOpacity>
  )
}

export default observer(NavigationUserButton)

const styles = StyleSheet.create({
  button: {
    width: ms(42),
    height: ms(42),
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: ms(8),
  },
  avatar: {width: ms(32), height: ms(32)},
})

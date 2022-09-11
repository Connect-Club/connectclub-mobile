import {useNavigation} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React from 'react'

import {useTheme} from '../../../theme/appTheme'
import NavigationIconButton from './NavigationIconButton'

const NavigationInviteFriendsButton: React.FC = () => {
  const {colors} = useTheme()
  const navigation = useNavigation()

  return (
    <NavigationIconButton
      accessibilityLabel={'invitesButton'}
      icon={'icHasInvites'}
      onPress={() => navigation.navigate('InvitesScreen')}
      tint={colors.accentIcon}
    />
  )
}

export default observer(NavigationInviteFriendsButton)

import {useNavigation} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useCallback} from 'react'
import {StyleSheet} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {MyCountersStore} from '../../../stores/MyCountersStore'
import {commonStyles} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  readonly store: MyCountersStore
}

const NavigationMyNetworkButton: React.FC<Props> = ({store}) => {
  const navigation = useNavigation()
  const onMyNetworkPress = useCallback(() => {
    navigation.navigate('MyNetworkScreen')
  }, [])

  return (
    <AppTouchableOpacity
      accessibilityLabel={'myNetworkButton'}
      style={[styles.button, commonStyles.flexCenter]}
      onPress={onMyNetworkPress}>
      {store.counters.countOnlineFriends > 0 && (
        <AppIcon type={'icAvailableForChatOnline'} />
      )}
      {store.counters.countOnlineFriends === 0 && (
        <AppIcon type={'icAvailableForChat'} />
      )}
    </AppTouchableOpacity>
  )
}

export default observer(NavigationMyNetworkButton)

const styles = StyleSheet.create({
  button: {
    width: ms(42),
    height: ms(42),
  },
})

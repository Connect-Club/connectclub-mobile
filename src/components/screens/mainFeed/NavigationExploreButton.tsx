import {useNavigation} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useCallback} from 'react'
import {StyleSheet} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import {commonStyles} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

const NavigationExploreButton: React.FC = () => {
  const navigation = useNavigation()

  const onExplorePress = useCallback(() => {
    navigation.navigate('ExploreScreen')
  }, [navigation])

  return (
    <AppTouchableOpacity
      accessibilityLabel={'exploreButton'}
      style={[styles.button, commonStyles.flexCenter]}
      onPress={onExplorePress}>
      <AppIcon type={'icExplore'} />
    </AppTouchableOpacity>
  )
}

export default observer(NavigationExploreButton)

const styles = StyleSheet.create({
  button: {
    width: ms(42),
    height: ms(42),
  },
})

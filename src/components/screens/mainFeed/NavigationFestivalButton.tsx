import {observer} from 'mobx-react'
import React, {useContext} from 'react'
import {
  Dimensions,
  Linking,
  StyleProp,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import MyCountersStore from '../../../stores/MyCountersStore'
import {ms} from '../../../utils/layout.utils'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

// Disabled until needed again
const isComponentEnabled = false
const screenWidth = Dimensions.get('window').width
const NavigationFestivalButton: React.FC = () => {
  const countersStore = useContext(MyCountersStore)

  if (!isComponentEnabled || !countersStore.counters.showFestivalBanner) {
    return null
  }

  const isBig = screenWidth > 350
  const style: StyleProp<ViewStyle> = !isBig
    ? {justifyContent: 'center'}
    : undefined

  return (
    <AppTouchableOpacity
      style={[styles.button, style]}
      shouldVibrateOnClick
      accessibilityLabel={'navigation-festival-button'}
      onPress={() => Linking.openURL('https://connect.club/connectcon/nft')}>
      <AppIcon type={'icFestival'} />
      {isBig && <Text style={styles.title}>Festival</Text>}
    </AppTouchableOpacity>
  )
}

export default observer(NavigationFestivalButton)

const styles = StyleSheet.create({
  button: {
    minWidth: ms(32),
    height: ms(32),
    backgroundColor: '#080725',
    alignSelf: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: ms(32) / 2,
    paddingStart: screenWidth > 350 ? ms(16) : 0,
    paddingEnd: screenWidth > 350 ? ms(16) : 0,
  },

  title: {
    fontSize: ms(13),
    fontWeight: 'bold',
    color: 'white',
    marginStart: ms(8),
  },

  bottomSheetHeader: {
    width: '100%',
    height: ms(42),
    justifyContent: 'center',
    paddingHorizontal: ms(16),
  },

  done: {
    color: '#4D7DD0',
    fontWeight: 'bold',
    fontSize: ms(17),
  },
})

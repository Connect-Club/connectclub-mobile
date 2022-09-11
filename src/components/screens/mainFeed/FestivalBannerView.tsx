import React, {useContext} from 'react'
import {Linking, Platform, StyleSheet, View} from 'react-native'
import Animated from 'react-native-reanimated'

import {analytics} from '../../../Analytics'
import AppIcon from '../../../assets/AppIcon'
import MyCountersStore from '../../../stores/MyCountersStore'
import {ms} from '../../../utils/layout.utils'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import FlexSpace from '../../common/FlexSpace'

const FestivalBannerView: React.FC = () => {
  const countersStore = useContext(MyCountersStore)

  // New banner should be always visible
  if (!countersStore.counters.showFestivalBanner) return null

  const onBannerPress = () => {
    const url = 'https://connect.club/connectcon/nft-business'
    analytics.sendEvent('festival_banner_click', {link: url})
    Linking.openURL(url)
    /*appEventEmitter.trigger(
      'openRoom',
      countersStore.counters.checkInRoomId,
      countersStore.counters.checkInRoomPass,
    )*/
  }

  return (
    <Animated.View style={styles.container}>
      <View style={styles.banner}>
        <AppIcon type={'festivalName'} />
        <FlexSpace />
        <AppTouchableOpacity onPress={onBannerPress}>
          <AppIcon type={'festivalCheckIn'} />
        </AppTouchableOpacity>
      </View>
    </Animated.View>
  )
}

export default FestivalBannerView
const styles = StyleSheet.create({
  container: {
    zIndex: 3,
    marginTop: ms(16),
    marginBottom: ms(16),
    height: ms(60),
  },

  banner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#232E71',
    borderRadius: ms(12),
    flexDirection: 'row',
    alignItems: 'center',
    paddingStart: ms(16),
    paddingEnd: ms(16),
    ...Platform.select({
      android: {elevation: ms(8)},
      ios: {
        shadowOpacity: 0.5,
        shadowRadius: 12,
        shadowOffset: {width: 0, height: ms(8)},
        shadowColor: 'rgba(0, 0, 0, 0.5)',
      },
    }),
  },
})

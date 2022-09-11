import {useNavigation} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useCallback, useContext} from 'react'
import {Platform, StyleSheet, View, ViewProps} from 'react-native'

import MyCountersStore from '../../../stores/MyCountersStore'
import {useTheme} from '../../../theme/appTheme'
import {ms} from '../../../utils/layout.utils'
import NavigationIconButton from './NavigationIconButton'

interface Props {}

const RingView: React.FC<Props & ViewProps> = (props) => {
  const {colors} = useTheme()
  const navigation = useNavigation()

  const dotStyle = [styles.dotView, {backgroundColor: colors.warning}]

  const countersStore = useContext(MyCountersStore)

  const goToActivity = useCallback(() => {
    navigation.navigate('ActivityScreen')
  }, [])

  return (
    <View style={props.style}>
      <NavigationIconButton
        accessibilityLabel={'ringButton'}
        tint={colors.accentIcon}
        icon={'icRing'}
        onPress={goToActivity}
      />
      {countersStore.counters.countNewActivities > 0 && (
        <View accessibilityLabel={'newActivitiesMark'} style={dotStyle} />
      )}
    </View>
  )
}

export default observer(RingView)

const styles = StyleSheet.create({
  dotView: {
    position: 'absolute',
    top: ms(10),
    left: ms(22),
    width: ms(10),
    height: ms(10),
    borderRadius: ms(5),
    overflow: 'hidden',
    ...Platform.select({
      web: {
        height: 10,
        width: 10,
        borderRadius: 5,
      },
    }),
  },
})

import React from 'react'
import {StyleSheet, View} from 'react-native'

import RasterIcon from '../../../assets/RasterIcon'
import {ms} from '../../../utils/layout.utils'

interface Props {
  readonly isVisible: boolean
}

const ICON_SIZE = 32

const ProfileHeaderCrown: React.FC<Props> = (props) => {
  if (!props.isVisible) return null

  return (
    <View style={styles.container}>
      <RasterIcon type={'ic_crown'} style={styles.icon} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: ms(ICON_SIZE),
    height: ms(ICON_SIZE),
    position: 'absolute',
    end: -(ms(ICON_SIZE) / 3),
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ms(ICON_SIZE) / 2,
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    transform: [{scale: 0.5}],
  },
})

export default ProfileHeaderCrown

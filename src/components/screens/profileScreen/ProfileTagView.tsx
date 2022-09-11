import React, {memo} from 'react'
import {Platform, StyleSheet} from 'react-native'

import AppIcon, {AppIconType} from '../../../assets/AppIcon'
import {ms} from '../../../utils/layout.utils'
import AppText from '../../common/AppText'
import Horizontal from '../../common/Horizontal'

interface Props {
  icon: AppIconType
  title: string
  tint: string
}

const ProfileTagView: React.FC<Props> = ({icon, title, tint}) => {
  return (
    <Horizontal style={styles.container}>
      <AppIcon type={icon} style={styles.icon} tint={tint} />
      <AppText style={styles.title}>{title}</AppText>
    </Horizontal>
  )
}

const styles = StyleSheet.create({
  container: {
    height: ms(28),
    backgroundColor: 'white',
    borderRadius: ms(14),
    justifyContent: 'center',
    alignItems: 'center',
    marginStart: ms(8),
    paddingStart: ms(8),
    paddingEnd: ms(8),
    shadowColor: '#015072',
    shadowOffset: {width: ms(0), height: ms(2)},
    shadowOpacity: 0.1,
    shadowRadius: ms(3),
  },
  icon: {
    marginTop: Platform.OS === 'android' ? ms(2) : 0,
  },
  title: {
    fontSize: ms(12),
    fontWeight: 'bold',
    marginStart: ms(3),
  },
})

export default memo(ProfileTagView)

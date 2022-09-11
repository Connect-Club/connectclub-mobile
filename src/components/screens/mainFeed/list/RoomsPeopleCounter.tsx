import React, {memo} from 'react'
import {StyleProp, StyleSheet, ViewStyle} from 'react-native'

import AppIcon from '../../../../assets/AppIcon'
import {MainFeedItemModel} from '../../../../models'
import {useTheme} from '../../../../theme/appTheme'
import {ms} from '../../../../utils/layout.utils'
import AppText from '../../../common/AppText'
import Horizontal from '../../../common/Horizontal'
import Spacer from '../../../common/Spacer'

interface Props {
  readonly style?: StyleProp<ViewStyle>
  readonly feedItem: MainFeedItemModel
}

const RoomsPeopleCounter: React.FC<Props> = (props) => {
  const {colors} = useTheme()

  const textPrimary = {color: colors.textPrimary}

  return (
    <Horizontal style={[styles.base, props.style]}>
      <AppIcon type={'icEventTotalUsers'} tint={colors.textPrimary} />
      <AppText style={[styles.counter, textPrimary]}>
        {props.feedItem.online}
      </AppText>
      <Spacer horizontal={ms(16)} />
      <AppIcon type={'icEventSpeaker'} tint={colors.textPrimary} />
      <AppText style={[styles.counter, textPrimary]}>
        {props.feedItem.speaking}
      </AppText>
    </Horizontal>
  )
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  counter: {
    fontSize: ms(13),
    fontWeight: '500',
    opacity: 0.8,
  },
})

export default memo(RoomsPeopleCounter)

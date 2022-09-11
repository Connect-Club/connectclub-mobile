import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {ms} from '../../../../utils/layout.utils'
import AppText from '../../../common/AppText'

interface Props {
  readonly isCoHost: boolean
  readonly isNetworking: boolean
}

const FeedListItemEnterRoomTooltip: React.FC<Props> = (props) => {
  const {t} = useTranslation()

  let tooltip = ''
  if (props.isNetworking) {
    tooltip = 'You will enter a room with muted audio and video'
  } else {
    tooltip = props.isCoHost
      ? t('feedListItemSpeakerTooltip')
      : t('feedListItemListenerTooltip')
  }

  return (
    <View style={styles.tooltip}>
      <AppText style={styles.tooltipText}>{tooltip}</AppText>
    </View>
  )
}

export default FeedListItemEnterRoomTooltip

const styles = StyleSheet.create({
  tooltip: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: ms(32),
    borderRadius: ms(1000),
    paddingHorizontal: ms(16),
    paddingVertical: ms(8),
    marginTop: ms(16),
  },

  tooltipText: {
    fontWeight: 'bold',
    fontSize: ms(11),
    color: 'white',
    textAlign: 'center',
  },
})

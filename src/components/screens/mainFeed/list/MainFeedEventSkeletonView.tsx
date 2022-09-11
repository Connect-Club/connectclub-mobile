import React, {memo} from 'react'
import {View} from 'react-native'

import {useTheme} from '../../../../theme/appTheme'
import {ms} from '../../../../utils/layout.utils'
import {SpeakersSkeleton} from '../calendar/SpeakersSkeletonView'

const MainFeedCalendarEventSkeletonView = () => {
  const {colors} = useTheme()
  const background = {backgroundColor: colors.skeleton}

  return (
    <View
      style={[
        background,
        {
          marginHorizontal: ms(16),
          marginTop: ms(16),
          borderRadius: ms(12),
          padding: ms(16),
        },
      ]}>
      <SpeakersSkeleton speakerSize={ms(68)} />

      <View
        style={{
          marginTop: ms(16),
          height: ms(21),
          width: '48%',
          backgroundColor: colors.skeletonDark,
          borderRadius: ms(4),
        }}
      />

      <View
        style={{
          height: ms(21),
          width: '72%',
          backgroundColor: colors.skeletonDark,
          borderRadius: ms(4),
        }}
      />
    </View>
  )
}

export default memo(MainFeedCalendarEventSkeletonView)

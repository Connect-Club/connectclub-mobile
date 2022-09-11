import React, {memo} from 'react'
import {View} from 'react-native'

import {useTheme} from '../../../../theme/appTheme'
import {ms} from '../../../../utils/layout.utils'
import Horizontal from '../../../common/Horizontal'
import Vertical from '../../../common/Vertical'
import {CALENDAR_EVENT_HEIGHT} from './mainFeedCalendar.contstants'
import {SpeakersSkeleton} from './SpeakersSkeletonView'

const MainFeedCalendarEventSkeletonView = () => {
  const {colors} = useTheme()
  const background = {backgroundColor: colors.skeleton}

  return (
    <View
      style={[
        background,
        {
          height: CALENDAR_EVENT_HEIGHT,
          marginHorizontal: ms(16),
          marginTop: ms(16),
          borderRadius: ms(12),
          padding: ms(16),
        },
      ]}>
      <View
        style={{
          height: ms(21),
          width: '50%',
          backgroundColor: colors.skeletonDark,
          borderRadius: ms(4),
        }}
      />

      <View
        style={{
          marginTop: ms(4),
          height: ms(21),
          width: '50%',
          backgroundColor: colors.skeletonDark,
          borderRadius: ms(4),
        }}
      />

      <View
        style={{
          marginTop: ms(4),
          height: ms(28),
          width: '70%',
          backgroundColor: colors.skeletonDark,
          borderRadius: ms(4),
          marginBottom: ms(30),
        }}
      />

      <Horizontal>
        <SpeakersSkeleton speakerSize={ms(52)} />
        <Vertical
          style={{
            flex: 1,
            marginStart: ms(8),
            marginEnd: ms(20),
          }}>
          <View
            style={{
              height: ms(14),
              width: '60%',
              backgroundColor: colors.skeletonDark,
              borderRadius: ms(4),
            }}
          />

          <View
            style={{
              marginTop: ms(4),
              height: ms(14),
              width: '100%',
              backgroundColor: colors.skeletonDark,
              borderRadius: ms(4),
            }}
          />

          <View
            style={{
              marginTop: ms(4),
              height: ms(14),
              width: '76%',
              backgroundColor: colors.skeletonDark,
              borderRadius: ms(4),
            }}
          />
        </Vertical>
      </Horizontal>

      <Horizontal
        style={{
          marginTop: ms(24),
          height: ms(32),
          width: '90%',
        }}>
        <View
          style={{
            width: ms(72),
            height: ms(27),
            backgroundColor: colors.skeletonDark,
            borderRadius: ms(32) / 2,
            marginEnd: ms(8),
          }}
        />
        <View
          style={{
            width: ms(72),
            height: ms(27),
            backgroundColor: colors.skeletonDark,
            borderRadius: ms(32) / 2,
            marginEnd: ms(8),
          }}
        />
        <View
          style={{
            width: ms(72),
            height: ms(27),
            backgroundColor: colors.skeletonDark,
            borderRadius: ms(32) / 2,
            marginEnd: ms(8),
          }}
        />
        <View
          style={{
            width: ms(72),
            height: ms(27),
            backgroundColor: colors.skeletonDark,
            borderRadius: ms(32) / 2,
            marginEnd: ms(8),
          }}
        />
      </Horizontal>
    </View>
  )
}

export default memo(MainFeedCalendarEventSkeletonView)

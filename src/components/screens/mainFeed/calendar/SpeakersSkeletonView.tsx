import React from 'react'
import {View} from 'react-native'

import {useTheme} from '../../../../theme/appTheme'
import {ms} from '../../../../utils/layout.utils'

interface Props {
  readonly speakerSize: number
}

export const SpeakersSkeleton: React.FC<Props> = ({speakerSize}) => {
  const {colors} = useTheme()
  return (
    <View
      style={{
        height: speakerSize,
        flexDirection: 'row',
      }}>
      <View
        style={{
          width: speakerSize,
          height: speakerSize,
          backgroundColor: colors.skeleton,
          borderRadius: speakerSize / 2,
        }}>
        <View
          style={{
            width: speakerSize,
            height: speakerSize,
            backgroundColor: colors.skeletonDark,
            borderRadius: speakerSize / 2,
          }}
        />
      </View>
      <View
        style={{
          width: speakerSize,
          height: speakerSize,
          backgroundColor: colors.skeleton,
          borderRadius: speakerSize / 2,
          marginStart: -ms(16),
        }}>
        <View
          style={{
            width: speakerSize,
            height: speakerSize,
            backgroundColor: colors.skeletonDark,
            borderRadius: speakerSize / 2,
          }}
        />
      </View>
      <View
        style={{
          width: speakerSize,
          height: speakerSize,
          backgroundColor: colors.skeleton,
          borderRadius: speakerSize / 2,
          marginStart: -ms(16),
        }}>
        <View
          style={{
            width: speakerSize,
            height: speakerSize,
            backgroundColor: colors.skeletonDark,
            borderRadius: speakerSize / 2,
          }}
        />
      </View>
    </View>
  )
}

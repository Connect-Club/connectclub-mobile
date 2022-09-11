import React from 'react'
import {View} from 'react-native'

import {useTheme} from '../../../../theme/appTheme'
import {ms} from '../../../../utils/layout.utils'
import Vertical from '../../../common/Vertical'
import MainFeedCalendarEventSkeletonView from '../calendar/MainFeedCalendarEventSkeletonView'
import MainFeedEventSkeletonView from './MainFeedEventSkeletonView'

const SectionTitleSkeleton: React.FC<{color: string; marginTop?: number}> = (
  props,
) => (
  <View
    style={{
      height: ms(32),
      width: '56%',
      backgroundColor: props.color,
      marginHorizontal: ms(16),
      borderRadius: ms(4),
      marginTop: props.marginTop,
    }}
  />
)

const MainFeedListSkeletonView = () => {
  const {colors} = useTheme()

  return (
    <Vertical>
      <SectionTitleSkeleton color={colors.skeletonDark} />

      <MainFeedCalendarEventSkeletonView />
      <SectionTitleSkeleton color={colors.skeletonDark} marginTop={ms(36)} />

      <MainFeedEventSkeletonView />
    </Vertical>
  )
}

export default MainFeedListSkeletonView

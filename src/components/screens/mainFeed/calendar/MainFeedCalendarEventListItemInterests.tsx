import React, {memo} from 'react'
import {StyleSheet, View} from 'react-native'

import RasterIcon from '../../../../assets/RasterIcon'
import {InterestModel} from '../../../../models'
import {ms} from '../../../../utils/layout.utils'
import MainFeedCalendarListItemInterestsList from './MainFeedCalendarListItemInterestsList'

interface Props {
  readonly interests: InterestModel[]
}

const MainFeedCalendarEventListItemInterests: React.FC<Props> = (props) => {
  return (
    <View style={styles.listContainerPadding}>
      <MainFeedCalendarListItemInterestsList
        contentContainerStyle={styles.contentContainer}
        style={styles.list}
        interests={props.interests}
      />

      <RasterIcon
        type={'icCalendarInterestsGradient'}
        style={styles.listEndGradient}
      />
      <RasterIcon
        type={'icCalendarInterestsGradient'}
        style={styles.listStartGradient}
      />
    </View>
  )
}

export default memo(MainFeedCalendarEventListItemInterests)

const styles = StyleSheet.create({
  list: {},

  contentContainer: {
    paddingStart: ms(32),
    paddingEnd: ms(16),
  },

  listContainerPadding: {
    alignItems: 'flex-start',
    height: ms(32),
    marginStart: -ms(16),
    marginEnd: -ms(16),
    marginBottom: ms(19),
    overflow: 'hidden',
  },

  listEndGradient: {
    position: 'absolute',
    top: 0,
    end: 0,
    width: ms(16),
    transform: [{scale: -1}],
  },

  listStartGradient: {
    position: 'absolute',
    top: 0,
    start: 0,
    width: ms(16),
    height: '100%',
  },
})

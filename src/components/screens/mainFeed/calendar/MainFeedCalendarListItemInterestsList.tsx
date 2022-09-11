import React from 'react'
import {StyleProp, StyleSheet, TextStyle, ViewStyle} from 'react-native'
import {ScrollView} from 'react-native-gesture-handler'

import {InterestModel} from '../../../../models'
import {ms} from '../../../../utils/layout.utils'
import AppTouchableOpacity from '../../../common/AppTouchableOpacity'
import Horizontal from '../../../common/Horizontal'
import InterestListItem from '../../interests/InterestListItem'

interface Props {
  readonly interests: Array<InterestModel>
  readonly contentContainerStyle?: StyleProp<ViewStyle>
  readonly style?: StyleProp<ViewStyle>
  readonly itemStyle?: StyleProp<ViewStyle>
  readonly textStyle?: TextStyle
}

let index = 0
const MainFeedCalendarListItemInterestsList: React.FC<Props> = (props) => {
  if (props.interests.length === 0) return null
  return (
    <ScrollView
      style={[styles.interests, props.style]}
      contentContainerStyle={[
        styles.interestsContainer,
        props.contentContainerStyle,
      ]}
      showsHorizontalScrollIndicator={false}
      horizontal={true}>
      <Horizontal>
        {props.interests.map((item) => {
          return (
            <AppTouchableOpacity activeOpacity={1} key={++index}>
              <InterestListItem
                isSelectable={false}
                isSelected={false}
                inverted
                interest={item}
                textStyle={props.textStyle}
                itemStyle={props.itemStyle}
              />
            </AppTouchableOpacity>
          )
        })}
      </Horizontal>
    </ScrollView>
  )
}

export default MainFeedCalendarListItemInterestsList

const styles = StyleSheet.create({
  interests: {
    height: ms(32),
    marginStart: -ms(16),
  },

  interestsContainer: {
    paddingStart: ms(16),
    height: ms(32),
  },
})

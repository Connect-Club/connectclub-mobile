import React from 'react'
import {StyleSheet, View, ViewStyle} from 'react-native'

import {UserModel} from '../../../../models'
import {maxWidth, ms} from '../../../../utils/layout.utils'
import {profileShortName} from '../../../../utils/userHelper'
import AppAvatar from '../../../common/AppAvatar'
import Horizontal from '../../../common/Horizontal'

interface Props {
  readonly speakers: Array<UserModel>
}

const cardWidth = maxWidth() - ms(32)
export const speakerStyles = (count: number): ViewStyle | undefined => {
  if (count === 0) return undefined
  if (count === 1) return styles.speakerBig
  if (count === 2) return styles.speakerMedium
  return styles.speakerSmall
}

export const speakerInitialSize = (count: number): number | undefined => {
  if (count === 0) return undefined
  if (count === 1) return ms(42)
  if (count === 2) return ms(30)
  return ms(16)
}

export const speakerMargin = (
  count: number,
  index: number,
): number | undefined => {
  if (index === 0) return 0
  if (count === 0) return undefined
  return ms(-16)
}

const SpeakersAvatarsList: React.FC<Props> = (props) => {
  const speakers = props.speakers ?? []
  const speakersCount = speakers.length

  return (
    <Horizontal>
      {speakers.map((s, i) => (
        <View
          key={s.id}
          style={[
            styles.speaker,
            speakerStyles(speakersCount),
            {marginStart: speakerMargin(speakersCount, i)},
          ]}>
          <AppAvatar
            fontSize={speakerInitialSize(speakersCount)}
            style={styles.fullWidth}
            avatar={s.avatar}
            shortName={profileShortName(s.name, s.surname)}
          />
        </View>
      ))}
    </Horizontal>
  )
}

export default SpeakersAvatarsList

const styles = StyleSheet.create({
  speaker: {
    backgroundColor: 'white',
    borderRadius: ms(1000),
    overflow: 'hidden',
    borderWidth: ms(1),
    borderColor: 'white',
  },

  speakerBig: {
    width: cardWidth * 0.35,
    height: cardWidth * 0.35,
  },

  speakerMedium: {
    width: cardWidth * 0.25,
    height: cardWidth * 0.25,
  },

  speakerSmall: {
    width: cardWidth * 0.2,
    height: cardWidth * 0.2,
  },
  fullWidth: {width: '100%', height: '100%'},
})

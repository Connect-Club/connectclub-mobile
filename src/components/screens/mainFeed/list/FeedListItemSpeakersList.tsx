import React from 'react'
import {StyleSheet} from 'react-native'

import AppIcon from '../../../../assets/AppIcon'
import {MainFeedItemModel, UserModel} from '../../../../models'
import {commonStyles, useTheme} from '../../../../theme/appTheme'
import {ms} from '../../../../utils/layout.utils'
import {
  getPriorityRoleBadgeIcon,
  profileFullName,
} from '../../../../utils/userHelper'
import AppText from '../../../common/AppText'
import FlexSpace from '../../../common/FlexSpace'
import Horizontal from '../../../common/Horizontal'
import Vertical from '../../../common/Vertical'
import RoomsPeopleCounter from './RoomsPeopleCounter'

interface Props {
  readonly feedItem: MainFeedItemModel
  readonly speakers: Array<UserModel>
  readonly speaking?: number
  readonly showSpeakingCount: boolean
  readonly showSpeakerIcon: boolean
  readonly showRoomsPeopleCounters: boolean
}

const FeedListItemSpeakersList: React.FC<Props> = (props) => {
  const {colors} = useTheme()

  const textPrimary = {color: colors.textPrimary}

  const speakers = props.speakers ?? []
  const speakersCount = speakers.length

  return (
    <Vertical style={{marginTop: ms(4)}}>
      {speakers.map((s, i) => {
        const badgeIcon = getPriorityRoleBadgeIcon(s.badges, s.isSpecialGuest)
        if (!props.showSpeakingCount || i !== speakersCount - 1) {
          return (
            <Horizontal key={s.id} style={styles.container}>
              <AppText style={[styles.speakerName, textPrimary]} key={s.id}>
                {profileFullName(s.name, s.surname)}
              </AppText>
              {badgeIcon && <AppIcon type={badgeIcon} tint={'white'} />}
              {!badgeIcon && props.showSpeakerIcon && (
                <AppIcon type={'icEventSpeaker'} tint={'white'} />
              )}
              {props.showRoomsPeopleCounters &&
                !props.showSpeakingCount &&
                i === speakersCount - 1 && (
                  <RoomsPeopleCounter
                    style={styles.roomPeopleCounter}
                    feedItem={props.feedItem}
                  />
                )}
            </Horizontal>
          )
        }

        return (
          <Horizontal key={s.id} style={styles.container}>
            <AppText style={[styles.speakerName, textPrimary]}>
              {profileFullName(s.name, s.surname)}{' '}
            </AppText>
            {badgeIcon && <AppIcon type={badgeIcon} tint={'white'} />}
            {!badgeIcon && props.showSpeakerIcon && (
              <AppIcon type={'icEventSpeaker'} tint={'white'} />
            )}
            <FlexSpace />
            <Horizontal style={commonStyles.alignCenter}>
              <AppIcon type={'icEventTotalUsers'} tint={colors.textPrimary} />
              <AppText style={[styles.counter, textPrimary]}>
                {props.speaking}
              </AppText>
            </Horizontal>
          </Horizontal>
        )
      })}
    </Vertical>
  )
}

export default FeedListItemSpeakersList

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  counter: {
    fontSize: ms(13),
    fontWeight: '500',
    opacity: 0.8,
  },
  roomPeopleCounter: {flexGrow: 1},
  speakerName: {
    fontSize: ms(13),
    lineHeight: ms(21),
    paddingEnd: ms(3),
  },
})

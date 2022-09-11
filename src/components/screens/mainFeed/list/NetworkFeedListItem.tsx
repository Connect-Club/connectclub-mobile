import React from 'react'
import {useTranslation} from 'react-i18next'
import {Dimensions, StyleSheet, View} from 'react-native'

import AppIcon from '../../../../assets/AppIcon.native'
import {draftFeedPreviewTypes, MainFeedItemModel} from '../../../../models'
import {commonStyles, makeTextStyle, useTheme} from '../../../../theme/appTheme'
import {ms} from '../../../../utils/layout.utils'
import {profileShortName} from '../../../../utils/userHelper'
import AppText from '../../../common/AppText'
import AppTouchableOpacity from '../../../common/AppTouchableOpacity'
import FlexSpace from '../../../common/FlexSpace'
import Horizontal from '../../../common/Horizontal'
import Vertical from '../../../common/Vertical'
import {FastImage} from '../../../webSafeImports/webSafeImports'
import HostedByClubLink from '../../club/HostedByClubLink'
import AvatarView from '../../room/nativeview/RTCAvatarView'
import MainFeedCalendarListItemInterestsList from '../calendar/MainFeedCalendarListItemInterestsList'
import FeedListItemEnterRoomTooltip from './FeedListItemEnterRoomTooltip'
import FeedListItemRoomTypeBadge from './FeedListItemRoomTypeBadge'
import FeedListItemSpeakersList from './FeedListItemSpeakersList'
import {
  speakerInitialSize,
  speakerMargin,
  speakerStyles,
} from './SpeakersAvatarsList'

interface Props {
  item: MainFeedItemModel
  readonly onPress: (item: MainFeedItemModel) => void
  readonly onDetailsPress: (item: MainFeedItemModel) => void
}

const cardWidth = Dimensions.get('window').width - ms(32)
export const NetworkFeedListItem: React.FC<Props> = (props) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  const textPrimary = {color: colors.textPrimary}

  const speakers = props.item.speakers ?? []
  const speakersCount = speakers.length

  return (
    <AppTouchableOpacity
      onPress={() => props.onPress(props.item)}
      style={[styles.base]}
      accessibilityLabel={'networkFeedListItem'}>
      <View style={StyleSheet.absoluteFill}>
        <FastImage
          source={draftFeedPreviewTypes[props.item.draftType]}
          style={styles.background}
        />
      </View>

      <Vertical>
        <Horizontal style={styles.infoLine}>
          <AppTouchableOpacity onPress={() => props.onDetailsPress(props.item)}>
            <Horizontal>
              {props.item.eventScheduleId && (
                <>
                  <AppIcon type={'icEventInfo'} style={styles.infoIcon} />
                  <AppText
                    style={[{color: colors.textPrimary}, styles.infoText]}>
                    {t('ongoingEventInfo')}
                  </AppText>
                </>
              )}
            </Horizontal>
          </AppTouchableOpacity>
          <FlexSpace />
          <FeedListItemRoomTypeBadge
            isPrivate={props.item.isPrivate === true}
            withSpeakers={props.item.withSpeakers}
            draftType={props.item.draftType}
            style={styles.roomType}
          />
        </Horizontal>
        <Horizontal
          style={[
            styles.avatars,
            speakersCount === 1 && commonStyles.justifyCenter,
            speakersCount > 1 && styles.justifyEvenly,
          ]}>
          {speakers.map((s, i) => (
            <View
              key={s.id}
              style={[
                styles.speaker,
                speakerStyles(speakersCount),
                {marginStart: speakerMargin(speakersCount, i)},
                i !== 1 && speakersCount === 3 && styles.speakerBottom,
              ]}>
              <AvatarView
                fontSize={speakerInitialSize(speakersCount)}
                style={styles.avatar}
                avatar={s.avatar}
                initials={profileShortName(s.name, s.surname)}
              />
            </View>
          ))}
        </Horizontal>
        {!!props.item.title && (
          <Horizontal>
            <AppText
              accessibilityLabel={'feedItemTitle'}
              numberOfLines={3}
              style={[styles.title, textPrimary]}>
              {props.item.title}
            </AppText>
          </Horizontal>
        )}

        {props.item.club && (
          <HostedByClubLink club={props.item.club} textStyle={textPrimary} />
        )}

        <FeedListItemSpeakersList
          feedItem={props.item}
          speakers={speakers}
          speaking={props.item.speaking}
          showSpeakingCount={true}
          showSpeakerIcon={false}
          showRoomsPeopleCounters={false}
        />

        <View>
          <MainFeedCalendarListItemInterestsList
            style={styles.list}
            interests={props.item.interests}
            textStyle={styles.interestColor}
          />
        </View>

        <FeedListItemEnterRoomTooltip
          isNetworking={true}
          isCoHost={props.item.isCoHost}
        />
      </Vertical>
    </AppTouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: ms(50),
    borderRadius: ms(12),
    overflow: 'hidden',
    marginBottom: ms(8),
    padding: ms(16),
    backgroundColor: '#7C716C',
  },

  background: {
    width: '100%',
    height: '100%',
  },

  speaker: {
    backgroundColor: 'white',
    borderRadius: ms(1000),
    overflow: 'hidden',
    borderWidth: ms(1),
    borderColor: 'white',
  },

  speakerBig: {
    width: cardWidth * 0.3,
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

  speakerBottom: {
    marginTop: (cardWidth * 0.2) / 2,
  },

  roomType: {
    alignSelf: 'flex-end',
  },

  justifyEvenly: {
    justifyContent: 'space-evenly',
  },

  avatars: {
    marginBottom: ms(16),
    alignItems: 'center',
  },

  avatar: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
  },

  title: {
    fontSize: ms(24),
    fontWeight: 'bold',
  },

  listeners: {
    marginTop: ms(16),
    alignItems: 'center',
  },

  list: {
    marginTop: ms(16),
    marginEnd: -ms(16),
  },

  interestColor: {
    color: 'white',
  },
  premiumIcon: {
    marginTop: ms(10),
    marginEnd: ms(8),
  },
  infoIcon: {
    width: ms(16),
    height: ms(16),
    marginEnd: ms(4),
  },
  infoText: {
    ...makeTextStyle(12, 14, '600'),
  },
  infoLine: {
    paddingBottom: ms(4),
    marginTop: ms(-16),
    marginStart: ms(-16),
    paddingStart: ms(16),
    paddingTop: ms(16),
    alignItems: 'center',
  },
})

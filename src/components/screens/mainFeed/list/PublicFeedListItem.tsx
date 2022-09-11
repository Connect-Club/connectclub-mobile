import React from 'react'
import {useTranslation} from 'react-i18next'
import {Image, StyleSheet, View} from 'react-native'

import AppIcon from '../../../../assets/AppIcon.native'
import {draftFeedPreviewTypes, MainFeedItemModel} from '../../../../models'
import {makeTextStyle, useTheme} from '../../../../theme/appTheme'
import {ms} from '../../../../utils/layout.utils'
import {profileShortName} from '../../../../utils/userHelper'
import AppAvatar from '../../../common/AppAvatar'
import AppText from '../../../common/AppText'
import AppTouchableOpacity from '../../../common/AppTouchableOpacity'
import FlexSpace from '../../../common/FlexSpace'
import Horizontal from '../../../common/Horizontal'
import Spacer from '../../../common/Spacer'
import Vertical from '../../../common/Vertical'
import HostedByClubLink from '../../club/HostedByClubLink'
import MainFeedCalendarListItemInterestsList from '../calendar/MainFeedCalendarListItemInterestsList'
import FeedListItemEnterRoomTooltip from './FeedListItemEnterRoomTooltip'
import FeedListItemRoomTypeBadge from './FeedListItemRoomTypeBadge'
import FeedListItemSpeakersList from './FeedListItemSpeakersList'
import RoomsPeopleCounter from './RoomsPeopleCounter'
import SpeakersAvatarsList from './SpeakersAvatarsList'

interface Props {
  item: MainFeedItemModel
  readonly onPress: (item: MainFeedItemModel) => void
  readonly onDetailsPress: (item: MainFeedItemModel) => void
}

const PublicFeedListItem: React.FC<Props> = (props) => {
  const {colors} = useTheme()

  const {t} = useTranslation()

  const textPrimary = {color: colors.textPrimary}

  const speakers = props.item.speakers ?? []

  const listeners = props.item.listeners

  return (
    <AppTouchableOpacity
      onPress={() => props.onPress(props.item)}
      style={[styles.base, {backgroundColor: colors.accentPrimary}]}
      accessibilityLabel={'publicFeedListItem'}>
      <View style={StyleSheet.absoluteFill}>
        <Image
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
          />
        </Horizontal>
        <SpeakersAvatarsList speakers={speakers} />
        <Spacer vertical={ms(16)} />
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
          showSpeakingCount={false}
          showSpeakerIcon={true}
          showRoomsPeopleCounters={listeners.length === 0}
        />

        {listeners.length > 0 && (
          <Horizontal style={styles.listeners}>
            <Horizontal style={styles.listenersWrapper}>
              {listeners.slice(0, 4).map((s) => (
                <View key={s.id} style={styles.listenerWrapper}>
                  <AppAvatar
                    shortName={profileShortName(s.name, s.surname)}
                    avatar={s.avatar}
                    size={ms(28)}
                    style={styles.listener}
                    key={s.id}
                  />
                </View>
              ))}
            </Horizontal>

            <RoomsPeopleCounter feedItem={props.item} />
          </Horizontal>
        )}

        <View>
          <MainFeedCalendarListItemInterestsList
            style={styles.list}
            interests={props.item.interests}
            textStyle={styles.interestColor}
          />
        </View>

        <FeedListItemEnterRoomTooltip
          isNetworking={false}
          isCoHost={props.item.isCoHost}
        />
      </Vertical>
    </AppTouchableOpacity>
  )
}

export default PublicFeedListItem

const styles = StyleSheet.create({
  base: {
    minHeight: ms(50),
    borderRadius: ms(12),
    overflow: 'hidden',
    marginBottom: ms(8),
    padding: ms(16),
  },
  background: {
    width: '100%',
    height: '100%',
  },
  avatars: {
    marginBottom: ms(16),
  },
  title: {
    fontSize: ms(24),
    fontWeight: 'bold',
  },
  speakerName: {
    fontSize: ms(13),
    lineHeight: ms(14),
  },
  listeners: {
    marginTop: ms(16),
    alignItems: 'center',
  },
  listenersWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  listener: {
    width: ms(28),
    height: ms(28),
    borderWidth: 0,
  },
  listenerWrapper: {
    width: ms(28),
    height: ms(28),
    borderRadius: ms(28) / 2,
    marginEnd: ms(8),
    overflow: 'hidden',
  },
  list: {
    marginEnd: -ms(16),
    marginTop: ms(16),
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

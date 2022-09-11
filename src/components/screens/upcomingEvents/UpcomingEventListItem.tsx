import {BottomSheetScrollView} from '@gorhom/bottom-sheet'
import React, {memo} from 'react'
import {useTranslation} from 'react-i18next'
import {Platform, ScrollView, StyleSheet, View} from 'react-native'

import {ClubInfoModel, EventModel, UserModel} from '../../../models'
import {commonStyles, makeTextStyle, useTheme} from '../../../theme/appTheme'
import {maxWidth, ms} from '../../../utils/layout.utils'
import {getHeightFromPercent} from '../../../utils/safeArea.utils'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import EventTimeView from '../../common/EventTimeView'
import FlexSpace from '../../common/FlexSpace'
import Horizontal from '../../common/Horizontal'
import Spacer from '../../common/Spacer'
import Vertical from '../../common/Vertical'
import HostedByClubLink from '../club/HostedByClubLink'
import MainFeedCalendarListItemInterestsList from '../mainFeed/calendar/MainFeedCalendarListItemInterestsList'
import MarkdownHyperlink from '../profileScreen/MarkdownHyperlink'
import EventListItemEditButton from './EventListItemEditButton'
import EventListItemRingButton from './EventListItemRingButton'
import PrivateMeetingBadge from './PrivateMeetingBadge'
import UpcomingEventListItemParticipants from './UpcomingEventListItemParticipants'

interface Props {
  readonly event: EventModel
  readonly isScrollable?: boolean
  readonly clubScreen?: boolean
  readonly onPress?: (event: EventModel) => void
  readonly isDisabled?: boolean
  readonly onMemberPress?: (user: UserModel, dismiss: boolean) => void
  readonly onClubPress?: (club: ClubInfoModel, dismiss: boolean) => void
}

const UpcomingEventListItem: React.FC<Props> = ({
  event,
  isScrollable = false,
  clubScreen = false,
  isDisabled = false,
  onPress,
  onMemberPress,
  onClubPress,
}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  const isBigEventCard = onPress === undefined && !clubScreen
  const vPadding = ms(isBigEventCard ? 16 : 8)
  const RootComponent = onPress ? AppTouchableOpacity : View
  const ScrollComponent =
    Platform.OS === 'ios' || onPress ? ScrollView : BottomSheetScrollView
  const editTextStyle = isBigEventCard
    ? makeTextStyle(16, 19, 'normal')
    : makeTextStyle(13, 21, 'bold')

  return (
    <RootComponent
      accessibilityLabel={'UpcomingEventListItem'}
      accessibilityHint={'Event Card'}
      activeOpacity={onPress ? 0.8 : 1}
      style={styles.listItem}
      disabled={!onPress}
      onPress={onPress ? () => onPress?.(event) : undefined}>
      <Vertical>
        <Horizontal style={styles.horizontal}>
          {event.state === 'join' && (
            <>
              <View
                style={[
                  styles.greenCircle,
                  {backgroundColor: colors.activeAccentColor},
                ]}
              />
              <AppText
                style={{
                  color: colors.secondaryBodyText,
                  ...makeTextStyle(isBigEventCard ? 16 : 14, 18, 'normal'),
                }}>
                {t('ongoing')}
              </AppText>
            </>
          )}
          {event.state !== 'join' && (
            <EventTimeView
              time={event.date}
              style={[
                styles.dateContainer,
                {fontSize: ms(isBigEventCard ? 16 : 13)},
              ]}
            />
          )}

          {event.isPrivate && !isBigEventCard && (
            <PrivateMeetingBadge isShort style={styles.privateSmallBadge} />
          )}

          {!isDisabled && event.state !== 'join' && (
            <>
              <EventListItemRingButton event={event} />
              <EventListItemEditButton
                event={event}
                textStyle={editTextStyle}
              />
            </>
          )}
        </Horizontal>
        {event.isPrivate && isBigEventCard && (
          <Horizontal>
            <PrivateMeetingBadge style={styles.privateBadge} />
            <FlexSpace />
          </Horizontal>
        )}
        <AppText
          numberOfLines={2}
          accessibilityLabel={'upcomingEvent'}
          style={[
            styles.title,
            {
              color: colors.bodyText,
              marginTop: vPadding,
              fontSize: ms(isBigEventCard ? 24 : 17),
            },
          ]}>
          {event.title}
        </AppText>
        {!isBigEventCard && event.needApprove === true && (
          <AppText
            style={{
              ...makeTextStyle(ms(13), ms(21), 'normal'),
              color: colors.thirdBlack,
            }}>
            {t('approveNeedText')}
          </AppText>
        )}
        {event.club && !clubScreen && (
          <HostedByClubLink
            club={event.club}
            onClubPress={() => {
              onClubPress?.(event.club!, false)
            }}
          />
        )}
        <UpcomingEventListItemParticipants
          participants={event.participants}
          onMemberPress={onMemberPress}
          badgesWithBorder={isBigEventCard}
        />
        {event.description.length > 0 && (
          <ScrollComponent
            scrollEnabled={isScrollable}
            style={{
              maxHeight: isScrollable ? getHeightFromPercent('40%') : undefined,
              marginVertical: clubScreen ? 0 : vPadding,
            }}>
            <MarkdownHyperlink
              style={{flexGrow: 1}}
              linkStyle={commonStyles.link}>
              <AppText
                selectable
                numberOfLines={clubScreen ? 3 : 0}
                style={styles.description}>
                {event.description}
              </AppText>
            </MarkdownHyperlink>
          </ScrollComponent>
        )}
        {event.description.length === 0 && <Spacer vertical={ms(16)} />}

        {!clubScreen && (
          <>
            <MainFeedCalendarListItemInterestsList
              style={{marginEnd: -ms(16)}}
              contentContainerStyle={{paddingEnd: ms(8)}}
              interests={event.interests}
              itemStyle={{
                backgroundColor: colors.floatingBackground,
              }}
            />
            <View
              style={[styles.separator, {backgroundColor: colors.separator}]}
            />
          </>
        )}
      </Vertical>
    </RootComponent>
  )
}

export default memo(UpcomingEventListItem)

const styles = StyleSheet.create({
  horizontal: {
    alignItems: 'center',
  },

  dateContainer: {
    flex: 1,
  },

  privateSmallBadge: {
    marginEnd: ms(16),
  },

  privateBadge: {
    marginTop: ms(8),
  },

  listItem: {
    flex: 1,
    minHeight: ms(56),
    paddingTop: ms(8),
    paddingHorizontal: ms(16),
    width: maxWidth(),
    justifyContent: 'flex-start',
  },

  title: {
    fontWeight: 'bold',
    lineHeight: ms(25),
  },

  description: {
    fontSize: ms(13),
    lineHeight: ms(21),
  },

  separator: {
    height: ms(1),
    marginTop: ms(16),
  },

  greenCircle: {
    width: ms(12),
    height: ms(12),
    marginEnd: ms(4),
    borderRadius: ms(12) / 2,
    alignSelf: 'center',
  },
})

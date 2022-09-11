import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import AppIcon from '../../../../assets/AppIcon.native'
import {EventModel} from '../../../../models'
import {makeTextStyle, useTheme} from '../../../../theme/appTheme'
import {maxWidth, ms} from '../../../../utils/layout.utils'
import AppText from '../../../common/AppText'
import AppTouchableOpacity from '../../../common/AppTouchableOpacity'
import EventTimeView from '../../../common/EventTimeView'
import FlexSpace from '../../../common/FlexSpace'
import Horizontal from '../../../common/Horizontal'
import Vertical from '../../../common/Vertical'
import EventListItemRingButton from '../..//upcomingEvents/EventListItemRingButton'
import HostedByClubLink from '../../club/HostedByClubLink'
import EventListItemEditButton from '../../upcomingEvents/EventListItemEditButton'
import PrivateMeetingBadge from '../../upcomingEvents/PrivateMeetingBadge'
import MainFeedCalendarEventListItemInterests from './MainFeedCalendarEventListItemInterests'
import MainFeedCalendarEventListItemsSpeakers from './MainFeedCalendarEventListItemsSpeakers'

interface Props {
  readonly model: EventModel
  readonly onEventPress: () => void
  readonly onClubPress: () => void
}

const MainFeedCalendarListItem: React.FC<Props> = (props) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  const participants = props.model.participants
  const firstThreeSpeakers = participants.slice(0, 3)

  return (
    <View style={[styles.base, {backgroundColor: colors.systemBackground}]}>
      <Vertical
        style={[styles.listItem, {backgroundColor: colors.floatingBackground}]}>
        <AppTouchableOpacity onPress={props.onEventPress}>
          <Horizontal style={styles.timeLine}>
            <AppIcon
              style={styles.infoIcon}
              type={'icEventInfo'}
              tint={colors.accentPrimary}
            />
            <EventTimeView time={props.model.date} style={styles.date} />
            {props.model.isPrivate && (
              <PrivateMeetingBadge isShort style={styles.privateSmallBadge} />
            )}
            <>
              <EventListItemRingButton event={props.model} />
              <EventListItemEditButton event={props.model} />
            </>
          </Horizontal>
        </AppTouchableOpacity>
        <AppTouchableOpacity onPress={props.onEventPress}>
          {!!props.model.title && (
            <AppText
              accessibilityLabel={'feedCalendarItemTitle'}
              numberOfLines={2}
              style={[styles.title, {color: colors.bodyText}]}>
              {props.model.title}
            </AppText>
          )}
          {props.model.club && (
            <HostedByClubLink
              club={props.model.club}
              onClubPress={props.onClubPress}
            />
          )}
          {props.model.needApprove === true && (
            <AppText
              style={{
                ...makeTextStyle(ms(13), ms(21), 'normal'),
                color: colors.thirdBlack,
              }}>
              {t('approveNeedText')}
            </AppText>
          )}
          <MainFeedCalendarEventListItemsSpeakers
            speakers={firstThreeSpeakers}
          />
        </AppTouchableOpacity>
        <FlexSpace />
        <MainFeedCalendarEventListItemInterests
          interests={props.model.interests}
        />
      </Vertical>
    </View>
  )
}

export default MainFeedCalendarListItem

const styles = StyleSheet.create({
  base: {
    width: maxWidth(),
    paddingHorizontal: ms(16),
  },

  privateSmallBadge: {
    marginEnd: ms(16),
  },

  listItem: {
    width: maxWidth() - ms(32),
    borderRadius: ms(12),
    paddingHorizontal: ms(16),
    paddingTop: ms(16),
    height: '100%',
  },

  date: {
    flex: 1,
    fontSize: ms(13),
    lineHeight: ms(24),
  },

  title: {
    fontWeight: 'bold',
    fontSize: 24,
    marginTop: ms(8),
  },

  infoIcon: {
    width: ms(16),
    height: ms(16),
    marginEnd: ms(4),
  },

  timeLine: {
    alignItems: 'center',
  },
})

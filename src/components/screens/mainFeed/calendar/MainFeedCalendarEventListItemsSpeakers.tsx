import React, {memo} from 'react'
import {StyleSheet, TextStyle, View, ViewStyle} from 'react-native'

import AppIcon from '../../../../assets/AppIcon'
import {UserModel} from '../../../../models'
import {useTheme} from '../../../../theme/appTheme'
import {ms} from '../../../../utils/layout.utils'
import {
  getPriorityRoleBadgeIcon,
  profileShortName,
} from '../../../../utils/userHelper'
import AppAvatar from '../../../common/AppAvatar'
import AppText from '../../../common/AppText'
import Horizontal from '../../../common/Horizontal'
import Vertical from '../../../common/Vertical'

interface Props {
  readonly speakers: Array<UserModel>
}

const MainFeedCalendarEventListItemsSpeakers: React.FC<Props> = (props) => {
  const {colors} = useTheme()

  const namesContentStyle: ViewStyle = {
    justifyContent:
      props.speakers.length === 3 ? 'space-between' : 'space-evenly',
  }

  const nameStyle: TextStyle = {
    color: colors.thirdBlack,
    fontSize: ms(11),
    lineHeight: 16,
    fontWeight: 'bold',
  }

  return (
    <Horizontal style={styles.container}>
      {props.speakers.map((s) => (
        <View key={s.id} style={styles.speaker}>
          <AppAvatar
            size={ms(52)}
            fontSize={ms(16)}
            avatar={s.avatar}
            shortName={profileShortName(s.name, s.surname)}
          />
        </View>
      ))}
      <Vertical style={[styles.speakerNamesContainer, namesContentStyle]}>
        {props.speakers.map((s) => {
          const badgeIcon =
            getPriorityRoleBadgeIcon(s.badges, s.isSpecialGuest) ??
            'icEventSpeaker'
          return (
            <Horizontal key={s.id}>
              <AppText
                style={nameStyle}
                numberOfLines={1}
                ellipsizeMode={'tail'}>
                {s.displayName}{' '}
              </AppText>
              <AppIcon type={badgeIcon} tint={colors.thirdBlack} />
            </Horizontal>
          )
        })}
      </Vertical>
    </Horizontal>
  )
}

export default memo(MainFeedCalendarEventListItemsSpeakers)

const styles = StyleSheet.create({
  container: {
    marginStart: ms(16),
    height: ms(52),
    marginTop: ms(14),
  },
  speaker: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: ms(1000),
    overflow: 'hidden',
    borderWidth: ms(1),
    borderColor: 'white',
    marginStart: -ms(16),
    width: ms(52) + ms(1) * 2,
    height: ms(52) + ms(1) * 2,
  },
  fullWidth: {width: '100%', height: '100%'},
  speakerNamesContainer: {
    flex: 1,
    marginStart: ms(8),
    marginVertical: -ms(1) * 2,
  },
})

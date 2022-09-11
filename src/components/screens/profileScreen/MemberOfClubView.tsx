import {BottomSheetScrollView} from '@gorhom/bottom-sheet'
import {useNavigation} from '@react-navigation/native'
import React, {memo, useContext} from 'react'
import {useTranslation} from 'react-i18next'
import {ScrollView, StyleSheet, View} from 'react-native'

import {BottomSheetContext} from '@gorhom/bottom-sheet/src/contexts/external'

import {analytics} from '../../../Analytics'
import AppIcon from '../../../assets/AppIcon'
import Horizontal from '../../../components/common/Horizontal'
import {ClubInfoModel} from '../../../models'
import {commonStyles, makeTextStyle, useTheme} from '../../../theme/appTheme'
import {getClubRoleBadgeForUser} from '../../../utils/avatar.utils'
import {ms} from '../../../utils/layout.utils'
import {shortFromDisplayName} from '../../../utils/userHelper'
import AppAvatarWithBadge from '../../common/AppAvatarWithBadge'
import AppIconWithBadge from '../../common/AppIconWithBadge'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'

interface Props {
  readonly isSelf?: boolean
  readonly clubsInfo?: Array<ClubInfoModel>
  readonly onMyClubsPress: () => void
  readonly onMemberOfClubPress: (clubId: string) => void
}

const MemberOfClubView: React.FC<Props> = ({
  clubsInfo,
  onMyClubsPress,
  onMemberOfClubPress,
  isSelf = false,
}) => {
  const {t} = useTranslation()
  const bsContext = useContext(BottomSheetContext)
  const Container = bsContext === null ? ScrollView : BottomSheetScrollView
  const {colors} = useTheme()
  const navigation = useNavigation()

  const onPress = () => {
    analytics.sendEvent('member_create_club_button_click')

    navigation.navigate('CreateClubScreen')
  }
  const iconAvatarStyles = [
    styles.iconAvatar,
    {borderColor: colors.skeletonDark},
  ]

  const clubsCount = clubsInfo?.length ?? 0
  const titleColor = {
    color:
      isSelf || clubsCount > 0 ? colors.primaryClickable : colors.thirdBlack,
  }
  const baseStyle = {marginTop: clubsCount > 0 ? 0 : ms(12)}
  return (
    <View style={[styles.base, baseStyle]}>
      <Horizontal style={[styles.container, commonStyles.alignCenter]}>
        <Horizontal>
          <AppTouchableOpacity onPress={onMyClubsPress}>
            <AppText style={[styles.text, titleColor]}>
              {t(isSelf ? 'myClubs' : 'clubs').toUpperCase()}
            </AppText>
          </AppTouchableOpacity>
          <AppText style={styles.counter}>{clubsCount}</AppText>
        </Horizontal>
        {isSelf && (
          <AppTouchableOpacity onPress={onPress}>
            <Horizontal style={commonStyles.alignCenter}>
              <AppIcon type='icAdd' tint={colors.primaryClickable} />
              <AppText
                style={[{color: colors.primaryClickable}, styles.buttonText]}>
                {t('createClubButton')}
              </AppText>
            </Horizontal>
          </AppTouchableOpacity>
        )}
      </Horizontal>
      {clubsInfo && (
        <Container
          style={styles.avatarContainer}
          horizontal
          showsHorizontalScrollIndicator={false}>
          {clubsInfo.map((clubInfo) => {
            if (!clubInfo.avatar) {
              return (
                <AppTouchableOpacity
                  key={clubInfo.id}
                  onPress={() => onMemberOfClubPress(clubInfo.id)}>
                  <AppIconWithBadge
                    icon={getClubRoleBadgeForUser(clubInfo.clubRole)}
                    key={clubInfo.id}
                    style={iconAvatarStyles}
                    type={'icPersons'}
                    tint={'#757575'}
                    size={ms(32)}
                    scale={0.55}
                    offset={ms(32)}
                  />
                </AppTouchableOpacity>
              )
            }

            return (
              <AppTouchableOpacity
                key={clubInfo.id}
                onPress={() => onMemberOfClubPress(clubInfo.id)}>
                <AppAvatarWithBadge
                  icon={getClubRoleBadgeForUser(clubInfo.clubRole)}
                  key={clubInfo.id}
                  avatar={clubInfo.avatar}
                  containerStyle={styles.avatar}
                  shortName={shortFromDisplayName(clubInfo.title)}
                  style={styles.avatar}
                  size={ms(32)}
                  scale={0.5}
                  offset={ms(26)}
                />
              </AppTouchableOpacity>
            )
          })}
        </Container>
      )}
    </View>
  )
}

export default memo(MemberOfClubView)

const AVATAR_INTERVAL = 6
const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    paddingTop: ms(12),
  },
  base: {
    marginHorizontal: ms(16),
    marginBottom: ms(8),
  },
  text: {
    ...makeTextStyle(ms(11), ms(14.3), 'bold'),
  },
  counter: {
    ...makeTextStyle(ms(11), ms(14.3)),
    opacity: 0.32,
    marginLeft: ms(8),
  },
  avatarContainer: {
    flexDirection: 'row',
    marginTop: ms(16),
    marginStart: -ms(AVATAR_INTERVAL),
  },
  avatar: {
    marginStart: ms(AVATAR_INTERVAL),
  },
  iconAvatar: {
    marginStart: ms(AVATAR_INTERVAL * 2),
    width: ms(32),
    height: ms(32),
    borderRadius: ms(16),
    borderWidth: ms(1),
    ...commonStyles.flexCenter,
  },
  buttonText: {
    ...makeTextStyle(ms(12), ms(18), 'bold'),
  },
})

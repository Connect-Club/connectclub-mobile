import {observer} from 'mobx-react'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import AppIcon from '../../../assets/AppIcon'
import ClubStore from '../../../stores/ClubStore'
import {commonStyles, makeTextStyle, useTheme} from '../../../theme/appTheme'
import {isAtLeastClubModerator} from '../../../utils/club.utils'
import {ms} from '../../../utils/layout.utils'
import {shortFromDisplayName} from '../../../utils/userHelper'
import AppAvatar from '../../common/AppAvatar'
import AppText from '../../common/AppText'
import AppTouchableOpacity from '../../common/AppTouchableOpacity'
import Horizontal from '../../common/Horizontal'
import PrimaryButton from '../../common/PrimaryButton'
import JoinClubButton from '../clublist/JoinClubButton'
import ClubEventButton from './ClubEventButton'

interface Props {
  readonly store: ClubStore
  readonly onOwnerPress: () => void
  readonly onAddPeoplePress?: () => void
  readonly onToggleJoinPress?: () => void
  readonly isModal?: boolean
  readonly disabledLinks?: boolean
}

const ClubScreenHeader: React.FC<Props> = ({
  store,
  onOwnerPress,
  onAddPeoplePress,
  onToggleJoinPress,
  isModal,
  disabledLinks,
}) => {
  const {colors} = useTheme()
  const {t} = useTranslation()

  const club = store.club

  const linkColor = {
    color: disabledLinks ? colors.bodyText : colors.accentPrimary,
  }

  if (!club) return null

  const canAddPeople = isAtLeastClubModerator(store.club?.clubRole)
  const iconAvatarStyles = [
    styles.iconAvatar,
    {borderColor: colors.skeletonDark},
  ]

  return (
    <View style={styles.base}>
      {club.avatar && (
        <AppAvatar
          shortName={shortFromDisplayName(club?.title ?? '')}
          avatar={club.avatar}
          size={ms(100)}
        />
      )}
      {!club.avatar && (
        <AppIcon type={'icPersons40'} style={iconAvatarStyles} />
      )}
      <View style={styles.infoContainer}>
        <AppText style={[styles.title, {color: colors.bodyText}]}>
          {club.title}
        </AppText>
        <View style={styles.byContainer}>
          <AppText style={[styles.byText, {color: colors.bodyText}]}>
            {t('clubOwnerLabel')}
          </AppText>
          <AppAvatar
            style={styles.ownerAvatar}
            shortName={shortFromDisplayName(club.owner.displayName)}
            avatar={club.owner.avatar}
            size={ms(16)}
          />
          <AppTouchableOpacity onPress={onOwnerPress}>
            <AppText style={[styles.byText, linkColor]}>
              {club.owner.displayName}
            </AppText>
          </AppTouchableOpacity>
        </View>
        {disabledLinks !== true && (
          <Horizontal style={{marginTop: ms(16)}}>
            {canAddPeople && (
              <PrimaryButton
                title={t('people')}
                textStyle={styles.buttonAddPeopleText}
                icon={{
                  type: 'icAdd16',
                  tint: colors.indicatorColorInverse,
                  style: styles.buttonAddPeopleIcon,
                }}
                style={styles.buttonAddPeople}
                onPress={onAddPeoplePress}
              />
            )}
            <ClubEventButton isModal={isModal} store={store} />
            {!canAddPeople && (
              <JoinClubButton
                isLoading={store.isInJoinAction}
                clubRole={store.club!.clubRole}
                onToggleJoinPress={onToggleJoinPress}
              />
            )}
          </Horizontal>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    paddingTop: ms(12),
  },
  infoContainer: {
    flex: 1,
    marginStart: ms(18),
    justifyContent: 'center',
  },
  title: {
    ...makeTextStyle(ms(24), ms(28), 'bold'),
  },
  byContainer: {
    flexDirection: 'row',
    marginTop: ms(5),
  },
  byText: {
    ...makeTextStyle(ms(12), ms(16)),
  },
  ownerAvatar: {
    marginHorizontal: ms(4),
  },
  moderateButton: {
    alignSelf: 'flex-start',
  },
  buttonAddPeople: {
    height: ms(28),
    minWidth: 0,
    paddingStart: ms(10),
    paddingEnd: ms(12),
    marginEnd: ms(8),
  },
  buttonAddPeopleIcon: {
    marginTop: ms(1),
    marginEnd: ms(2),
  },
  buttonAddPeopleText: {
    ...makeTextStyle(12, 18, 'bold'),
  },
  iconAvatar: {
    width: ms(100),
    height: ms(100),
    borderWidth: ms(1),
    borderRadius: ms(50),
    ...commonStyles.flexCenter,
  },
})

export default observer(ClubScreenHeader)

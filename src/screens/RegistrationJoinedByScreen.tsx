import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useCallback, useEffect, useState} from 'react'
import {useTranslation} from 'react-i18next'
import {ActivityIndicator, StyleSheet, View} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {analytics} from '../Analytics'
import AppAvatar from '../components/common/AppAvatar'
import AppText from '../components/common/AppText'
import PrimaryButton from '../components/common/PrimaryButton'
import {FadeViewOnStart} from '../components/screens/startRoom/FadeViewOnStart'
import {ClubModel, InitialLinkProp} from '../models'
import {storage} from '../storage'
import WaitingInviteStore from '../stores/WaitingInviteStore'
import {commonStyles, useTheme} from '../theme/appTheme'
import {isJoinedClub} from '../utils/club.utils'
import {ContactChecker} from '../utils/ContactChecker'
import {isWebOrTablet} from '../utils/device.utils'
import {ms} from '../utils/layout.utils'
import {resetTo} from '../utils/navigation.utils'
import {getClubIdFromUri} from '../utils/stringHelpers'
import {tabletButtonWidthLimit} from '../utils/tablet.consts'
import {getUserShortName} from '../utils/userHelper'
import {useViewModel} from '../utils/useViewModel'

type ScreenRouteProp = RouteProp<{Screen: InitialLinkProp}, 'Screen'>

/**
 * Since user could follow club link (but not approved there yet) and has
 * regular invitation to app then we need to direct them to regular reg welcome view.
 */
const isJoinedByClubInvitation = (club?: ClubModel) => {
  if (!club) return false
  const state = storage.currentUser?.state
  const isInvited = state === 'verified' || state === 'invited'
  // noinspection RedundantIfStatementJS
  if (isInvited && !isJoinedClub(club.clubRole)) return false
  return true
}

const RegistrationJoinedByScreen: React.FC = () => {
  const {params} = useRoute<ScreenRouteProp>()
  const {colors} = useTheme()
  const navigation = useNavigation()
  const {t} = useTranslation()
  const inset = useSafeAreaInsets()
  const store = useViewModel(() => new WaitingInviteStore())
  const title = isJoinedByClubInvitation(store.club)
    ? t('clubRegistrationWelcomeTitle', {
        club: store.club?.title,
      })
    : t('registrationJoinedByTitle')
  const [contactChecker] = useState(
    () =>
      new ContactChecker((_, screen, p) => {
        navigation.dispatch(resetTo(screen, p))
      }),
  )
  const joinedBy = storage.currentUser?.joinedBy
  const isJoinedByClubOwner = storage.currentUser?.joinedByClubRole === 'owner'
  const subtitle = isJoinedByClubInvitation(store.club)
    ? t('registrationInvitedToClubBy', {
        name: joinedBy?.displayName,
        role: isJoinedByClubOwner ? t('clubRoleCreator') : t('clubRoleAdmin'),
      })
    : t('registrationJoinedByFriend', {name: joinedBy?.displayName})

  const joinClub = useCallback(async () => {
    if (store.club) await store.requestJoinClub()
  }, [store])

  useEffect(() => {
    store.initialize(getClubIdFromUri(params?.initialLink)).then(joinClub)
    analytics.sendEvent('registration_joined_by_screen_open')
  }, [joinClub, params?.initialLink, store])

  const onEnterManuallyPress = () => {
    contactChecker.isNeedToShowRequestScreen(t).then((isNeeded) => {
      if (isNeeded) {
        return navigation.dispatch(resetTo('RequestPermissionContactsScreen'))
      }
      contactChecker.fetchContacts(t)
    })
  }

  return (
    <View style={commonStyles.wizardContainer}>
      {store.isLoading && (
        <ActivityIndicator
          style={styles.loader}
          animating={true}
          size={'small'}
          color={colors.accentPrimary}
        />
      )}
      {!store.isLoading && (
        <>
          <FadeViewOnStart
            style={[
              commonStyles.paddingHorizontal,
              styles.contentContainer,
              {paddingTop: inset.top + 96},
            ]}>
            <AppText
              style={[
                styles.title,
                commonStyles.registrationBigTitle,
                {color: colors.bodyText, marginBottom: ms(16)},
              ]}>
              {title}
            </AppText>

            <AppAvatar
              shortName={getUserShortName(joinedBy)}
              avatar={joinedBy?.avatar}
              style={styles.avatar}
              size={ms(180)}
            />
            <AppText style={[styles.friendText, {color: colors.bodyText}]}>
              {subtitle}
            </AppText>
          </FadeViewOnStart>

          <FadeViewOnStart
            style={[styles.bottomContent, {marginBottom: inset.bottom + 22}]}>
            <PrimaryButton
              style={styles.button}
              title={t('registrationJoinedByGoNext')}
              accessibilityLabel={'nextButton'}
              onPress={onEnterManuallyPress}
            />
          </FadeViewOnStart>
        </>
      )}
    </View>
  )
}

export default observer(RegistrationJoinedByScreen)

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: isWebOrTablet() ? 'center' : 'flex-start',
  },
  avatar: {
    width: ms(180),
    height: ms(180),
  },
  title: {
    marginBottom: ms(18),
  },
  friendText: {
    fontSize: ms(12),
    fontWeight: 'bold',
    marginTop: ms(10),
    textAlign: 'center',
  },
  bottomContent: {
    alignItems: 'center',
  },
  loader: {
    position: 'absolute',
    paddingHorizontal: ms(8),
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  button: {
    ...commonStyles.wizardPrimaryButton,
    minWidth: ms(126),
    maxWidth: ms(isWebOrTablet() ? tabletButtonWidthLimit : 126),
  },
})

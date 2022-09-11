import {BottomSheetScrollView} from '@gorhom/bottom-sheet'
import {useNavigation} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {memo, ReactNode, useCallback, useContext, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native'
import {useSafeAreaInsets} from 'react-native-safe-area-context'

import {BottomSheetContext} from '@gorhom/bottom-sheet/src/contexts/external'

import {analytics} from '../../../Analytics'
import {
  appEventEmitter,
  hideLoading,
  showLoading,
} from '../../../appEventEmitter'
import {ClubInfoModel, ClubModel, ClubParams} from '../../../models'
import {storage} from '../../../storage'
import ClubStore from '../../../stores/ClubStore'
import {commonStyles, makeTextStyle, useTheme} from '../../../theme/appTheme'
import {isAtLeastClubModerator, isJoinedClub} from '../../../utils/club.utils'
import {isNative} from '../../../utils/device.utils'
import {ms} from '../../../utils/layout.utils'
import {push} from '../../../utils/navigation.utils'
import {shareClubDialog} from '../../../utils/sms.utils'
import {toastHelper} from '../../../utils/ToastHelper'
import {useViewModel} from '../../../utils/useViewModel'
import AppText from '../../common/AppText'
import Section from '../../common/Section'
import Spacer from '../../common/Spacer'
import Vertical from '../../common/Vertical'
import {alert} from '../../webSafeImports/webSafeImports'
import BringMorePeopleView from '../createClub/BringMorePeopleView'
import EditClubPopupView from '../createClub/EditClubPopupView'
import EditClubSections from '../createClub/EditClubSections'
import MainFeedCalendarListItemInterestsList from '../mainFeed/calendar/MainFeedCalendarListItemInterestsList'
import MarkdownHyperlink from '../profileScreen/MarkdownHyperlink'
import {logJS} from '../room/modules/Logger'
import ClubEventsView from './ClubEventsView'
import ClubMembers from './ClubMembers'
import ClubScreenHeader from './ClubScreenHeader'
import ClubScreenToolbar from './ClubScreenToolbar'

type Props = ClubParams & {
  readonly withCustomToolbar?: boolean
  readonly disabledLinks?: boolean
  readonly navigationRoot?: string
  readonly onGoBackPress?: () => void
  readonly onEditInterestsPress?: () => void
  readonly isModal?: boolean
  readonly isClubCreation?: boolean
}

const ClubView: React.FC<Props> = (props) => {
  const {colors} = useTheme()
  const {t} = useTranslation()
  const navigation = useNavigation()
  const store = useViewModel(() => new ClubStore())
  const inset = useSafeAreaInsets()
  const isClubCreation = props.isClubCreation ?? false

  const onSharePress = useCallback(() => {
    analytics.sendEvent('club_view_share_click', {
      clubId: store.clubId,
    })
    if (store.club) {
      shareClubDialog(props.clubId, store.club!.slug)
    }
  }, [props.clubId, store.club, store.clubId])

  const onAddPeoplePress = () => {
    analytics.sendEvent('club_add_people_click', {clubId: club.id})
    navigation.navigate('AddPeopleToClubScreen', {club: store.club})
  }

  const onAddEventPress = () => {
    analytics.sendEvent('club_add_event_section_button_click')
    const args = {selectedClub: club as ClubInfoModel, isModal: props.isModal}
    navigation.navigate('CreateEventScreen', args)
  }

  const onAddInterestsPress = () => {
    analytics.sendEvent('club_add_interests_button_click')
    props.onEditInterestsPress?.()
  }

  const onAddDescriptionPress = () => {
    if (!store.club) return
    analytics.sendEvent('club_add_description_button_click')
    navigation.navigate('EditClubSettingScreen', {club: store.club})
  }

  const onOwnerPress = useCallback(() => {
    if (props.disabledLinks) return
    const args = {userId: store.club?.owner?.id}
    analytics.sendEvent('club_view_owner_click', {
      clubId: store.clubId,
      ownerId: args.userId,
    })
    if (props.isModal) {
      push(navigation, 'ProfileScreen', args)
    } else {
      navigation.navigate('ProfileScreenModal', args)
    }
  }, [
    navigation,
    props.disabledLinks,
    props.isModal,
    store.club?.owner?.id,
    store.clubId,
  ])

  const onRefresh = useCallback(async () => {
    return await store.fetchEvents()
  }, [store])

  useEffect(() => {
    store.initializeWithClubId(props.clubId, isNative)
    const refreshCleaner = appEventEmitter.on('refreshMainFeed', onRefresh)
    analytics.sendEvent('club_screen_open', {clubId: props.clubId})

    return () => {
      refreshCleaner()
    }
  }, [store, props.clubId, onRefresh])

  useEffect(() => {
    if (store.isInProgress) {
      showLoading()
    } else {
      hideLoading()
    }
  }, [store.isInProgress])

  const onClubJoinPress = async (club: ClubModel) => {
    logJS('debug', 'ClubView', 'club join pressed', club.id)
    analytics.sendEvent('club_view_join_club_click', {clubId: club.id})
    await store.joinRequest()
  }

  const onClubLeaveConfirmPress = async () => {
    logJS('debug', 'ClubView', 'club leave confirm pressed', club.id)
    analytics.sendEvent('club_view_leave_club_confirm_click', {clubId: club.id})
    await store.leaveClub()
    if (!store.actionError) {
      toastHelper.success(t('leftClubSuccess', {title: club.title}), false)
    } else {
      toastHelper.error('somethingWentWrong')
    }
  }

  const onToggleJoinPress = () => {
    if (isJoinedClub(club.clubRole)) {
      analytics.sendEvent('club_view_leave_club_click', {clubId: club.id})
      alert(t('leaveClubTitle', {title: club.title}), t('leaveClubMessage'), [
        {style: 'cancel', text: t('cancelButton')},
        {
          style: 'destructive',
          text: t('leave'),
          onPress: onClubLeaveConfirmPress,
        },
      ])
      return
    }
    onClubJoinPress(club)
  }

  const onModeratePress = useCallback(() => {
    const navArgs = {
      clubId: props.clubId,
      club: store.club,
      navigationRoot: props.navigationRoot,
      initialTab: 'requests',
    }
    push(navigation, 'ClubMembersScreen', navArgs)
  }, [navigation, props.clubId, props.navigationRoot, store.club])

  const onMembersPress = useCallback(() => {
    if (props.disabledLinks) return
    const navArgs = {
      clubId: store.club!.id,
      club: store.club!,
      navigationRoot: props.navigationRoot,
    }
    analytics.sendEvent('club_view_members_click', {
      clubId: store.clubId,
    })
    push(navigation, 'ClubMembersScreen', navArgs)
  }, [
    navigation,
    props.disabledLinks,
    props.navigationRoot,
    store.club,
    store.clubId,
  ])

  if (!store.club) {
    return (
      <View style={[commonStyles.wizardContainer, commonStyles.flexOne]}>
        {!isNative && store.isLoading && (
          <ActivityIndicator
            style={styles.loader}
            animating={true}
            size={'small'}
            color={colors.accentPrimary}
          />
        )}
      </View>
    )
  }

  const club = store.club
  const isOwner = club.owner?.id === storage.currentUserId
  const isOwnerOrModerator = isAtLeastClubModerator(club.clubRole)
  const onEditPress = isOwner
    ? () => {
        if (!store.club) return
        logJS('debug', 'ClubView', 'profile club edit pressed')
        analytics.sendEvent('profile_club_edit_click')
        navigation.navigate('EditClubSettingScreen', {club: store.club})
      }
    : undefined

  return (
    <Wrapper
      clubId={club.id}
      onSharePress={onSharePress}
      onEditPress={onEditPress}
      onGoBackPress={props.onGoBackPress}
      isModal={props.isModal ?? false}
      isVisible={props.withCustomToolbar}
      store={store}>
      {isClubCreation && <EditClubPopupView onAddEvent={onAddEventPress} />}
      <Vertical
        style={[
          commonStyles.flexOne,
          {paddingBottom: inset.bottom, paddingHorizontal: ms(16)},
        ]}>
        <ClubScreenHeader
          isModal={props.isModal}
          onOwnerPress={onOwnerPress}
          onAddPeoplePress={onAddPeoplePress}
          store={store}
          disabledLinks={props.disabledLinks}
          onToggleJoinPress={onToggleJoinPress}
        />
        <View
          style={[
            styles.separator,
            {backgroundColor: colors.inactiveAccentColor},
          ]}
        />
        <ClubMembers
          store={store}
          clubId={club.id}
          members={club.members}
          onMembersPress={props.disabledLinks ? undefined : onMembersPress}
          onModeratePress={props.disabledLinks ? undefined : onModeratePress}
          totalMembersCount={club.countParticipants}
        />
        {isOwnerOrModerator && (
          <>
            <Spacer vertical={ms(16)} />
            <BringMorePeopleView onShareLink={onSharePress} />
          </>
        )}
        <View
          style={[
            styles.separator,
            {backgroundColor: colors.inactiveAccentColor},
          ]}
        />
        {isOwnerOrModerator &&
          !store.isLoading &&
          store.clubEvents.length === 0 && (
            <EditClubSections
              title={t('upcomingEvents')}
              action={onAddEventPress}
              buttonText={t('createAnEvent')}
              style={styles.dashedSection}
            />
          )}
        <ClubEventsView store={store} />
        {store.clubEvents.length > 0 && (
          <View
            style={[
              styles.separator,
              {backgroundColor: colors.inactiveAccentColor},
            ]}
          />
        )}
        {isOwnerOrModerator && !store.hasInterests && (
          <EditClubSections
            title={t('clubInterests')}
            action={onAddInterestsPress}
            buttonText={t('addInterests')}
          />
        )}
        {store.hasInterests && (
          <>
            <Section
              style={styles.interestsSection}
              title={t('clubInterests').toUpperCase()}
              count={club.interests.length}
            />
            <MainFeedCalendarListItemInterestsList
              interests={club.interests}
              contentContainerStyle={styles.interestsContent}
              style={styles.interestsList}
              itemStyle={{backgroundColor: colors.floatingBackground}}
            />
          </>
        )}
        {isOwnerOrModerator && !store.hasDescription && (
          <EditClubSections
            title={t('aboutTheClub')}
            action={onAddDescriptionPress}
            buttonText={t('fillDescription')}
          />
        )}
        {store.hasDescription && (
          <>
            <Section title={t('aboutTheClub').toUpperCase()} />
            <MarkdownHyperlink linkStyle={commonStyles.link}>
              <AppText
                style={[styles.descriptionText, {color: colors.bodyText}]}>
                {club.description}
              </AppText>
            </MarkdownHyperlink>
          </>
        )}
        <Spacer vertical={ms(32)} />
      </Vertical>
    </Wrapper>
  )
}

type WrapperProps = {
  clubId?: string
  onSharePress?: () => void
  onEditPress?: () => void
  onGoBackPress?: () => void
  isVisible?: boolean
  children?: ReactNode
  isModal: boolean
  store: ClubStore
}

const Wrapper: React.FC<WrapperProps> = memo(
  ({
    clubId,
    onSharePress,
    onEditPress,
    onGoBackPress,
    isVisible,
    isModal,
    store,
    children,
  }) => {
    const onSharePressInternal = () => onSharePress?.()
    const bsContext = useContext(BottomSheetContext)
    const Container = bsContext === null ? ScrollView : BottomSheetScrollView

    return (
      <View style={[commonStyles.wizardContainer, commonStyles.flexOne]}>
        {isVisible && (
          <ClubScreenToolbar
            topInset={!isModal}
            onSharePress={onSharePressInternal}
            onEditPress={onEditPress}
            onGoBackPress={onGoBackPress}
            clubId={clubId}
          />
        )}
        <Container
          refreshControl={
            <RefreshControl
              refreshing={store.isRefreshing}
              onRefresh={store.refresh}
            />
          }
          showsVerticalScrollIndicator={false}>
          {children}
        </Container>
      </View>
    )
  },
)

export default observer(ClubView)

const styles = StyleSheet.create({
  separator: {
    flex: 1,
    marginTop: ms(24),
    height: ms(1),
  },
  descriptionText: {
    marginTop: ms(24),
    ...makeTextStyle(ms(15), ms(24)),
  },
  interestsList: {
    marginTop: ms(16),
  },
  interestsContent: {
    paddingStart: ms(16),
  },
  loader: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    justifyContent: 'flex-start',
    top: ms(72),
  },
  interestsSection: {
    marginTop: ms(34),
    marginBottom: ms(8),
  },
  dashedSection: {
    marginTop: ms(18),
  },
})

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useCallback, useEffect, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'
import PagerView from 'react-native-pager-view'

import {analytics} from '../Analytics'
import AppIcon from '../assets/AppIcon'
import AppNavigationHeader from '../components/common/AppNavigationHeader'
import CancelableSearchBar from '../components/common/CancelableSearchBar'
import ContentLoadingView from '../components/common/ContentLoadingView'
import SecondaryButton from '../components/common/SecondaryButton'
import Vertical from '../components/common/Vertical'
import ClubMembersTabs, {
  Selection,
} from '../components/screens/clubmembers/ClubMembersTabs'
import ClubMembersView from '../components/screens/clubmembers/ClubMembersView'
import ClubRequestsView from '../components/screens/clubmembers/ClubRequestsView'
import NavigationIconButton from '../components/screens/mainFeed/NavigationIconButton'
import {HandleComponent} from '../components/screens/room/CommonBottomSheet'
import {ClubModel} from '../models'
import ClubMembersScreenStore from '../stores/ClubMembersScreenStore'
import {ClubMembersStore} from '../stores/ClubMembersStore'
import {ClubRequestsStore} from '../stores/ClubRequestsStore'
import ClubStore from '../stores/ClubStore'
import {commonStyles, makeTextStyle, useTheme} from '../theme/appTheme'
import {isAtLeastClubModerator} from '../utils/club.utils'
import KeyboardSpacer from '../utils/KeyboardSpacer'
import {ms} from '../utils/layout.utils'
import {push} from '../utils/navigation.utils'
import {useViewModel} from '../utils/useViewModel'

type ScreenProps = {
  navigationRoot?: string
  clubId?: string
  club?: ClubModel
  initialTab?: Selection
}

type ScreenRouteProp = RouteProp<{Screen: ScreenProps}, 'Screen'>

const tabIndices = new Map<Selection, number>([
  ['people', 0],
  ['requests', 1],
])

const ClubMembersScreen: React.FC = () => {
  const {params} = useRoute<ScreenRouteProp>()
  const {colors} = useTheme()
  const {t} = useTranslation()
  const pagerRef = useRef<PagerView>(null)
  const navigation = useNavigation()
  const shouldLoad = !params.club
  const clubId = (params.club?.id ?? params.clubId)!
  const willRequireRefresh = useRef(false)
  const clubStore = useViewModel(() => new ClubStore())
  const clubMembersStore = useViewModel(() => new ClubMembersStore(clubId))
  const clubRequestsStore = useViewModel(() => new ClubRequestsStore(clubId))
  const viewModel = useViewModel(
    () =>
      new ClubMembersScreenStore(
        clubStore,
        clubMembersStore,
        clubRequestsStore,
        params.initialTab ?? 'people',
      ),
  )
  const canModerate = isAtLeastClubModerator(viewModel.club?.clubRole) ?? false

  const onAddPeoplePress = () => {
    if (!clubStore.club) return
    willRequireRefresh.current = true
    analytics.sendEvent('club_list_add_people_click', {clubId: params.clubId})
    push(navigation, 'ProfileScreenModal', {
      club: clubStore.club,
      initialScreen: 'AddPeopleToClubScreen',
    })
  }

  const load = useCallback(() => {
    if (shouldLoad) {
      viewModel.initializeWithClubId(clubId)
    } else {
      viewModel.initializeWithClub(params.club)
    }
  }, [clubId, params.club, shouldLoad, viewModel])

  useEffect(() => {
    load()
    return navigation.addListener('focus', () => {
      if (willRequireRefresh.current) {
        load()
        willRequireRefresh.current = false
      }
    })
  }, [load, navigation])

  useEffect(() => {
    switch (viewModel.currentTab) {
      case 'people':
        pagerRef.current?.setPageWithoutAnimation(0)
        break
      case 'requests':
        pagerRef.current?.setPageWithoutAnimation(1)
        break
    }
  }, [viewModel.currentTab])

  return (
    <Vertical style={commonStyles.flexOne}>
      <HandleComponent />
      <AppNavigationHeader
        headerLeft={
          <NavigationIconButton
            icon={'icNavigationBack'}
            accessibilityLabel={'closeLanguageSelector'}
            tint={colors.accentPrimary}
            onPress={navigation.goBack}
          />
        }
        topInset={false}
        title={t('members')}
        headerRight={
          !canModerate ? undefined : (
            <SecondaryButton
              title={t('people')}
              textStyle={styles.buttonAddPeopleText}
              iconLeft={
                <AppIcon
                  type={'icAdd16'}
                  style={styles.buttonAddPeopleIcon}
                  tint={colors.primaryClickable}
                />
              }
              style={styles.buttonAddPeople}
              onPress={onAddPeoplePress}
            />
          )
        }
      />
      <ContentLoadingView
        loading={viewModel.isLoading && !viewModel.searchMode}
        error={viewModel.error}
        animated={false}
        onRetry={load}>
        {canModerate && (
          <>
            <ClubMembersTabs
              onSelectionChange={viewModel.setCurrentTab}
              selection={viewModel.currentTab}
              counter={clubRequestsStore.requestsCount}
            />
            <View
              style={[styles.divider, {backgroundColor: colors.separator}]}
            />
          </>
        )}
        <CancelableSearchBar
          searchMode={viewModel.searchMode}
          placeholderText={t('searchPeoplePlaceholder')}
          placeholderTextActivated={t('searchPeoplePlaceholder')}
          isLoading={viewModel.isLoading}
          onChangeText={viewModel.search}
          onSearchModeChanged={viewModel.setSearchMode}
        />
        {canModerate && viewModel.club && (
          <PagerView
            ref={pagerRef}
            style={styles.pager}
            initialPage={tabIndices.get(viewModel.currentTab)!}
            scrollEnabled={false}>
            <View style={commonStyles.flexOne}>
              <ClubMembersView store={clubMembersStore} club={viewModel.club} />
            </View>
            <View style={commonStyles.flexOne}>
              <ClubRequestsView store={clubRequestsStore} />
            </View>
          </PagerView>
        )}
        {!canModerate && viewModel.club && (
          <ClubMembersView store={clubMembersStore} club={viewModel.club} />
        )}
        <KeyboardSpacer />
      </ContentLoadingView>
    </Vertical>
  )
}

const styles = StyleSheet.create({
  pager: {
    ...commonStyles.flexOne,
    alignContent: 'flex-start',
  },
  tabs: {
    paddingBottom: ms(4),
  },
  divider: {
    height: ms(1),
  },
  tab: {
    height: ms(42),
  },
  titlesStyle: {
    fontSize: ms(12),
    fontWeight: '600',
    lineHeight: ms(18),
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
    ...makeTextStyle(18, 24, 'normal'),
  },
})

export default observer(ClubMembersScreen)

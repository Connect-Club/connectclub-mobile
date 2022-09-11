import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useEffect, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {analytics} from '../Analytics'
import {hideLoading, showLoading} from '../appEventEmitter'
import AppIcon from '../assets/AppIcon'
import AppNavigationHeader from '../components/common/AppNavigationHeader'
import AppText from '../components/common/AppText'
import BaseFlatList from '../components/common/BaseFlatList'
import ContentLoadingView from '../components/common/ContentLoadingView'
import ListLoadMoreIndicator from '../components/common/ListLoadMoreIndicator'
import PrimaryButton from '../components/common/PrimaryButton'
import SecondaryButton from '../components/common/SecondaryButton'
import Spacer from '../components/common/Spacer'
import Vertical from '../components/common/Vertical'
import JoinClubButton from '../components/screens/clublist/JoinClubButton'
import JoinableClubListItem from '../components/screens/exploreClubs/JoinableClubListItem'
import NavigationIconButton from '../components/screens/mainFeed/NavigationIconButton'
import {HandleComponent} from '../components/screens/room/CommonBottomSheet'
import {logJS} from '../components/screens/room/modules/Logger'
import {alert} from '../components/webSafeImports/webSafeImports'
import {ClubModel, ClubUser} from '../models'
import {storage} from '../storage'
import ClubListScreenStore from '../stores/ClubListScreenStore'
import {commonStyles, makeTextStyle, useTheme} from '../theme/appTheme'
import {isJoinedClub} from '../utils/club.utils'
import {ms} from '../utils/layout.utils'
import {push} from '../utils/navigation.utils'
import {useBottomSafeArea} from '../utils/safeArea.utils'
import {toastHelper} from '../utils/ToastHelper'
import {useViewModel} from '../utils/useViewModel'

type Props = {
  userId: string
  userDisplayName?: string
}

export type ScreenRouteProp = RouteProp<{Screen: Props}, 'Screen'>

const ClubListScreen: React.FC = () => {
  const {params} = useRoute<ScreenRouteProp>()
  const {colors} = useTheme()
  const {t} = useTranslation()
  const inset = useBottomSafeArea()
  const navigation = useNavigation()
  const store = useViewModel(() => new ClubListScreenStore(params.userId))
  const willRequireRefresh = useRef(false)

  const onClubPress = (club: ClubModel) => {
    logJS('debug', 'ClubListScreen', 'club pressed', club.id)
    push(navigation, 'ProfileScreenModal', {
      clubId: club.id,
      initialScreen: 'ClubScreen',
    })
  }

  const onClubOwnerPress = (user: ClubUser) => {
    logJS('debug', 'ClubListScreen', 'club owner pressed', user.id)
    push(navigation, 'ProfileScreenModal', {
      userId: user.id,
    })
  }

  const onClubJoinPress = async (club: ClubModel) => {
    logJS('debug', 'ClubListScreen', 'club join pressed', club.id)
    analytics.sendEvent('club_list_join_club_click', {clubId: club.id})
    await store.onJoinClub(club.id)
  }

  const onClubLeaveConfirmPress = async (club: ClubModel) => {
    logJS('debug', 'ClubListScreen', 'club leave pressed', club.id)
    analytics.sendEvent('club_list_leave_club_confirm_click', {clubId: club.id})
    await store.onLeaveClub(club.id)
    if (!store.actionError) {
      toastHelper.success(t('leftClubSuccess', {title: club.title}), false)
    }
  }

  const onToggleJoinPress = (club: ClubModel) => {
    if (isJoinedClub(club.clubRole)) {
      analytics.sendEvent('club_list_leave_club_click', {clubId: club.id})
      alert(t('leaveClubTitle', {title: club.title}), t('leaveClubMessage'), [
        {style: 'cancel', text: t('cancelButton')},
        {
          style: 'destructive',
          text: t('leave'),
          onPress: () => onClubLeaveConfirmPress(club),
        },
      ])
      return
    }
    onClubJoinPress(club)
  }

  const onCreateClubPress = () => {
    willRequireRefresh.current = true
    push(navigation, 'ProfileScreenModal', {
      userId: storage.currentUser!.id,
      initialScreen: 'CreateClubScreen',
    })
  }

  const onExplorePress = () => {
    willRequireRefresh.current = true
    navigation.navigate('ExploreScreen', {isModal: true})
  }

  useEffect(() => {
    store.listStore.load(true)
    return navigation.addListener('focus', () => {
      if (willRequireRefresh.current) {
        store.listStore.load(true)
        willRequireRefresh.current = false
      }
    })
  }, [navigation, store])

  useEffect(() => {
    if (store.isActionInProgress) {
      showLoading()
    } else {
      hideLoading()
    }
  }, [store.isActionInProgress])

  const isEmpty = store.listStore.list.length === 0
  const title = params.userDisplayName
    ? t('othersClubs', {name: params.userDisplayName})
    : t('myClubs')

  return (
    <Vertical style={commonStyles.flexOne}>
      <HandleComponent />
      <AppNavigationHeader
        title={title}
        topInset={false}
        headerLeft={
          <NavigationIconButton
            icon={
              navigation.canGoBack() ? 'icNavigationBack' : 'icNavigationClose'
            }
            accessibilityLabel={'closeLanguageSelector'}
            tint={colors.accentPrimary}
            onPress={navigation.goBack}
          />
        }
      />
      <ContentLoadingView
        loading={store.listStore.isLoading}
        error={store.listStore.error}
        onRetry={() => store.listStore.load(true)}
        animated={false}>
        {isEmpty && (
          <Vertical style={styles.emptyContainer}>
            <AppIcon type={'icEmptyClubs'} />
            <AppText style={styles.emptyTitle}>{t('emptyClubsTitle')}</AppText>
            <Spacer vertical={ms(32)} />
            <PrimaryButton
              title={t('exploreClubsButton')}
              onPress={onExplorePress}
            />
            <Spacer vertical={ms(24)} />
            <SecondaryButton
              style={[
                styles.buttonCreateClub,
                {backgroundColor: colors.accentSecondary},
              ]}
              title={t('createClubButton')}
              onPress={onCreateClubPress}
            />
          </Vertical>
        )}
        <BaseFlatList
          style={styles.list}
          data={store.listStore.list}
          refreshing={store.listStore.isRefreshing}
          onEndReached={() => store.listStore.loadMore()}
          onRefresh={store.listStore.refresh}
          ListFooterComponent={
            <View style={{paddingBottom: ms(32) + inset}}>
              <ListLoadMoreIndicator visible={store.listStore.isLoadingMore} />
            </View>
          }
          renderItem={({item}) => {
            const isUserJoinedClub = isJoinedClub(item.clubRole)
            return (
              <JoinableClubListItem
                club={item}
                onClubPress={onClubPress}
                onOwnerPress={onClubOwnerPress}
                statusWithIcon={isUserJoinedClub}
                buttonComponent={
                  <JoinClubButton
                    isLoading={store.joinActionClubId === item.id}
                    clubRole={item.clubRole}
                    onToggleJoinPress={() => onToggleJoinPress(item)}
                  />
                }
              />
            )
          }}
        />
      </ContentLoadingView>
    </Vertical>
  )
}

export default observer(ClubListScreen)

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: ms(16),
    paddingTop: ms(16),
  },
  emptyContainer: {
    ...commonStyles.flexCenter,
    marginTop: '35%',
  },
  emptyTitle: {
    ...makeTextStyle(28, 36, 'bold'),
    textAlign: 'center',
  },
  buttonCreateClub: {
    borderRadius: ms(48),
  },
})

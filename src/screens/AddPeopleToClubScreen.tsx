import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useCallback, useEffect} from 'react'
import {useTranslation} from 'react-i18next'
import {StyleSheet, View} from 'react-native'

import {analytics} from '../Analytics'
import AppIcon from '../assets/AppIcon'
import {RevealView} from '../components/common/anim/RevealView'
import AppText from '../components/common/AppText'
import AppTouchableOpacity from '../components/common/AppTouchableOpacity'
import BaseFlatList from '../components/common/BaseFlatList'
import CancelableSearchBar from '../components/common/CancelableSearchBar'
import ContentLoadingView from '../components/common/ContentLoadingView'
import FollowerListItem from '../components/common/FollowerListItem'
import Horizontal from '../components/common/Horizontal'
import ListLoadMoreIndicator from '../components/common/ListLoadMoreIndicator'
import SecondaryButton from '../components/common/SecondaryButton'
import Spacer from '../components/common/Spacer'
import Vertical from '../components/common/Vertical'
import {HandleComponent} from '../components/screens/room/CommonBottomSheet'
import {Clipboard} from '../components/webSafeImports/webSafeImports'
import {ClubModel, UserModel} from '../models'
import {CreateClubStore} from '../stores/CreateClubStore'
import {commonStyles, makeTextStyle, useTheme} from '../theme/appTheme'
import {ms} from '../utils/layout.utils'
import {push, resetTo} from '../utils/navigation.utils'
import {useBottomSafeArea} from '../utils/safeArea.utils'
import {getClubLink, shareClubDialog} from '../utils/sms.utils'
import {toastHelper} from '../utils/ToastHelper'
import {useViewModel} from '../utils/useViewModel'

interface ScreenProps {
  club: ClubModel
  isClubCreation?: boolean
}

type ScreenRouteProp = RouteProp<{Screen: ScreenProps}, 'Screen'>

const AddPeopleToClubScreen: React.FC = () => {
  const {t} = useTranslation()
  const {colors} = useTheme()
  const navigation = useNavigation()
  const {params} = useRoute<ScreenRouteProp>()
  const isClubCreation = params?.isClubCreation ?? false

  const createClubStore = useViewModel(() => new CreateClubStore())

  const inset = useBottomSafeArea()

  const loadNetwork = useCallback(() => {
    createClubStore.getNetwork(params.club?.id)
  }, [createClubStore, params.club?.id])

  useEffect(() => {
    if (!params.club) return
    loadNetwork()
  }, [createClubStore, loadNetwork, params.club])

  const onDonePress = async () => {
    analytics.sendEvent('add_people_done_button_click')

    if (!isClubCreation) {
      if (!(await createClubStore.inviteAll(params.club?.id))) return

      return navigation.goBack()
    }

    navigation.dispatch(
      resetTo('ClubScreen', {
        club: params?.club,
        isModal: true,
        clubId: params?.club?.id,
        withCustomToolbar: true,
        isClubCreation,
      }),
    )
  }

  const CustomButton = useCallback(
    ({onPress, user}) => {
      const isInvited =
        user.alreadyInvitedToClub ||
        createClubStore.invitedList.includes(user.id)
      return !isInvited ? (
        <SecondaryButton
          onPress={onPress}
          style={[styles.button, {backgroundColor: colors.primaryClickable}]}
          title={t('invite')}
          isLoading={
            createClubStore.isLoadingButton &&
            createClubStore.userInviteInProgress === user.id
          }
          activityIndicatorColor={colors.indicatorColorInverse}
          textStyle={[styles.buttonText, {color: colors.textPrimary}]}
        />
      ) : (
        <SecondaryButton
          isEnabled={false}
          style={styles.button}
          title={t('phoneLabelInvited')}
          textStyle={[styles.buttonText, {color: colors.secondaryBodyText}]}
        />
      )
    },

    [
      colors.indicatorColorInverse,
      colors.primaryClickable,
      colors.secondaryBodyText,
      colors.textPrimary,
      createClubStore.invitedList,
      createClubStore.isLoadingButton,
      createClubStore.userInviteInProgress,
      t,
    ],
  )

  const onSendLink = () => {
    analytics.sendEvent('add_people_send_link_button_click')

    shareClubDialog(params?.club?.id, params?.club?.slug)
  }

  const onCopyLink = () => {
    analytics.sendEvent('add_people_copy_link_button_click')

    Clipboard.setString(getClubLink(params?.club?.id, params?.club?.slug))
    toastHelper.success('linkCopied', true)
  }

  const onUserInvite = useCallback(
    async (userId: string) => {
      analytics.sendEvent('invite_user_to_club_button_click')

      await createClubStore.inviteToClub(params?.club?.id, userId)
    },
    [createClubStore, params?.club?.id],
  )

  const onUserPress = useCallback(
    (item: UserModel) => {
      push(navigation, 'ProfileScreenModal', {
        userId: item.id,
        username: item.username,
      })
    },
    [navigation],
  )

  const renderItem = useCallback(
    ({item, index}) => (
      <FollowerListItem
        user={item}
        index={index}
        onStateChanged={() => {}}
        onSelect={() => onUserPress(item)}
        customButton={() => (
          <CustomButton user={item} onPress={() => onUserInvite(item.id)} />
        )}
      />
    ),
    [CustomButton, onUserInvite, onUserPress],
  )

  const ListHeader = () => {
    return (
      <RevealView
        isRevealed={!createClubStore.searchMode}
        animType={'fade'}
        style={[commonStyles.flexOne, styles.padding]}>
        <Horizontal
          style={[
            {backgroundColor: colors.floatingBackground},
            styles.inviteContainer,
          ]}>
          <AppIcon
            style={styles.icon}
            tint={colors.primaryClickable}
            type='icCopy'
          />
          <View>
            <AppText style={styles.inviteTitle}>
              {t('addPeopleToClubInviteTitle')}
            </AppText>
            <AppText style={styles.inviteText}>
              {t('addPeopleToClubInviteContent')}
            </AppText>
            <Horizontal style={styles.buttonContainer}>
              <AppTouchableOpacity
                onPress={onCopyLink}
                style={[
                  styles.button,
                  {backgroundColor: colors.secondaryClickable},
                ]}>
                <Horizontal style={styles.buttonContainer}>
                  <AppIcon
                    style={styles.copyIcon}
                    tint={colors.primaryClickable}
                    type='icCopyButton'
                  />
                  <AppText
                    style={[
                      {color: colors.primaryClickable},
                      styles.buttonText,
                    ]}>
                    {t('copy')}
                  </AppText>
                </Horizontal>
              </AppTouchableOpacity>
              <AppTouchableOpacity
                onPress={onSendLink}
                style={[
                  styles.button,
                  {backgroundColor: colors.primaryClickable},
                ]}>
                <AppText
                  style={[{color: colors.textPrimary}, styles.buttonText]}>
                  {t('sendLink')}
                </AppText>
              </AppTouchableOpacity>
            </Horizontal>
          </View>
        </Horizontal>
        <Horizontal>
          <AppText style={[styles.networkTitle, {color: colors.thirdBlack}]}>
            {t('yourNetwork').toUpperCase()}
          </AppText>
          {createClubStore.totalCount > 0 && !createClubStore.isLoading && (
            <AppText style={styles.networkCounter}>
              {createClubStore.totalCount}
            </AppText>
          )}
        </Horizontal>
      </RevealView>
    )
  }

  return (
    <ContentLoadingView
      loading={createClubStore.isLoading && !createClubStore.searchMode}
      error={createClubStore.error}
      onRetry={loadNetwork}>
      <HandleComponent />
      <View style={styles.wrapper}>
        <Horizontal style={styles.container}>
          <AppText style={styles.title}>{t('addPeopleToClubTitle')}</AppText>
          <AppTouchableOpacity style={styles.doneButtonContainer}>
            <AppText
              onPress={onDonePress}
              style={[styles.doneButton, {color: colors.primaryClickable}]}>
              {isClubCreation ? t('doneButton') : t('inviteAll')}
            </AppText>
          </AppTouchableOpacity>
        </Horizontal>
        <Spacer vertical={ms(24)} />
        <CancelableSearchBar
          searchMode={createClubStore.searchMode}
          placeholderText={t('searchPlaceholder')}
          placeholderTextActivated={t('searchPlaceholder')}
          isLoading={createClubStore.searchMode && createClubStore.isLoading}
          onChangeText={createClubStore.search}
          onSearchModeChanged={createClubStore.setSearchMode}
        />
        <RevealView
          isRevealed={!createClubStore.searchMode}
          animType={'fade'}
          style={[commonStyles.flexOne, styles.vertical]}>
          {createClubStore.totalCount === 0 && <ListHeader />}
          <Vertical style={commonStyles.flexOne}>
            <BaseFlatList<UserModel>
              ListHeaderComponent={ListHeader}
              ListFooterComponent={
                <View
                  style={{
                    paddingBottom: inset + ms(32),
                  }}>
                  <ListLoadMoreIndicator
                    visible={createClubStore.isLoadingMore}
                  />
                </View>
              }
              contentContainerStyle={{paddingBottom: inset}}
              data={createClubStore.network}
              renderItem={renderItem}
              onEndReached={createClubStore.fetchMore}
            />
          </Vertical>
        </RevealView>
      </View>
    </ContentLoadingView>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    ...commonStyles.flexOne,
    paddingTop: ms(28),
  },
  padding: {
    paddingHorizontal: ms(16),
  },
  vertical: {
    flexDirection: 'column',
  },
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'baseline',
    width: '100%',
  },
  title: {
    ...makeTextStyle(ms(18), ms(24), '600'),
  },
  doneButtonContainer: {
    position: 'absolute',
    right: 0,
  },
  icon: {
    marginRight: ms(16),
    alignSelf: 'flex-start',
    marginTop: ms(5),
  },
  copyIcon: {
    marginRight: ms(7.5),
  },
  doneButton: {
    ...makeTextStyle(ms(18), ms(24)),
    marginEnd: ms(16),
  },
  inviteContainer: {
    borderRadius: ms(8),
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: ms(16),
    paddingHorizontal: ms(26),
    marginBottom: ms(35),
    marginTop: ms(16),
  },
  inviteText: {
    ...makeTextStyle(ms(14), ms(21)),
    marginBottom: ms(12),
  },
  inviteTitle: {
    ...makeTextStyle(ms(18), ms(31.5), 'bold'),
  },
  buttonContainer: {
    alignItems: 'center',
  },
  button: {
    justifyContent: 'center',
    height: ms(28),
    borderRadius: ms(50),
    paddingHorizontal: ms(16),
    paddingVertical: ms(5),
    ...makeTextStyle(ms(12), ms(18)),
    marginRight: ms(12),
    minWidth: ms(65),
  },
  buttonText: {
    ...makeTextStyle(ms(12), ms(18), '600'),
  },
  networkTitle: {
    ...makeTextStyle(ms(11), ms(14.3), 'bold'),
    marginBottom: ms(23),
  },
  networkCounter: {
    ...makeTextStyle(ms(11), ms(14.3)),
    marginLeft: ms(8),
    opacity: 0.32,
  },
})

export default observer(AddPeopleToClubScreen)

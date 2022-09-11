import {RouteProp, useNavigation, useRoute} from '@react-navigation/native'
import {observer} from 'mobx-react'
import React, {useCallback, useEffect, useState} from 'react'
import {ActivityIndicator, StyleSheet, View} from 'react-native'

import {analytics} from '../Analytics'
import PushHandler from '../components/screens/mainFeed/PushHandler'
import {logJS} from '../components/screens/room/modules/Logger'
import WelcomeRequestSentView from '../components/screens/welcomeReserved/WelcomeRequestSentView'
import WelcomeReservedForYouView from '../components/screens/welcomeReserved/WelcomeReservedForYouView'
import {InitialLinkProp} from '../models'
import WaitingInviteStore from '../stores/WaitingInviteStore'
import {commonStyles, useTheme} from '../theme/appTheme'
import {ms} from '../utils/layout.utils'
import {resetStackToRegistrationJoinedByScreen} from '../utils/navigation.utils'
import {getClubIdFromUri} from '../utils/stringHelpers'
import {toastHelper} from '../utils/ToastHelper'
import {useViewModel} from '../utils/useViewModel'

type ScreenRouteProp = RouteProp<{Screen: InitialLinkProp}, 'Screen'>

const WaitingInviteScreen: React.FC = () => {
  const navigation = useNavigation()
  const {params} = useRoute<ScreenRouteProp>()
  const {colors} = useTheme()
  const [isJoinInProgress, setJoinInProgress] = useState(false)
  const store = useViewModel(() => new WaitingInviteStore())
  const isLoading = isJoinInProgress || store.isLoading

  const doJoinClub = useCallback(async () => {
    const joinResult = await store.requestJoinClub()
    if (!joinResult) return
    await store.updateStatus()
  }, [store])

  useEffect(() => {
    // auto-join specified club if not yet
    if (isJoinInProgress) return
    if (store.club && store.waitingStatus === 'waiting_list') {
      setJoinInProgress(true)
      doJoinClub().then(() => setJoinInProgress(false))
    }
  }, [doJoinClub, isJoinInProgress, store, store.isLoading])

  const proceedIfReady = useCallback((): string | undefined => {
    if (store.isLoading) {
      logJS('debug', 'WaitingInviteScreen', 'skip proceed while loading')
      return
    }
    switch (store.waitingStatus) {
      case 'invited':
        logJS('info', 'proceed to joined by because user is invited')
        navigation.dispatch(resetStackToRegistrationJoinedByScreen())
        return
      case 'invited_to_club':
        logJS(
          'info',
          'proceed to joined by because user is invited to club',
          store.club!.id,
        )
        navigation.dispatch(
          resetStackToRegistrationJoinedByScreen({
            initialLink: params?.initialLink,
          }),
        )
        return
      default:
        break
    }
    return 'waitingInviteNotInvitedYet'
  }, [
    navigation,
    params?.initialLink,
    store.club,
    store.isLoading,
    store.waitingStatus,
  ])

  useEffect(() => {
    const init = async () => {
      const clubId = getClubIdFromUri(params?.initialLink)
      await store.initialize(clubId)
      if (store.club) {
        analytics.sendEvent('waiting_invite_club_screen_open')
      } else {
        analytics.sendEvent('waiting_invite_screen_open')
      }
      if (
        store.waitingStatus === 'invited' ||
        store.waitingStatus === 'invited_to_club'
      ) {
        logJS('debug', 'WaitingInviteScreen', 'use already invited')
        proceedIfReady()
      }
    }
    init()
  }, [params?.initialLink, store])

  const onSignInPress = useCallback(async () => {
    await store.updateStatus()
    logJS(
      'debug',
      'WaitingInviteScreen',
      'updated status',
      store.waitingStatus,
      'proceed',
    )
    const error = proceedIfReady()
    if (error) toastHelper.error(error)
  }, [proceedIfReady, store])

  const onExploreClubsPress = useCallback(() => {
    navigation.navigate('ExploreClubsScreen', {canSkip: false})
  }, [navigation])

  return (
    <View style={[styles.base, commonStyles.wizardContainer]}>
      {isLoading && (
        <ActivityIndicator
          style={styles.loader}
          animating={true}
          size={'small'}
          color={colors.accentPrimary}
        />
      )}
      <PushHandler />
      {!isLoading && store.waitingStatus === 'waiting_list' && (
        <WelcomeReservedForYouView
          onSignInPress={onSignInPress}
          onExploreClubsPress={onExploreClubsPress}
        />
      )}
      {!isLoading && store.club && store.waitingStatus === 'waiting_club' && (
        <WelcomeRequestSentView
          onSignInPress={onSignInPress}
          onExploreClubsPress={onExploreClubsPress}
          club={store.club}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: ms(15),
  },
  loader: {
    position: 'absolute',
    paddingHorizontal: ms(8),
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
})

export default observer(WaitingInviteScreen)

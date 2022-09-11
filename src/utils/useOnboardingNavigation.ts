import {useNavigation} from '@react-navigation/native'
import {useCallback, useEffect, useRef} from 'react'

import {analytics} from '../Analytics'
import {api} from '../api/api'
import {sendAuthorized} from '../appEventEmitter'
import {logJS} from '../components/screens/room/modules/Logger'
import {alert} from '../components/webSafeImports/webSafeImports'
import {CurrentUser, InitialLinkProp} from '../models'
import {storage} from '../storage'
import WaitingInviteStore from '../stores/WaitingInviteStore'
import {resetTo} from './navigation.utils'
import {
  hasNotificationPermissions,
  requestNotificationToken,
} from './permissions.utils'
import {makeUserVerified, putNewUserToWaitlist} from './profile.utils'
import {getClubIdFromUri} from './stringHelpers'
import {toastHelper} from './ToastHelper'
import {useViewModel} from './useViewModel'

type OnboardingNavigation = {
  finishOnboarding: () => Promise<void>
  finishSingIn: (user: CurrentUser, initialLink?: string) => Promise<void>
}

const finishSingIn = async (
  userData: CurrentUser,
  navigation: any,
  initialLink?: string,
) => {
  await storage.saveUser(userData)
  const user = storage.currentUser
  if (user) {
    await analytics.setUserId(user.id)
    await analytics.updateUserParams(['languageApp', user.language?.name])
  }
  const state = user?.state
  const isRegister = state !== 'verified'
  analytics.sendEvent('fetch_token_with_wallet_success', {isRegister})

  if (state !== 'verified' && getClubIdFromUri(initialLink)) {
    return navigation.navigate('FullNameScreen', {
      initialLink,
    })
  }

  logJS('info', 'EnterPhoneCodeScreen user state:', state)
  switch (state) {
    case 'invited':
    case 'not_invited':
      console.log('navigate to full name')
      navigation.navigate('FullNameScreen')
      break
    case 'waiting_list':
      navigation.dispatch(resetTo('WaitingInviteScreen'))
      break
    case 'verified':
      if (await hasNotificationPermissions()) return makeUserVerified()
      navigation.dispatch(
        resetTo('RequestPermissionNotificationsScreen', {
          initialLink,
        }),
      )
      break
  }
}

const useOnboardingNavigation = (
  params?: InitialLinkProp,
): OnboardingNavigation => {
  const navigation = useNavigation()
  const inviteStore = useViewModel(() => new WaitingInviteStore())
  const initPromise = useRef<Promise<void> | undefined>()

  useEffect(() => {
    if (!storage.isAuthorized) return
    initPromise.current = inviteStore.initialize(
      getClubIdFromUri(params?.initialLink),
    )
  }, [inviteStore, params?.initialLink])

  const finishOnboarding = useCallback(async () => {
    logJS('debug', 'finishOnboarding', 'requested')
    const response = await api.sendDevice(await requestNotificationToken())
    if (response.error) return toastHelper.error(response.error, false)
    if (storage.currentUser?.state === 'verified') {
      logJS('debug', 'finishOnboarding', 'already completed')
      await storage.setFinishedOnboarding()
      // user already onboarded
      return sendAuthorized()
    }
    if (initPromise.current) await initPromise.current
    if (!inviteStore.waitingStatus) {
      logJS('debug', 'finishOnboarding', 'update waiting status')
      await inviteStore.initialize(getClubIdFromUri(params?.initialLink))
    }
    if (!inviteStore.waitingStatus) {
      logJS('warning', 'finishOnboarding', 'aborted: unknown waiting status')
      return
    }
    logJS('warning', 'finishOnboarding', 'put user to waitlist')
    if (!(await putNewUserToWaitlist())) {
      logJS(
        'warning',
        'finishOnboarding',
        'aborted: failed put user to waitlist',
      )
      return
    }

    const hasClubLink = getClubIdFromUri(params?.initialLink)
    logJS('warning', 'finishOnboarding', 'has club link?', hasClubLink)
    let navigationAction: any
    switch (inviteStore.waitingStatus) {
      case 'waiting_list':
      case 'waiting_club': {
        const next = hasClubLink ? 'WaitingInviteScreen' : 'ExploreClubsScreen'
        logJS('warning', 'finishOnboarding', 'reset to (waiting)', next)
        navigationAction = resetTo(next, {
          initialLink: params?.initialLink,
        })
        break
      }
      case 'invited_to_club':
      case 'invited': {
        const next = hasClubLink
          ? 'RegistrationJoinedByScreen'
          : 'ExploreClubsScreen'
        logJS('warning', 'finishOnboarding', 'reset to (invited)', next)
        navigationAction = resetTo(next, {
          initialLink: params?.initialLink,
        })
        break
      }
      default:
        break
    }
    if (!navigationAction) {
      return alert('Unknown user status', inviteStore.waitingStatus)
    }
    logJS('warning', 'finishOnboarding', 'complete')
    await storage.setFinishedOnboarding()
    navigation.dispatch(navigationAction)
  }, [inviteStore, navigation, params?.initialLink])

  const _finishSingIn = useCallback(
    (user: CurrentUser, initialLink?: string) => {
      return finishSingIn(user, navigation, initialLink)
    },
    [navigation],
  )

  return {finishOnboarding, finishSingIn: _finishSingIn}
}

export default useOnboardingNavigation

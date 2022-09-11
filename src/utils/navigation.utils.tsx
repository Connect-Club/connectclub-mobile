import {CommonActions, useNavigation} from '@react-navigation/native'
import React, {useLayoutEffect} from 'react'

import {hideLoading, showLoading} from '../appEventEmitter'
import {NavigationBackButton} from '../components/common/NavigationBackButton'
import {logJS} from '../components/screens/room/modules/Logger'
import {UserState} from '../models'
import {storage} from '../storage'

export type NavigationCallback = (
  type: 'push' | 'replace',
  screen: string,
  params?: any,
) => void

export const useNavigationCallback = (): NavigationCallback => {
  const navigation = useNavigation()

  return (type, screen, params) => {
    logJS(
      'debug',
      'navigation callback navigate to',
      screen,
      JSON.stringify(params),
    )
    switch (type) {
      case 'push':
        navigation.navigate(screen, params)
        break
      case 'replace':
        // @ts-ignore
        navigation.replace(screen, params)
        break
    }
  }
}

export const stackScreenConfigs: any = {
  // @ts-ignore
  headerLeft: ({onPress}) => {
    return <NavigationBackButton onPress={onPress} />
  },
}

export const useTitle = (title: string) => {
  const navigation = useNavigation()
  useLayoutEffect(() => {
    navigation.setOptions({
      title,
    })
  }, [title])
}

export const push = (navigation: any, screen: string, params?: any) => {
  navigation.push(screen, params)
}

export const resetTo = (screen: string, params?: any) => {
  return CommonActions.reset({
    index: 0,
    routes: [{name: screen, params}],
  })
}

export const resetStackToRegistrationJoinedByScreen = (params?: any) => {
  return CommonActions.reset({
    index: 0,
    routes: [{name: 'RegistrationJoinedByScreen', params}],
  })
}

export const popToTop = (navigation: any) => navigation.popToTop()

export const getInitialScreen = (state?: UserState) => {
  let initialScreen = 'WelcomeScreen'
  switch (state) {
    case 'invited':
      initialScreen = 'RegistrationJoinedByScreen'
      if (!storage.isFinishedOnboarding) {
        initialScreen = 'FullNameScreen'
      }
      break
    case 'not_invited':
      initialScreen = 'WelcomeScreen'
      break
    case 'waiting_list':
      initialScreen = 'WaitingInviteScreen'
      break
  } /* else if (state === 'invited' && storage.isSMSVerified) {
    initialScreen = 'RegistrationJoinedByScreen'
  }*/

  return initialScreen
}

export const runWithLoader = <T,>(action: () => T): T => {
  showLoading()
  try {
    return action()
  } finally {
    hideLoading()
  }
}

export const runWithLoaderAsync = async <T,>(
  action: () => Promise<T>,
): Promise<T> => {
  showLoading()
  try {
    return await action()
  } finally {
    hideLoading()
  }
}

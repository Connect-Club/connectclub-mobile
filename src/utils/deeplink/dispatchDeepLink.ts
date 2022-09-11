import {
  goToClub,
  goToRoom,
  hideUpcomingEventDialog,
  showEventDialog,
  showUserProfile,
} from '../../appEventEmitter'
import {logJS} from '../../components/screens/room/modules/Logger'
import {presentIntercom} from '../../components/webSafeImports/webSafeImports'
import {InitialDeeplink, InitialLinkProp} from '../../models'
import {storage} from '../../storage'
import DeepLinkNavigationStore from '../../stores/DeepLinkNavigationStore'
import {
  getClubIdFromUri,
  getEventIdFromUri,
  getRoomParamsFromUri,
  getUsernameFromUri,
} from '../stringHelpers'

type EffectName = 'navigate' | 'handled' | 'unhandled' | 'postponed'
type NavigationArgs = {destination: string; params?: any}
type Effect = {
  name: EffectName
  args?: any
}
type NavigateEffect = Effect & {
  args: NavigationArgs
}
type HandlerParams = {
  url: string
  params?: InitialDeeplink
  isMainNavigationReady: boolean
  isWelcomeNavigationReady: boolean
}
type Handler = (params: HandlerParams) => Promise<Array<Effect | EffectName>>

const navigateEffect = (destination: string, params?: any): NavigateEffect => {
  return {
    name: 'navigate',
    args: {
      destination,
      params,
    },
  }
}

const handleClubLink = async (
  p: HandlerParams,
): Promise<Array<Effect | EffectName>> => {
  const clubId = getClubIdFromUri(p.url)
  if (!clubId) return ['unhandled']
  logJS('debug', 'handleDeepLink', 'handle club link')
  const status = storage.currentUser?.state
  const params: InitialLinkProp = {initialLink: p.url}
  switch (status) {
    case 'invited':
    case 'verified':
      const eventId = getEventIdFromUri(p.url)
      if (eventId) {
        logJS(
          'debug',
          'handleDeepLink',
          'handleClubLink: not handling club event link',
        )
        return ['unhandled']
      }
      if (p.isMainNavigationReady) {
        hideUpcomingEventDialog()
        goToClub({clubId})
        return ['handled']
      }
      return ['postponed']
    case 'waiting_list':
      logJS(
        'debug',
        'handleDeepLink',
        'navigate to waitlist with:',
        JSON.stringify(params),
      )
      return [navigateEffect('WaitingInviteScreen', params), 'postponed']
  }
  if (!p.isWelcomeNavigationReady) {
    logJS('debug', 'handleDeepLink', 'welcome not ready to navigate')
    return ['postponed']
  }
  logJS(
    'debug',
    'handleDeepLink',
    'navigate to welcome with:',
    JSON.stringify(params),
  )
  return [navigateEffect('WelcomeScreen', params), 'postponed']
}

const handleProfileLink = async (
  p: HandlerParams,
): Promise<Array<Effect | EffectName>> => {
  const username = getUsernameFromUri(p.url)
  if (!username) return ['unhandled']
  if (!p.isMainNavigationReady) return ['postponed']
  logJS('debug', 'handleDeepLink', 'handle profile link to', username)
  hideUpcomingEventDialog()
  await showUserProfile(username)
  return ['handled']
}

const handleEventLink = async (
  p: HandlerParams,
): Promise<Array<Effect | EffectName>> => {
  const eventId = getEventIdFromUri(p.url)
  if (!eventId) return ['unhandled']
  if (!p.isMainNavigationReady) return ['postponed']
  logJS('debug', 'handleDeepLink', 'handle event link to', eventId)
  await showEventDialog(eventId)
  return ['handled']
}

const handleSupportLink = async (
  p: HandlerParams,
): Promise<Array<Effect | EffectName>> => {
  if (!p.url.startsWith('cnnctvp://support')) return ['unhandled']
  if (!p.isMainNavigationReady) return ['postponed']
  presentIntercom()
  return ['handled']
}

const handleRoomLink = async (
  p: HandlerParams,
): Promise<Array<Effect | EffectName>> => {
  logJS('debug', 'handleDeepLink', 'try handle room link')
  const params = getRoomParamsFromUri(p.url)
  if (!params?.roomParams?.room || !params?.roomParams?.room) {
    logJS('debug', 'handleDeepLink', 'not room link', JSON.stringify(params))
    return ['unhandled']
  }
  if (!p.isMainNavigationReady) return ['postponed']
  logJS(
    'debug',
    'handleDeepLink',
    'handle room link to',
    JSON.stringify(params),
  )
  hideUpcomingEventDialog()
  await goToRoom(params.roomParams)
  return ['handled']
}

const handlers: Array<Handler> = [
  handleRoomLink,
  handleProfileLink,
  handleClubLink,
  handleEventLink,
  handleSupportLink,
]

const dispatch = async (
  store: DeepLinkNavigationStore,
): Promise<Array<Effect> | void> => {
  const state = store.state
  logJS('debug', 'handleDeepLink', 'dispatch()')
  if (!state.url) {
    logJS('debug', 'handleDeepLink', 'dispatch: no url stored')
    return
  }
  const params: HandlerParams = {
    isMainNavigationReady: state.isMainNavigationReady,
    isWelcomeNavigationReady: state.isWelcomeNavigationReady,
    params: state.params,
    url: state.url,
  }
  for (const handler of handlers) {
    const result = await handler(params)
    if (result.indexOf('unhandled') > -1) continue
    return result.map((e) => {
      if (typeof e === 'string') {
        return {name: e}
      } else {
        return e
      }
    })
  }
}

export const dispatchDeepLink = async (store: DeepLinkNavigationStore) => {
  logJS(
    'debug',
    'handleDeepLink',
    'handle deep link (internal):',
    JSON.stringify(store.state),
  )
  if (!store.isNavigationRefSetUp) {
    logJS(
      'debug',
      'handleDeepLink',
      'postponed handle deeplink because navigation is not ready',
      store.url,
    )
    store.setPostponed(true)
    return
  }
  logJS('debug', 'handleDeepLink', 'dispatch')
  const result = await dispatch(store)
  if (!result) {
    logJS('debug', 'handleDeepLink', 'deep link not handled', store.url)
    return
  }
  logJS('debug', 'handleDeepLink', 'handle results')
  if (Array.isArray(result)) {
    result.forEach((item) => handleDispatchResult(store, item))
  } else {
    handleDispatchResult(store, result)
  }
  logJS('debug', 'handleDeepLink', 'exit dispatch')
}

const handleDispatchResult = (
  store: DeepLinkNavigationStore,
  result: Effect,
) => {
  logJS(
    'debug',
    'handleDeepLink',
    'handle dispatch result',
    JSON.stringify(result),
  )
  switch (result.name) {
    case 'postponed':
      store.setPostponed(true)
      break
    case 'navigate':
      hideUpcomingEventDialog()
      store.setPostponed(false)
      const navArgs = result.args as NavigationArgs
      logJS('debug', 'handleDeepLink', 'navigate', JSON.stringify(navArgs))
      store.navigation?.navigate(navArgs.destination, navArgs.params)
      break
    case 'handled':
    case 'unhandled':
      store.setPostponed(false)
      break
  }
}

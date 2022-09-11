import {NavigationContainerRef} from '@react-navigation/native'
import {RefObject} from 'react'

import {InitialDeeplink} from '../models'

type State = {
  url?: string
  params?: InitialDeeplink
  isPostponed: boolean
  isMainNavigationReady: boolean
  isWelcomeNavigationReady: boolean
  navigationRef?: RefObject<NavigationContainerRef | undefined>
}

const initialState = {
  isWelcomeNavigationReady: false,
  isMainNavigationReady: false,
  isPostponed: false,
}

class DeepLinkNavigationStore {
  private _state: State = initialState

  get state(): State {
    return {...this._state}
  }

  get isNavigationRefSetUp(): boolean {
    return !!this._state.navigationRef
  }

  get isPostponed(): boolean {
    return this._state.isPostponed
  }

  get navigation() {
    return this._state.navigationRef?.current
  }

  get url(): string | undefined {
    return this._state.url
  }

  get isMainNavigationReady(): boolean {
    return this._state.isMainNavigationReady
  }

  get isWelcomeNavigationReady(): boolean {
    return this._state.isWelcomeNavigationReady
  }

  setUrl(url?: string, params?: InitialDeeplink) {
    this._state = {...this._state, url, params}
  }

  setMainNavigationReady(isReady: boolean) {
    this._state = {...this._state, isMainNavigationReady: isReady}
  }

  setWelcomeNavigationReady(isReady: boolean) {
    this._state = {...this._state, isWelcomeNavigationReady: isReady}
  }

  reset() {
    this._state = initialState
  }

  setNavigationRef(
    navigationRef: RefObject<NavigationContainerRef | undefined>,
  ) {
    this._state = {...this._state, navigationRef}
  }

  setPostponed(isPostponed: boolean) {
    this._state = {...this._state, isPostponed}
  }
}

export default DeepLinkNavigationStore

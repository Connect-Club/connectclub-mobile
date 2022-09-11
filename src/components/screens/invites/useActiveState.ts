import {useEffect} from 'react'
import {AppState, AppStateStatus} from 'react-native'

export const useActiveState = (callback: () => void) => {
  useEffect(() => {
    const onAppStateChanged = (state: AppStateStatus) => {
      if (state === 'active') callback()
    }
    AppState.addEventListener('change', onAppStateChanged)
    return () => {
      AppState.removeEventListener('change', onAppStateChanged)
    }
  }, [callback])
}

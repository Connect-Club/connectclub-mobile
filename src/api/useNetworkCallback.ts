import {DependencyList, useCallback, useEffect, useState} from 'react'

import {api} from './api'
import {NetworkStateListener} from './httpClient'

export const useNetworkCallback = (
  onChange: NetworkStateListener,
  deps: DependencyList,
) => {
  const onNetworkChanged = useCallback(onChange, deps)
  useEffect(() => {
    api.addNetworkStateListener(onNetworkChanged)
    return () => {
      api.removeNetworkStateListener(onNetworkChanged)
    }
  }, [onNetworkChanged])
}

export const useNetworkState = () => {
  const [networkState, setNetworkState] = useState(api.isConnectedToNetwork())
  useEffect(() => {
    api.addNetworkStateListener(setNetworkState)
    return () => {
      api.removeNetworkStateListener(setNetworkState)
    }
  }, [])
  return networkState
}

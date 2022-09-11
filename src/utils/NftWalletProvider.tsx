import {Result} from '@badrap/result'
import {useWalletConnect} from '@walletconnect/react-native-dapp'
import React, {
  createContext,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import {api} from '../api/api'
import {appEventEmitter} from '../appEventEmitter'
import {logJS} from '../components/screens/room/modules/Logger'
import {storage} from '../storage'
import {toastHelper} from './ToastHelper'

type AuthData = {
  message: string
  address: string
  signature: string
}

type NftWalletController = {
  connect: () => Promise<void>
  disconnect: () => Promise<void>
  bind: () => Promise<void>
  unbind: () => Promise<void>
  getAuthData: () => Promise<Result<AuthData, Error>>
  isLoading: boolean
  isConnected: boolean
  isBound: boolean
}

type RetType = NftWalletController & {ref: RefObject<NftWalletController>}

const WalletContext = createContext<RetType | null>(null)

export const useNftWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw 'useNftWallet() cannot be used outside of context'
  }
  return context
}

export const useNftWalletRef = () => {
  return useNftWallet().ref
}

async function getAuthData(connector: ReturnType<typeof useWalletConnect>) {
  logJS('debug', 'NftWalletProvider', 'get auth message requested')
  if (!connector.connected) {
    logJS(
      'debug',
      'NftWalletProvider',
      'unable to get auth message: not connected',
    )
    return Result.err({name: 'Error', message: 'not connected'})
  }
  const response = await api.getAuthSignatureWithNonce()
  if (response.error || !response.data) {
    logJS(
      'debug',
      'NftWalletProvider',
      'unable to get auth message: auth-signature request failed',
      response.error,
    )
    return Result.err({
      name: 'Error',
      message: 'auth-signature request failed',
    })
  }
  const msgText = response.data.message
  logJS('debug', 'NftWalletProvider', 'sign message', msgText)
  try {
    const signature = await connector.signPersonalMessage([
      new global.Buffer(msgText, 'utf8'),
      connector.accounts[0],
    ])
    logJS(
      'warning',
      'NftWalletProvider',
      'got signed message',
      JSON.stringify(signature),
    )
    return Result.ok({
      message: msgText,
      address: connector.accounts[0],
      signature,
    })
  } catch (e) {
    logJS('warning', 'NftWalletProvider', 'error signing data', e)
    return Result.err({
      name: 'Error',
      message: String(e),
    })
  }
}

async function bindWallet(
  connector: ReturnType<typeof useWalletConnect>,
): Promise<boolean> {
  logJS('debug', 'NftWalletProvider', 'connect requested, get sig data')
  const response = await api.getWalletSignatureWithNonce()
  if (response.error || !response.data) {
    logJS('debug', 'NftWalletProvider', 'error response')
    return false
  }
  logJS('debug', 'NftWalletProvider', 'got sig response')
  const msgText = response.data.message + response.data.nonce
  const msgParams = [
    new global.Buffer(msgText, 'utf8'), // Required
    connector.accounts[0], // Required
  ]
  logJS('debug', 'NftWalletProvider', 'sign personal message')
  try {
    const msg = await connector.signPersonalMessage(msgParams)
    logJS('debug', 'NftWalletProvider', 'sign successful, set wallet')
    const setWalletResponse = await api.setWalletWithSignatureAddress(
      msgText,
      connector.accounts[0],
      msg,
    )
    if (setWalletResponse.error) {
      logJS(
        'debug',
        'NftWalletProvider',
        'failed to set wallet to backend',
        setWalletResponse.error,
      )
      return false
    }
    await storage.updateWallet(connector.accounts[0])
    logJS('debug', 'NftWalletProvider', 'set wallet successful')
    return true
  } catch (e) {
    logJS('debug', 'NftWalletProvider', 'error signing message', e)
    await storage.updateWallet(null)
  }
  return false
}

export const NftWalletProvider: React.FC = ({children}) => {
  const state = useRef<NftWalletController | null>(null)
  const [isLoading, setLoading] = useState(false)
  const [bound, setBound] = useState(() => !!storage.currentUser?.wallet)
  const connector = useWalletConnect()
  const isConnecting = useRef(false)

  const _reset = useCallback(async () => {
    logJS('debug', 'NftWalletProvider', 'requested to reset wallet connection')
    if (connector.connected) {
      logJS('debug', 'NftWalletProvider', 'disconnect')
      await connector.killSession()
      await storage.updateWallet(null)
      setBound(false)
      return
    }
    logJS('debug', 'NftWalletProvider', 'already disconnected')
  }, [connector])

  const _getAuthData = useCallback(async (): Promise<
    Result<AuthData, Error>
  > => {
    try {
      setLoading(true)
      return await getAuthData(connector)
    } finally {
      setLoading(false)
    }
  }, [connector])

  const _connect = useCallback(async () => {
    logJS('debug', 'NftWalletProvider', 'connect requested')
    if (isConnecting.current) {
      logJS('debug', 'NftWalletProvider', 'already connecting')
      return
    }
    if (connector.connected) {
      logJS('debug', 'NftWalletProvider', 'already connected')
      return
    }
    logJS('debug', 'NftWalletProvider', 'do connect')
    isConnecting.current = true
    try {
      await connector.connect()
    } catch (err) {
      toastHelper.error('somethingWentWrong')
      logJS(
        'warning',
        'NftWalletProvider',
        'unable to connect',
        JSON.stringify(err),
      )
    } finally {
      isConnecting.current = false
    }
  }, [connector])

  const _disconnect = useCallback(async () => {
    logJS('debug', 'NftWalletProvider', 'disconnect requested')
    if (!connector.connected) {
      logJS('debug', 'NftWalletProvider', 'already disconnected')
      return
    }
    await connector.killSession()
  }, [connector])

  const _bindWallet = useCallback(async () => {
    if (!connector.connected) {
      logJS('debug', 'NftWalletProvider', 'unable to bind: not connected')
      return
    }
    setLoading(true)
    if (await bindWallet(connector)) {
      setBound(true)
      toastHelper.success('successfullyConnectWalletToast', true)
    } else {
      setBound(false)
      toastHelper.error('errorConnectWalletToast', true)
    }
    setLoading(false)
  }, [connector])

  const _unbindWallet = useCallback(async () => {
    await api.deleteWallet()
    await storage.updateWallet(null)
    setBound(false)
  }, [])

  const onUnAuthorized = useCallback(() => {
    logJS('debug', 'NftWalletProvider', 'handle onUnAuthorized')
    _reset()
  }, [_reset])

  const onAuthorized = useCallback(() => {
    logJS('debug', 'NftWalletProvider', 'handle onAuthorized')
    const hasWallet = !!storage.currentUser?.wallet
    setBound(hasWallet)
  }, [])

  useEffect(() => {
    return appEventEmitter.on('onUnAuthorized', onUnAuthorized)
  }, [onUnAuthorized])

  useEffect(() => {
    return appEventEmitter.on('onAuthorized', onAuthorized)
  }, [onAuthorized])

  const current = {
    isLoading,
    getAuthData: _getAuthData,
    connect: _connect,
    disconnect: _disconnect,
    bind: _bindWallet,
    unbind: _unbindWallet,
    isConnected: connector.connected,
    isBound: bound,
    ref: state,
  }
  state.current = current

  return (
    <WalletContext.Provider value={current}>{children}</WalletContext.Provider>
  )
}

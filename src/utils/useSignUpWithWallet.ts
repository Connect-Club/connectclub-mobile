import {analytics} from '../Analytics'
import {api} from '../api/api'
import {logJS} from '../components/screens/room/modules/Logger'
import {useNftWalletRef} from './NftWalletProvider'
import {getClubIdFromUri, getInviteCodeFromUri} from './stringHelpers'
import {toastHelper} from './ToastHelper'
import {useDeepLinkNavigation} from './useDeepLinkNaivgation'
import useOnboardingNavigation from './useOnboardingNavigation'

export function useSignUpWithWallet(initialLink?: string) {
  const deepLinkNavigation = useDeepLinkNavigation()
  const wallet = useNftWalletRef()
  const {finishSingIn} = useOnboardingNavigation()
  logJS('debug', 'useSignUpWithWallet', 'link:', initialLink)

  return async () => {
    logJS('debug', 'useSignUpWithWallet', 'connect wallet')
    await wallet.current!.connect()
    if (!wallet.current!.isConnected) {
      logJS('debug', 'useSignUpWithWallet', 'wallet is not connected')
      return
    }
    logJS('debug', 'useSignUpWithWallet', 'get signed auth data')
    const result = await wallet.current!.getAuthData()
    if (result.isErr) {
      logJS('debug', 'useSignUpWithWallet', 'got error', result.error)
      toastHelper.error('somethingWentWrong')
      return
    }
    logJS('debug', 'useSignUpWithWallet', 'get token with signed auth data')
    const data = result.unwrap()
    const currentLink = deepLinkNavigation.getCurrentUrl()
    const clubId = getClubIdFromUri(currentLink ?? initialLink)
    const inviteCode = getInviteCodeFromUri(currentLink ?? initialLink)
    const response = await api.fetchTokenWithWallet(
      data.message,
      data.address,
      data.signature,
      clubId,
      inviteCode,
      analytics.utmLabels,
    )
    if (response.error) {
      logJS('debug', 'useSignUpWithWallet', 'error', response.error)
      analytics.sendEvent('fetch_token_with_wallet_fail', {
        error: response.error,
      })
      toastHelper.error(response.error)
      return
    }
    logJS('debug', 'useSignUpWithWallet', 'successfully signed in with wallet')
    await finishSingIn(response.data, currentLink)
  }
}

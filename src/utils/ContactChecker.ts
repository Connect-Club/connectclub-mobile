import {analytics} from '../Analytics'
import {api} from '../api/api'
import {hideLoading, showLoading} from '../appEventEmitter'
import {logJS} from '../components/screens/room/modules/Logger'
import {
  contactsUtils,
  openSettings,
} from '../components/webSafeImports/webSafeImports'
import {Translation, UserModel} from '../models'
import {storage} from '../storage'
import {alertOpenAppSettingsAsk} from './alerts'
import {NavigationCallback} from './navigation.utils'
import {makeUserVerified} from './profile.utils'
import {toastHelper} from './ToastHelper'

export class ContactChecker {
  constructor(
    private onNavigate: NavigationCallback,
    private onPopupVisibilityChange?: (isVisible: boolean) => void,
  ) {}

  isNeedToShowRequestScreen = async (t: Translation): Promise<boolean> => {
    const isGranted = await contactsUtils.checkContactsPermissions()
    if (isGranted) {
      await this.fetchContacts(t)
      return false
    } else {
      return true
    }
  }

  fetchContacts = async (t: Translation) => {
    this.onPopupVisibilityChange?.(false)
    analytics.sendEvent('contacts_access_open')
    const isAlreadyGranted = contactsUtils.checkContactsPermissions()
    if (!isAlreadyGranted) {
      const dontAskPermission = await storage.isDontAskPermissionDidSelected()
      if (dontAskPermission) {
        const goToSettings = await alertOpenAppSettingsAsk(t)
        if (goToSettings) {
          setTimeout(() => {
            this.onPopupVisibilityChange?.(true)
          }, 500)
          return openSettings()
        }
      }
    }
    const status = await contactsUtils.requestContactsPermissions()
    if (status === 'authorized') {
      analytics.sendEvent('contacts_access_ok')
      showLoading()
      const cts = await contactsUtils.fetchContactsFromPhone(false)
      const uploadResponse = await api.uploadContacts(cts)
      if (uploadResponse.error) {
        hideLoading()
        analytics.sendEvent('contacts_access_fail', {
          error: uploadResponse.error,
        })
        return toastHelper.error(uploadResponse.error)
      }
      const recommendations = await api.fetchContactRecommendations()
      if (recommendations.error) {
        hideLoading()
        analytics.sendEvent('contacts_access_fail', {
          error: recommendations.error,
        })
        return toastHelper.error(recommendations.error)
      }
      hideLoading()
      analytics.sendEvent('contacts_access_success')
      if (!recommendations.data || recommendations.data.items.length === 0) {
        logJS('debug', 'no contact recommendations, complete registration now')
        return await makeUserVerified()
      }
      return this.onNavigate('replace', 'MatchedContactsScreen', {
        recommendations: recommendations.data.items,
      })
    } else {
      analytics.sendEvent('contacts_access_cancel')
      showLoading()
      let recommendations = await api.fetchContactRecommendations()
      hideLoading()
      let items: Array<UserModel> | undefined = recommendations.data?.items
      if ((!items || items?.length === 0) && storage.currentUser?.joinedBy) {
        items = [storage.currentUser?.joinedBy]
      }
      setTimeout(() => {
        this.onPopupVisibilityChange?.(true)
      }, 500)
      return this.onNavigate('replace', 'MatchedContactsScreen', {
        recommendations: items,
      })
    }
  }
}

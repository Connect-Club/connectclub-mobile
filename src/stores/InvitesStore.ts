import {
  action,
  computed,
  makeAutoObservable,
  observable,
  runInAction,
} from 'mobx'
import {createContext} from 'react'
import {Platform} from 'react-native'

import {api} from '../api/api'
import {Paginated, RestResponse} from '../api/httpClient'
import {hideLoading, showLoading} from '../appEventEmitter'
import {logJS} from '../components/screens/room/modules/Logger'
import {contactsUtils} from '../components/webSafeImports/webSafeImports'
import {InviteContactModel, Unknown} from '../models'
import {storage} from '../storage'
import {compactMap} from '../utils/array.utils'
import Backoff from '../utils/backoff.utils'
import {openInviteSms} from '../utils/sms.utils'
import {toastHelper} from '../utils/ToastHelper'
import {MyCountersStore} from './MyCountersStore'

const filterPending = (
  items: Array<InviteContactModel>,
  granted: boolean,
): Array<InviteContactModel> => {
  return compactMap(items, (item) => {
    if (!granted && item.status === 'unknown') return item
    if (granted && item.status !== 'pending') return item
    return null
  })
}

class RemoteInvitesStore {
  private search: string | null = null
  private loadBackoff: Backoff<RestResponse<Paginated<InviteContactModel>>>
  waitingForLoadMore = false
  grantedPermission = false
  loadMore = false
  load = false
  isSearching = false
  lastValue: string | Unknown
  reachedEnd = false

  @observable
  inviteContacts: Array<InviteContactModel> = []

  constructor() {
    makeAutoObservable(this)
    this.loadBackoff = new Backoff()
  }

  @action
  refreshWithSearch = async () => {
    if (this.load) return
    this.waitingForLoadMore = false
    this.isSearching = false
    this.load = true
    try {
      const response = await this.loadBackoff.run(
        () =>
          api.getInviteContactsList(null, null, this.search).then((r) => {
            if (r.code === 423 && r.error) throw r.error
            return r
          }),
        10,
        500,
      )
      runInAction(() => {
        if (!this.load) return
        if (response.error) {
          this.load = false
          return toastHelper.error(response.error)
        }
        this.inviteContacts = filterPending(
          response.data!.items,
          this.grantedPermission,
        )
        this.lastValue = response.data!.lastValue
        this.reachedEnd = !this.lastValue
        this.load = false
      })
    } catch (e) {
      logJS('warning', 'InvitesStore refreshWithSearch:', e)
    } finally {
      hideLoading()
    }
  }

  @action
  searchByQuery = async (query: string) => {
    if (this.isSearching) return
    this.load = false
    this.waitingForLoadMore = false
    this.search = query
    this.isSearching = true
    try {
      const response = await this.loadBackoff.run(
        () =>
          api.getInviteContactsList(null, null, this.search).then((r) => {
            if (r.code === 423 && r.error) throw r.error
            return r
          }),
        10,
        500,
      )
      runInAction(() => {
        if (!this.isSearching) return
        if (response.error) {
          hideLoading()
          this.isSearching = false
          return toastHelper.error(response.error)
        }
        if (query.length > 0) {
          this.inviteContacts = response.data!.items
        } else {
          this.inviteContacts = filterPending(
            response.data!.items,
            this.grantedPermission,
          )
        }
        this.lastValue = response.data!.lastValue
        this.reachedEnd = !this.lastValue
        this.isSearching = false
      })
    } catch (e) {
      logJS('warning', 'searchByQuery:', e)
    } finally {
      hideLoading()
    }
  }

  loadMoreWithSearch = async (query: string | null) => {
    if (this.reachedEnd) return
    if (this.waitingForLoadMore) return
    this.load = false
    this.search = query
    this.waitingForLoadMore = true
    try {
      const response = await this.loadBackoff.run(
        () =>
          api
            .getInviteContactsList(this.lastValue, null, this.search)
            .then((r) => {
              if (r.code === 423 && r.error) throw r.error
              return r
            }),
        10,
        500,
      )
      runInAction(() => {
        if (!this.waitingForLoadMore) return
        if (response.error) {
          this.waitingForLoadMore = false
          return toastHelper.error(response.error)
        }
        this.inviteContacts = this.inviteContacts.concat(
          filterPending(response.data!.items, this.grantedPermission),
        )
        this.lastValue = response.data!.lastValue
        this.reachedEnd = !this.lastValue
        this.waitingForLoadMore = false
      })
    } catch (e) {
      logJS('warning', 'loadMoreWithSearch:', e)
    } finally {
      hideLoading()
    }
  }

  clear() {
    this.lastValue = null
    this.inviteContacts = []
    this.load = false
    this.waitingForLoadMore = false
    this.reachedEnd = false
    this.loadBackoff.clear()
    this.loadBackoff = new Backoff()
  }
}

class InvitesStore {
  private isInitialized = false
  private remoteInvitesStore = new RemoteInvitesStore()
  private isLoading = false
  skipNextPermissionRequest = false

  constructor() {
    makeAutoObservable(this)
  }

  @observable
  searchQuery: string | null = null

  @computed
  get isSearching(): boolean {
    return this.remoteInvitesStore.isSearching
  }

  @computed
  get isFetch(): boolean {
    return this.remoteInvitesStore.load
  }

  @computed
  get invites(): Array<InviteContactModel> {
    return this.remoteInvitesStore.inviteContacts
  }

  fetchAndUploadContacts = async () => {
    if (this.isLoading) return
    this.isLoading = true
    let granted: boolean
    if (this.skipNextPermissionRequest) {
      this.skipNextPermissionRequest = false
      granted = await contactsUtils.checkContactsPermissions()
    } else {
      this.skipNextPermissionRequest = true
      const dontAsk = await storage.isDontAskPermissionDidSelected()
      if (Platform.OS === 'android' && dontAsk) {
        granted = await contactsUtils.checkContactsPermissions()
      } else {
        granted =
          (await contactsUtils.requestContactsPermissions()) === 'authorized'
      }
    }
    this.remoteInvitesStore.grantedPermission = granted
    if (granted) {
      const contacts = await contactsUtils.fetchContactsFromPhone(true)
      await api.uploadContacts(contacts)
    }
    this.isLoading = false
  }

  @action
  async refresh() {
    if (!this.isInitialized || this.isLoading) return
    this.isLoading = true
    await this.fetchAndUploadContacts()
    await this.remoteInvitesStore.refreshWithSearch()
    this.isLoading = false
  }

  initialize = async (countersStore: MyCountersStore) => {
    showLoading()
    await this.fetchAndUploadContacts()
    await this.remoteInvitesStore.loadMoreWithSearch(null)
    countersStore.readHasInvites()
    hideLoading()
    this.isInitialized = true
  }

  loadMore = async () => {
    if (this.isLoading) return
    this.isLoading = true
    await this.remoteInvitesStore.loadMoreWithSearch(this.searchQuery)
    this.isLoading = false
  }

  @action
  invite = async (phone: string, skipSmsSend?: boolean) => {
    showLoading()
    const response = await api.createInvite(phone)
    hideLoading()
    if (response.error) return toastHelper.error(response.error)
    const contacts = this.remoteInvitesStore.inviteContacts
    const inviteIndex = contacts.findIndex((i) => i.phones.includes(phone))!
    const invite = {...contacts[inviteIndex]}

    runInAction(() => {
      contacts.splice(inviteIndex, 1)
      if (skipSmsSend !== true) openInviteSms(phone, invite.displayName)
    })
  }

  clear = () => {
    this.isLoading = false
    this.remoteInvitesStore.clear()
    this.skipNextPermissionRequest = false
  }

  @action
  search = async (query: string | null) => {
    this.searchQuery = query
    if (query == null) return
    await this.remoteInvitesStore.searchByQuery(query)
  }
}

export default createContext(new InvitesStore())

import {
  action,
  computed,
  makeAutoObservable,
  observable,
  runInAction,
} from 'mobx'

import {api} from '../api/api'
import {UserModel} from '../models'
import {FriendsStore} from './FriendsStore'

export interface InviteFriendUserModel {
  readonly user: UserModel
  isInvited: boolean
}

export class PingFriendsStore {
  private friendsStore
  private searchFriendsStore

  constructor(private roomId: string) {
    this.friendsStore = new FriendsStore({forPingInVideoRoom: roomId})
    this.searchFriendsStore = new FriendsStore({forPingInVideoRoom: roomId})
    makeAutoObservable(this)
  }

  @observable
  invitedIds: Set<string> = new Set()

  @observable
  searchMode: boolean = false

  @observable
  searchQuery: string | null = null

  @computed
  get list(): Array<InviteFriendUserModel> {
    return (
      this.searchMode ? this.searchFriendsStore : this.friendsStore
    ).list.map((user) => mapToInviteFriend(user, this.invitedIds))
  }

  @computed
  get isFirstLoading(): boolean {
    return this.friendsStore.isFirstLoading ?? false
  }

  @computed
  get isInProgress(): boolean {
    return this.friendsStore.isInProgress
  }

  @computed
  get isSearchStoreInRefreshing(): boolean {
    return this.searchFriendsStore.isRefreshing
  }

  @action
  setSearchMode = (enabled: boolean) => {
    this.searchMode = enabled
    if (!enabled) {
      this.searchQuery = null
      this.searchFriendsStore.query = null
      this.searchFriendsStore.clear()
    }
  }

  search = (query: string | null) => {
    runInAction(() => (this.searchQuery = query))
    this.searchFriendsStore.query = query
    if (!query) {
      this.searchFriendsStore.clear()
    } else {
      this.searchFriendsStore.refresh()
    }
  }

  fetch = async () => this.friendsStore.load()

  fetchMore = async () => this.friendsStore.loadMore()

  inviteFriend = async (userId: string) => {
    await api.inviteFriendToRoom(userId, this.roomId)
    runInAction(() => this.invitedIds.add(userId))
  }

  clear() {
    runInAction(() => (this.searchQuery = null))
    this.searchFriendsStore.query = null
    this.friendsStore.clear()
    this.searchFriendsStore.clear()
  }
}

const mapToInviteFriend = (
  user: UserModel,
  invitedIds: Set<string>,
): InviteFriendUserModel => ({
  isInvited: invitedIds.has(user.id),
  user,
})

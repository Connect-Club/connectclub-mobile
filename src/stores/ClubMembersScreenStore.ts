import {action, computed, makeAutoObservable, observable} from 'mobx'

import {Selection} from '../components/screens/clubmembers/ClubMembersTabs'
import {ClubModel} from '../models'
import {isAtLeastClubModerator} from '../utils/club.utils'
import {ClubMembersStore} from './ClubMembersStore'
import {ClubRequestsStore} from './ClubRequestsStore'
import ClubStore from './ClubStore'

export default class ClubMembersScreenStore {
  @computed
  get club(): ClubModel | undefined {
    return this.clubStore.club
  }

  @computed
  get error(): any {
    return (
      this.clubStore.error ||
      this.membersStore.error ||
      this.requestsStore.error
    )
  }

  @computed
  get isLoading(): boolean {
    return (
      this.clubStore.isLoading ||
      this.membersStore.isLoading ||
      this.requestsStore.isLoading
    )
  }

  @computed
  get searchMode(): boolean {
    return this.membersStore.isSearchMode
  }

  @observable
  currentTab: Selection = 'people'

  private query = ''

  constructor(
    private readonly clubStore: ClubStore,
    private readonly membersStore: ClubMembersStore,
    private readonly requestsStore: ClubRequestsStore,
    initialTab: Selection,
  ) {
    this.currentTab = initialTab
    makeAutoObservable(this)
  }

  @action
  setCurrentTab = (tab: Selection) => {
    this.currentTab = tab
    if (this.searchMode) {
      this.search(this.query)
    }
  }

  @action
  setSearchMode = (mode: boolean) => {
    this.membersStore.setSearchMode(mode)
    this.requestsStore.setSearchMode(mode)
  }

  @action
  search = (query: string) => {
    this.query = query.trim()
    if (!this.searchMode || this.query.length <= 2) return
    switch (this.currentTab) {
      case 'people':
        this.membersStore.search(this.query)
        break
      case 'requests':
        this.requestsStore.search(this.query)
        break
    }
  }

  initializeWithClubId = async (clubId: string) => {
    await this.clubStore.initializeWithClubId(clubId)
    if (this.clubStore.club) {
      this.membersStore.load()
      if (isAtLeastClubModerator(this.clubStore.club.clubRole)) {
        this.requestsStore.load()
      }
    }
  }

  initializeWithClub = (club: ClubModel) => {
    this.clubStore.initializeWithClub(club)
    this.membersStore.load()
    if (isAtLeastClubModerator(club.clubRole)) {
      this.requestsStore.load()
    }
  }
}

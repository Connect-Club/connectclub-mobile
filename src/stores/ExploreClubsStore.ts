import {
  action,
  computed,
  makeAutoObservable,
  observable,
  runInAction,
} from 'mobx'

import {api} from '../api/api'
import {ClubModel} from '../models'

export class ExploreClubsStore {
  constructor() {
    makeAutoObservable(this)
    this.clubs = []
  }

  @observable
  lastValue: number = 0

  @observable
  clubs: Array<ClubModel> = []

  @observable
  selected: {[key: string]: ClubModel} = {}

  @observable
  loading = false

  load = async (limit: number = 20) => {
    if (this.loading) return
    this.loading = true
    const clubs = await api.fetchSuggestedClubs(this.lastValue, limit)
    runInAction(() => {
      this.loading = false
      if (!clubs.data?.items) return
      this.clubs = clubs.data.items
      this.lastValue += limit
    })
  }

  fetchMore = async () => {
    const limit = 20
    if (this.loading) return
    this.loading = true
    console.log('update', this.lastValue)
    const clubs = await api.fetchSuggestedClubs(this.lastValue, limit)
    runInAction(() => {
      this.loading = false
      if (!clubs.data?.items) return
      console.log('new items', clubs.data.items.length)
      this.clubs.push(...clubs.data.items)
      this.lastValue += limit
    })
  }

  isSelected(club: ClubModel): boolean {
    return !!this.selected[club.id]
  }

  @computed
  canFetchMore(): boolean {
    return this.lastValue <= this.clubs.length
  }

  @computed
  hasSelection(): boolean {
    return Object.keys(this.selected).length > 0
  }

  @action
  onToggleSelect = (club: ClubModel) => {
    let newSelected: {[key: string]: ClubModel}
    if (this.selected[club.id]) {
      newSelected = {...this.selected}
      delete newSelected[club.id]
    } else {
      newSelected = {...this.selected, [club.id]: club}
    }
    runInAction(() => {
      this.selected = newSelected
    })
  }

  joinSelected = async () => {
    const clubs = Object.values(this.selected)
    for (let i = 0; i < clubs.length; i++) {
      const club = clubs[i]
      api.joinClub(club.id)
    }
    return
  }
}

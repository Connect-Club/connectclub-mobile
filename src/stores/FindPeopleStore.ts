import {action, makeAutoObservable, observable, runInAction} from 'mobx'

import {analytics} from '../Analytics'
import {api} from '../api/api'
import {Paginated} from '../api/httpClient'
import {Unknown, UserModel} from '../models'

export class FindPeopleStore {
  private lastValue: string | Unknown

  constructor(initial: Paginated<UserModel>) {
    makeAutoObservable(this)
    this.lastValue = initial.lastValue
    this.users = initial.items ?? []
    this.users.map((u) => (this.selected[u.id] = u))
    this.selectedCount = this.users.length
  }

  @observable
  users: Array<UserModel> = []

  @observable
  selected: {[key: string]: UserModel} = {}

  @observable
  selectedCount = 0

  @observable
  loading = false

  isSelected(user: UserModel): boolean {
    return !!this.selected[user.id]
  }

  @action
  fetchMore = async () => {
    if (!this.lastValue) return
    if (this.loading) return
    this.loading = true
    const response = await api.fetchSimilarRecommendations(this.lastValue)
    runInAction(() => {
      this.loading = false

      if (!response.data || response.error) {
        this.lastValue = null
      }

      if (response.data) {
        this.lastValue = response.data.lastValue
        this.users = response.data.items
      }
    })
  }

  @action
  onToggleSelect = (user: UserModel) => {
    let newSelected: {[key: string]: UserModel}
    if (this.selected[user.id]) {
      analytics.sendEvent('follow_people_remove')
      newSelected = {...this.selected}
      delete newSelected[user.id]
    } else {
      analytics.sendEvent('follow_people_select')
      newSelected = {...this.selected, [user.id]: user}
    }
    runInAction(() => {
      this.selectedCount = Object.keys(newSelected).length
      this.selected = newSelected
    })
  }

  @action
  resetSelection = () => {
    this.selected = {}
    this.selectedCount = 0
  }

  @action
  selectAll = () => {
    this.users.map((u) => (this.selected[u.id] = u))
    this.selectedCount = this.users.length
  }

  @action
  sendFollowPeople = async () => {
    if (this.selectedCount === 0) return
    await api.follow(Object.keys(this.selected))
  }
}

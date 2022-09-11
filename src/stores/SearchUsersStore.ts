import {api} from '../api/api'
import {UserModel} from '../models'
import BaseListStore, {SimpleListFetcher} from './BaseListStore'

class SearchUsersStore extends BaseListStore<UserModel> {
  query: string | null = null

  constructor(quiet: boolean = false) {
    super(
      new SimpleListFetcher(
        async () => {
          const q = this.query
          const response = await api.fetchUsers({
            search: q,
          })
          return this.query === q ? response : 'cancelled'
        },
        async (lastValue: string) => {
          const q = this.query
          const response = api.fetchUsers({
            search: q,
            lastValue,
          })
          return this.query === q ? response : 'cancelled'
        },
        quiet,
      ),
      true,
    )
  }

  clear() {
    super.clear()
  }
}

export default SearchUsersStore

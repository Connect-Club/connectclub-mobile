import {api} from '../api/api'
import {UserModel} from '../models'
import BaseListStore, {SimpleListFetcher} from './BaseListStore'

type Params = {
  forPingInVideoRoom?: string
  forInviteClub?: string
}

export class FriendsStore extends BaseListStore<UserModel> {
  query: string | null = null

  constructor(private params?: Params, quiet: boolean = false) {
    super(
      new SimpleListFetcher(
        () =>
          api.fetchFriends({
            ...this.params,
            search: this.query,
          }),
        (lastValue) =>
          api.fetchFriends({
            ...this.params,
            search: this.query,
            lastValue,
          }),
        quiet,
      ),
    )
  }

  updateParams = (params: Params) => {
    this.params = params
  }
}

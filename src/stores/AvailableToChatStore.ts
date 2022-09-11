import {api} from '../api/api'
import {UserModel} from '../models'
import BaseListStore, {SimpleListFetcher} from './BaseListStore'

export class AvailableToChatStore extends BaseListStore<UserModel> {
  constructor() {
    super(new SimpleListFetcher(api.availableToChat, api.availableToChat))
  }
}

import {action, makeAutoObservable} from 'mobx'

import {api} from '../api/api'
import {
  appEventEmitter,
  sendUpdateFollowingState,
  UpdateFollowingState,
} from '../appEventEmitter'
import {UserModel} from '../models'
import BaseListStore, {SimpleListFetcher} from './BaseListStore'

class InternalStore extends BaseListStore<UserModel> {
  private readonly eventDisposable: (() => void) | null = null

  constructor(userId: string, pendingOnly: boolean, mutualOnly: boolean) {
    super(
      new SimpleListFetcher(
        async () => api.fetchFollowers(userId, pendingOnly, mutualOnly),
        async (lastValue: string) =>
          api.fetchFollowers(userId, pendingOnly, mutualOnly, lastValue),
      ),
    )
    this.eventDisposable = appEventEmitter.on(
      'updateFollowingState',
      this.onUpdateFollowingState,
    )
  }

  onUpdateFollowingState = (params: UpdateFollowingState) => {
    const user = this.list.find((item) => item.id === params.userId)
    if (!user) return
    user.isFollowing = params.state
  }

  clear() {
    this.eventDisposable?.()
    super.clear()
  }
}

export class FollowersStore {
  readonly internalStore: InternalStore

  constructor(
    userId: string,
    options?: {
      pendingOnly?: boolean
      mutualOnly?: boolean
    },
  ) {
    this.internalStore = new InternalStore(
      userId,
      options?.pendingOnly ?? false,
      options?.mutualOnly ?? false,
    )
    makeAutoObservable(this)
  }

  @action
  onFollowingStateChanged = (isFollowing: boolean, index: number) => {
    const user = this.internalStore.list[index]
    if (!user) return
    user.isFollowing = isFollowing
    sendUpdateFollowingState({userId: user.id, state: isFollowing})
  }

  clear() {
    this.internalStore.clear()
  }
}

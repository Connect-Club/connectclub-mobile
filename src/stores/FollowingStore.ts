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
  private readonly userId: string
  private readonly eventDisposable: (() => void) | null = null

  constructor(userId: string, exceptMutual: boolean) {
    super(
      new SimpleListFetcher(
        async () => api.fetchFollowing(this.userId, exceptMutual),
        async (lastValue: string) =>
          api.fetchFollowing(this.userId, exceptMutual, lastValue),
      ),
    )
    this.userId = userId
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

export class FollowingStore {
  readonly internalStore: InternalStore

  constructor(userId: string, exceptMutual: boolean) {
    this.internalStore = new InternalStore(userId, exceptMutual)
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

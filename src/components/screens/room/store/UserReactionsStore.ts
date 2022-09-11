import {action, makeAutoObservable, observable} from 'mobx'

import {EmojiType} from '../models/jsonModels'
import {UserReaction} from '../models/localModels'
import {logJS} from '../modules/Logger'

type SendEndReaction = (userId: string) => void
export default class UserReactionsStore {
  constructor() {
    makeAutoObservable(this)
  }

  @observable
  reactions = new Map<string, UserReaction>()

  sendEndReaction!: SendEndReaction
  private timeoutHandles = new Map<string, ReturnType<typeof setTimeout>>()

  @action
  setReaction = (userId: string, type: EmojiType, duration: number) => {
    logJS(
      'info',
      'UserReactionsStore: set reaction',
      type,
      'for',
      userId,
      '; duration:',
      duration,
    )
    if (type === EmojiType.none) {
      this.resetReaction(userId)
      return
    }

    this.reactions.set(userId, {
      userId: userId,
      type: type,
      duration: duration,
    })

    this.scheduleReactionReset(userId, duration)
  }

  @action
  resetReaction = (userId: string) => {
    logJS('info', 'UserReactionsStore: reset reaction for', userId)
    let current = this.timeoutHandles.get(userId)
    if (current) {
      this.timeoutHandles.delete(userId)
      clearTimeout(current)
    }
    if (!this.reactions.delete(userId)) return
  }

  hasReaction = (userId: string) => {
    return this.reactions.has(userId)
  }

  private scheduleReactionReset = (userId: string, duration: number) => {
    const current = this.timeoutHandles.get(userId)
    if (current) clearTimeout(current)
    const handle = setTimeout(() => {
      this.resetReaction(userId)
      this.timeoutHandles.delete(userId)
      this.sendEndReaction(userId)
    }, duration * 1000)
    this.timeoutHandles.set(userId, handle)
  }
}

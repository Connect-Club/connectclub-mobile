import {
  action,
  makeAutoObservable,
  observable,
  reaction,
  runInAction,
} from 'mobx'

import buildConfig from '../buildConfig'
import {RoomManager} from '../components/screens/room/jitsi/RoomManager'
import UserManager from '../components/screens/room/jitsi/UserManager'
import {logJS} from '../components/screens/room/modules/Logger'
import MakeInviteStore from './MakeInviteStore'

const TIMEOUT_SECONDS =
  (buildConfig.releaseStage === 'staging' ? 10 : 60) * 1000
const BEGIN_USERS_COUNT_TARGET = buildConfig.releaseStage === 'staging' ? 2 : 10
const TARGET_MULTIPLIER = 2

export default class RoomInviteStore {
  readonly makeInviteStore: MakeInviteStore

  @observable
  isInviteBlockVisible: boolean = false

  private readonly clearEffects: () => void
  private roomUsersCount = 0
  private targetUsersCount = BEGIN_USERS_COUNT_TARGET
  private timeoutId: ReturnType<typeof setTimeout> | null = null
  private isFinished = false

  constructor(
    private readonly userManager: UserManager,
    private readonly roomManager: RoomManager,
  ) {
    this.makeInviteStore = new MakeInviteStore()
    makeAutoObservable(this)
    const clearRoomUsersEffect = reaction(
      () => this.userManager.roomUsers,
      () => {
        this.onRoomUsersCountChanged()
      },
    )
    const clearListenersEffect = reaction(
      () => this.userManager.listenersCount,
      () => {
        this.onRoomUsersCountChanged()
      },
    )
    this.clearEffects = () => {
      clearRoomUsersEffect()
      clearListenersEffect()
    }
    logJS('debug', 'RoomInviteStore', 'created')
  }

  finish = () => {
    logJS('debug', 'RoomInviteStore', 'finish')
    this.isFinished = true
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    this.dismissInvite()
  }

  @action
  dismissInvite = () => {
    logJS('debug', 'RoomInviteStore', 'dismiss invite block')
    if (!this.isInviteBlockVisible) {
      logJS('debug', 'RoomInviteStore', 'already dismissed')
      return
    }
    this.timeoutId = null
    this.isInviteBlockVisible = false
    logJS('debug', 'RoomInviteStore', 'current target', this.targetUsersCount)
    this.targetUsersCount = this.targetUsersCount * TARGET_MULTIPLIER
    logJS('debug', 'RoomInviteStore', 'next target', this.targetUsersCount)
  }

  clear = () => {
    logJS('debug', 'RoomInviteStore', 'clear')
    this.clearEffects()
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
    }
  }

  private onRoomUsersCountChanged = () => {
    if (this.isFinished) {
      logJS(
        'debug',
        'RoomInviteStore',
        'room uses count changed; already finished',
      )
      return
    }
    this.roomUsersCount =
      this.userManager.listenersCount + this.userManager.roomUsers.length
    logJS(
      'debug',
      'RoomInviteStore',
      'room uses count changed',
      this.roomUsersCount,
    )
    if (this.roomUsersCount < this.targetUsersCount) {
      logJS(
        'debug',
        'RoomInviteStore',
        'target users count (',
        this.targetUsersCount,
        ') not reached:',
        this.roomUsersCount,
      )
      if (this.timeoutId) {
        clearTimeout(this.timeoutId)
        this.timeoutId = null
        logJS('debug', 'RoomInviteStore', 'cleared timeout')
      }
      return
    }
    logJS(
      'debug',
      'RoomInviteStore',
      'target users count reached',
      this.targetUsersCount,
      '(',
      this.roomUsersCount,
      ')',
    )
    if (this.timeoutId) {
      logJS('debug', 'RoomInviteStore', 'timeout already set')
      return
    }

    logJS('debug', 'RoomInviteStore', 'set timeout to', TIMEOUT_SECONDS)

    this.timeoutId = setTimeout(() => {
      if (this.roomManager.roomMode === 'popup') {
        this.handleNextThresholdReached()
      } else {
        logJS(
          'debug',
          'RoomInviteStore',
          'wont show invite block because not in popup',
        )
        this.timeoutId = null
      }
    }, TIMEOUT_SECONDS)
  }

  private handleNextThresholdReached = () => {
    logJS(
      'debug',
      'RoomInviteStore',
      'handle threshold reach; current users',
      this.roomUsersCount,
    )
    runInAction(() => {
      this.isInviteBlockVisible = true
    })
  }
}

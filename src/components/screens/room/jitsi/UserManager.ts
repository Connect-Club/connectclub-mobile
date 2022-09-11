import {
  action,
  computed,
  makeAutoObservable,
  observable,
  runInAction,
} from 'mobx'

import {api} from '../../../../api/api'
import {hideLoading, showLoading} from '../../../../appEventEmitter'
import {Unknown, UserModel} from '../../../../models'
import {Participant, WsCurrentUser} from '../models/jsonModels'
import {
  participantToRoomUser,
  updateCurrentUserFromWs,
  updateUserFromWs,
} from '../models/mappers'
import {logJS} from '../modules/Logger'

export default class UserManager {
  readonly currentUserId: string

  @observable
  user: WsCurrentUser = {
    isAdmin: false,
    isHandRaised: false,
    mode: 'popup',
    isAbsoluteSpeaker: this.currentUser?.isAbsoluteSpeaker ?? false,
  }

  @observable
  isConnected = false

  @computed
  get isAdmin(): boolean {
    return this.user.isAdmin
  }

  get isNotAdmin(): boolean {
    return !this.isAdmin
  }

  @computed
  get currentUser(): Participant | undefined {
    if (!this.usersMap) return
    return this.usersMap.get(this.currentUserId)
  }

  constructor(currentUserId: string) {
    this.currentUserId = currentUserId
    makeAutoObservable(this)
  }

  @observable
  usersMap = new Map<string, Participant>()

  @computed
  get roomUsers(): Array<Participant> {
    return Array.from(this.usersMap.values())
  }

  @observable
  raisedHands: Array<UserModel> = []

  @observable
  adminUsers: Array<UserModel> = []

  @observable
  listenersCount = 0

  @computed
  get speakersCount(): number {
    return this.usersMap.size
  }

  @action
  updateListenersCount = (newCount: number) => {
    this.listenersCount = newCount
  }

  updateCurrentUser = (newUser: WsCurrentUser) => {
    updateCurrentUserFromWs(newUser, this.user)
    if (!this.isConnected) this.isConnected = true
  }

  setParticipants = (participants: Array<Participant> | Unknown) => {
    if (!participants) return
    logJS('info', 'setParticipants')
    const values = participants
    const newS = new Set<string>()
    values.forEach((v) => newS.add(v.id))
    this.usersMap.forEach((u) => {
      if (!newS.has(u.id)) this.usersMap.delete(u.id)
    })

    for (const user of values) {
      const oldRoomUser = this.usersMap.get(user.id)
      if (user.isLocal) {
        if (this.user.mode !== user.mode) this.user.mode = user.mode
        if (this.user.isAdmin !== user.isAdmin) this.user.isAdmin = user.isAdmin
      }
      if (!oldRoomUser) {
        this.usersMap.set(user.id, participantToRoomUser(user))
      } else {
        updateUserFromWs(user, oldRoomUser)
      }
    }
  }

  removeFromRaisedHands(id: string) {
    this.raisedHands = this.raisedHands.filter((h) => h.id !== id)
  }

  updateRaisedHands = async (handsJson: string) => {
    if (!this.user.isAdmin) return
    logJS('info', 'updateRaisedHands')

    if (this.raisedHands.length === 0) showLoading()

    const hands = JSON.parse(handsJson)
    const response = await api.fetchListUsers(hands)
    runInAction(() => {
      if (response.data) this.raisedHands = response.data
      hideLoading()
    })
  }

  fetchAdminUsers = async (adminsJson: string) => {
    if (!this.user.isAdmin) return
    if (this.adminUsers.length === 0) showLoading()

    const admins = JSON.parse(adminsJson)
    const response = await api.fetchListUsers(admins)
    runInAction(() => {
      if (response.data) this.adminUsers = response.data
      hideLoading()
      logJS('debug', 'fetchAdminUsers admins:', adminsJson)
    })
  }

  toggleAdmin = (id: string, type: string) => {
    if (id === this.currentUserId) {
      this.user.isAdmin = type === 'add'
    }
  }

  @action
  handUp = () => {
    this.user.isHandRaised = true
  }

  @action
  handDown = () => {
    this.user.isHandRaised = false
  }

  findSpeakerById = (id: string): Participant | undefined =>
    this.usersMap.get(id)

  removeFromAdmins = (id: string) => {
    runInAction(() => {
      this.adminUsers = this.adminUsers.filter((a) => a.id !== id)
    })
  }

  destroy() {
    this.usersMap.clear()
  }
}

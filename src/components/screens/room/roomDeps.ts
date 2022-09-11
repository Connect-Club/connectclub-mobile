import {storage} from '../../../storage'
import {RoomManager} from './jitsi/RoomManager'
import UserManager from './jitsi/UserManager'
import {ConnectClubAppModule} from './modules/AppModule'
import UserReactionsStore from './store/UserReactionsStore'

export interface RoomDeps {
  readonly userManager: UserManager
  readonly roomManager: RoomManager
  readonly reactionsStore: UserReactionsStore
}

interface MutableDepsContainer {
  deps: RoomDeps | null
  destroyDeps: () => void
}

interface DepsContainer {
  readonly deps: RoomDeps
  readonly destroyDeps: () => void
}

interface CurrentDepsContainer {
  readonly deps: RoomDeps | null
  readonly destroyDeps: () => void
}

const roomDeps: MutableDepsContainer = {
  deps: null,
  destroyDeps: () => {},
}

/**
 * Return current room dependencies or throw Error
 * */
export const getCurrentRoomDeps = () => roomDeps as CurrentDepsContainer

/**
 * Must be used in RoomScreen only.
 * */
export const useRoomDeps = () => {
  const deps = roomDeps.deps
  if (deps === null) {
    const userId = storage.currentUser?.id
    if (!userId) throw new Error(`user is not authorized`)
    const userManager = new UserManager(userId)

    const reactionsStore = new UserReactionsStore()
    const appModule = new ConnectClubAppModule()
    const roomManager = new RoomManager(
      userManager,
      appModule,
      reactionsStore.setReaction,
    )
    appModule.roomManager = roomManager
    reactionsStore.sendEndReaction = roomManager.sendEndReaction
    roomDeps.deps = {
      userManager,
      roomManager,
      reactionsStore,
    }
    roomDeps.destroyDeps = async () => {
      await roomDeps.deps?.roomManager.destroy()
      roomDeps.deps = null
    }
  }
  return roomDeps as DepsContainer
}

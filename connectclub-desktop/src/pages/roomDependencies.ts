import UserManager from '../../../src/components/screens/room/jitsi/UserManager'
import {logJS} from '../../../src/components/screens/room/modules/Logger'
import UserReactionsStore from '../../../src/components/screens/room/store/UserReactionsStore'

import {MediaStore} from '../stores/MediaStore'
import {RoomStore} from '../stores/RoomStore'
import electronChannel from '../utils/ElectronChannel'

export interface RoomDeps {
  readonly userManager: UserManager
  readonly mediaStore: MediaStore
  readonly roomStore: RoomStore
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

const roomDeps: MutableDepsContainer = {
  deps: null,
  destroyDeps: () => {},
}

/**
 * Must be used in RoomScreen only.
 * */
export const useRoomDependencies = (currentUserId: string | null) => {
  const deps = roomDeps.deps

  if (deps === null) {
    if (!currentUserId) throw new Error(`user is not authorized`)
    const userManager = new UserManager(currentUserId)
    const reactionsStore = new UserReactionsStore()
    const mediaStore = new MediaStore()

    const roomStore = new RoomStore(userManager, mediaStore, reactionsStore)
    reactionsStore.sendEndReaction = roomStore.sendEndReaction

    roomDeps.deps = {
      userManager,
      roomStore,
      mediaStore,
      reactionsStore,
    }

    const hideVideo = roomDeps.deps.roomStore.hideVideo
    const restoreVideo = roomDeps.deps.roomStore.restoreVideo

    electronChannel.on('hide-video', hideVideo)
    electronChannel.on('restore-video', restoreVideo)

    roomDeps.destroyDeps = async () => {
      logJS('debug', 'roomDependencies destroy deps')
      electronChannel.off('hide-video', hideVideo)
      electronChannel.off('restore-video', restoreVideo)
      await roomDeps.deps?.roomStore.destroy()
      roomDeps.deps = null
    }
  }

  return roomDeps as DepsContainer
}

import WsDelegate from '../../../src/components/screens/room/jitsi/WsDelegate'
import {
  ChangeRoomMode,
  PopupUsers,
} from '../../../src/components/screens/room/models/jsonModels'

export default interface ExtendedWsDelegate extends WsDelegate {
  readonly onPath: (path: any) => void
  readonly onNativeState: (nativeState: any[]) => void
  readonly onPopupUsers: (popupUsers: PopupUsers) => void
  readonly onChangeRoomMode: (roomMode: ChangeRoomMode) => void
  readonly switchOffVideo: () => void
  readonly switchOffAudio: () => void
}

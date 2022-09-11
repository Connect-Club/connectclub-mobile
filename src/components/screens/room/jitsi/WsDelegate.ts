import {EmojiType, WebsocketState} from '../models/jsonModels'

export type RaiseHandRequestType =
  | 'request'
  | 'reject'
  | 'invite'
  | 'declineInvite'

export default interface WsDelegate {
  readonly onReaction: (
    fromId: string,
    reactionType: EmojiType,
    duration: number,
  ) => void

  readonly onState: (state: WebsocketState) => void

  readonly onRaiseHandRequested: (
    id: string,
    type: RaiseHandRequestType,
    fromId: string,
    fromName: string,
    fromSurname: string,
  ) => void

  readonly onAdminChange: (
    id: string,
    type: 'add' | 'remove',
    fromName: string,
    fromSurname: string,
  ) => void

  readonly onSilentModeChange: (isEnabled: boolean) => void

  readonly onAbsoluteSpeakerChange: (
    id: string,
    type: 'set' | 'clear',
    fromName: string,
    fromSurname: string,
  ) => void
}

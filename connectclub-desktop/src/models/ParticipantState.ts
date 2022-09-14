import {UserPosition} from '../../../src/components/screens/room/models/localModels'

/**
 * Represents room user state
 */
export type ParticipantState = UserPosition & {
  audioLevel?: number
}

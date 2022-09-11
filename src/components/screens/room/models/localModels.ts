import {EmojiType} from './jsonModels'

export interface UserReaction {
  readonly userId: string
  readonly type: EmojiType
  readonly duration: number
}

export interface RadarState {
  readonly radius: number
  readonly isSubscriber: boolean
}

export interface RoomBackground {
  readonly minZoom: number
  readonly maxZoom: number
  readonly initialZoom: number
  readonly originalName: string
  readonly source: any
  readonly realWidth: number
  readonly realHeight: number
  readonly bgSize: string | null
  readonly multiplier: number
  readonly adaptiveBubbleSize: number
  readonly adaptiveWidth: number
  readonly adaptiveHeight: number
}

export enum MediaState {
  OFF,
  ON,
  LOADING,
}

export type LocalMediaState = {
  audio: MediaState
  video: MediaState
}

export interface UserPosition {
  x: number
  y: number
  duration?: number
}

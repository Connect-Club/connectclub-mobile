import {ImageSourcePropType} from 'react-native'

import {RoomSettings} from '../components/screens/room/models/jsonModels'
import {RoomBackground} from '../components/screens/room/models/localModels'
import {getAdaptiveMultiplier} from '../components/screens/room/Utils'
import {setSizeForAvatar} from './avatar.utils'

export const getRoomBackground = (
  roomSettings: RoomSettings,
): RoomBackground => {
  const {
    uiConfig: {background, bubbleSize},
  } = roomSettings
  const bgWidth = background.width
  const bgHeight = background.height
  const adaptiveMultiplier = getAdaptiveMultiplier(bgWidth)
  const bgSize = `${bgWidth},${bgHeight}`
  const source: ImageSourcePropType = {
    uri: setSizeForAvatar(background.resizerUrl, bgWidth, bgHeight),
  }

  return {
    minZoom: background.minZoom,
    maxZoom: bgWidth / bubbleSize,
    initialZoom: background.initialZoom,
    realWidth: bgWidth,
    realHeight: bgHeight,
    bgSize: bgSize,
    multiplier: adaptiveMultiplier,
    adaptiveWidth: bgWidth,
    adaptiveHeight: bgHeight,
    originalName: background.originalName,
    source: source,
    adaptiveBubbleSize: bubbleSize,
  }
}

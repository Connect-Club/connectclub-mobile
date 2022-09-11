import {ImageSourcePropType, Platform} from 'react-native'

import {RoomSettings} from '../components/screens/room/models/jsonModels'
import {RoomBackground} from '../components/screens/room/models/localModels'
import {logJS} from '../components/screens/room/modules/Logger'
import {getAdaptiveMultiplier} from '../components/screens/room/Utils'
import {setSizeForAvatar} from './avatar.utils'

export const getRoomBackground = (
  roomSettings: RoomSettings,
): RoomBackground => {
  const {
    uiConfig: {background, bubbleSize},
  } = roomSettings

  const delimiter = roomSettings.uiConfig.withSpeakers ? 0.542 : 1
  const bgWidth = background.width
  const bgHeight = background.height

  const bgMultiplier = getAdaptiveMultiplier(bgWidth)
  const adaptiveMultiplier = bgMultiplier * delimiter
  const scaledBgWidth = bgWidth * bgMultiplier
  const scaledBgHeight = bgHeight * bgMultiplier
  const adaptiveWidth = bgWidth * adaptiveMultiplier
  const adaptiveHeight = bgHeight * adaptiveMultiplier
  const bgSize = `${adaptiveWidth},${adaptiveHeight}`
  const source: ImageSourcePropType = {
    uri: setSizeForAvatar(background.resizerUrl, scaledBgWidth, scaledBgHeight),
  }

  const bg = {
    minZoom: background.minZoom,
    maxZoom:
      Platform.OS === 'web' ? background.maxZoom / 2 : background.maxZoom,
    initialZoom: background.initialZoom,
    realWidth: scaledBgWidth,
    realHeight: scaledBgHeight,
    bgSize: bgSize,
    multiplier: adaptiveMultiplier,
    adaptiveWidth: adaptiveWidth,
    adaptiveHeight: adaptiveHeight,
    originalName: background.originalName,
    source: source,
    adaptiveBubbleSize: bubbleSize * adaptiveMultiplier,
  }
  logJS('debug', 'room-settings bg config:', JSON.stringify(bg))

  return bg
}

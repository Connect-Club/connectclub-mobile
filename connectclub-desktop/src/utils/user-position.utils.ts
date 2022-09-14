import {ParticipantState} from '../models/ParticipantState'

export const getRelativeParticipantState = (
  {x, y, duration, audioLevel}: ParticipantState,
  userSize: number,
  width: number,
  height: number,
): ParticipantState => {
  return {
    x: calculateRelativeCoordinate(userSize, x, width),
    y: calculateRelativeCoordinate(userSize, y, height),
    duration,
    audioLevel,
  }
}

const calculateRelativeCoordinate = (
  userSize: number,
  coordinate: number,
  side: number,
): number => {
  // Offset is half of avatar size in relative coords
  const avatarOffset = (userSize * 50) / side

  const relativeCoordinate = (coordinate * 100) / side - avatarOffset
  return relativeCoordinate < 0 ? 0 : relativeCoordinate
}

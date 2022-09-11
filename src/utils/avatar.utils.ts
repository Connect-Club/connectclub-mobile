import {RasterIconType} from '../assets/rasterIcons'
import {Unknown, UserClubRole, UserModel} from '../models'

export function setSizeForAvatar(
  url: string,
  width: number,
  height: number,
): string {
  return url
    .replace(':WIDTH', Math.round(width).toString())
    .replace(':HEIGHT', Math.round(height).toString())
}

export const getClubRoleBadgeForUser = (
  clubRole?: UserClubRole | Unknown,
): RasterIconType | undefined => {
  switch (clubRole) {
    case 'owner':
      return 'ic_crown'
    case 'moderator':
      return 'ic_crown_moderator'
    default:
      return undefined
  }
}

export const getSpecialRoleBadgeForUser = (
  u: UserModel,
): RasterIconType | undefined => {
  if (u.isSpecialGuest) return 'ic_star_orange_16'
  return
}

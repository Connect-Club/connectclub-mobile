import {Unknown, UserClubRole} from '../models'

export const isJoinedClub = (role: UserClubRole | Unknown): boolean =>
  role === 'member' || role === 'moderator' || role === 'owner'

export const isAtLeastClubModerator = (role: UserClubRole | Unknown): boolean =>
  role === 'moderator' || role === 'owner'

import {AppIconType} from '../assets/AppIcon'
import {RasterIconType} from '../assets/rasterIcons'
import {Unknown, UserBadge, UserModel} from '../models'
import {replaceAll} from './stringHelpers'

export function getUserShortName(user: UserModel | Unknown): string {
  return profileShortName(user?.name, user?.surname)
}

export function shortFromDisplayName(displayName: string | Unknown): string {
  if (!displayName) return 'N/A'
  const [name, surname] = displayName.split(' ')
  return profileShortName(name, surname)
}

export const fullName = (user: UserModel | undefined): string => {
  return profileFullName(user?.name, user?.surname)
}

export const profileShortName = (
  name: string | Unknown,
  surname: string | Unknown,
): string => {
  let nameInitial = name?.[0]
  let surnameInitial = surname?.[0]
  let initials = ''
  if (nameInitial) initials += nameInitial
  if (surnameInitial) initials += surnameInitial
  if (initials.length === 0) initials = 'N/A'
  return initials.toUpperCase()
}

export const profileShortenSurname = (user: UserModel): string => {
  let surnameInitial = user.surname?.[0]
  if (!user.name) return user.surname ?? 'N/A'
  let name = user.name
  if (surnameInitial) name += ' ' + surnameInitial + '.'
  return name
}

export const profileFullName = (
  name: string | Unknown,
  surname: string | Unknown,
  splitByNewLine = false,
): string => {
  let title = ''
  if (name && name.length > 0) {
    title = `${name}`
  }

  if (surname && surname.length > 0) {
    if (title.length > 0 && !splitByNewLine) {
      title += ' '
    }
    if (splitByNewLine) {
      title += '\n'
    }
    title += `${surname}`
  }
  if (title.length === 0) {
    title = 'unknownUserName'
    if (splitByNewLine) {
      title = replaceAll(title, ' ', '\n')
    }
  }
  return title
}

export const profileCountryCity = (country?: string, city?: string): string => {
  if (country === undefined || city === undefined) return ''
  if (country.length === 0 || city.length === 0) return ''
  return `${city}, ${country}`
}

interface HighlightedPart {
  highlighted: boolean
  text: string
}

export const highlightWords = (
  text: string,
  words: Array<string>,
): Array<HighlightedPart> => {
  const batches = words
    .flatMap((name: string) => {
      const pos = text.indexOf(name)
      if (pos === -1) return []
      return [pos, pos + name.length]
    })
    .filter((pos: number) => pos !== -1 && pos !== 0)
  batches.push(text.length)
  let prevInd = 0
  return batches.map((pos: number) => {
    const start = prevInd
    prevInd = pos
    const part = text.substr(start, pos - start)
    return {highlighted: words.includes(part), text: part}
  })
}

const getPriorityRoleBadge = (
  badges: Array<UserBadge> | undefined,
): UserBadge | undefined => {
  if (!badges || badges.length === 0) return
  if (badges.length === 1) return badges[0]
  if (badges.includes('speaker')) return 'speaker'
  if (badges.includes('team')) return 'team'
  if (badges.includes('press')) return 'press'
  if (badges.includes('new')) return 'new'
  return badges[0]
}

export const getPriorityRoleBadgeIcon = (
  badges: Array<UserBadge> | undefined,
  isSpecialGuest: boolean | Unknown,
): AppIconType | undefined => {
  if (isSpecialGuest) return 'icStar16'
  const badge = getPriorityRoleBadge(badges)
  if (!badge) return
  switch (badge) {
    case 'press':
      return 'icPressTag'
    case 'speaker':
      return 'icSpeakerTag'
    case 'team':
      return 'icTeamTag'
    case 'new':
      return 'icNewbieTag'
  }
}

export const getCircleBadgeIcon = (
  badges: Array<UserBadge> | undefined,
  isAdmin: boolean,
  isSpecialGuest: boolean | undefined,
): RasterIconType | undefined => {
  if (isSpecialGuest) return 'ic_star_orange_16'
  if (badges?.length === 0 || !badges) {
    return isAdmin ? 'ic_crown' : undefined
  }
  if (badges.length === 1 && badges[0] === 'new')
    return isAdmin ? 'ic_crown' : 'ic_newbie'
  return isAdmin ? 'ic_special_moderator' : 'ic_special_guest'
}

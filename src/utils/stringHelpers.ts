import 'url-search-params-polyfill'

import {logJS} from '../components/screens/room/modules/Logger'
import {InitialDeeplink, UtmLabels} from '../models'

export const RELEASE_NOTES_URL =
  'https://connectclub.notion.site/Connect-Club-Release-Notes-7cc917d0f0eb4779b4ec792f204be8d8'

export function replaceAll(string: string, search: string, replace: string) {
  return string.split(search).join(replace)
}

function getRoomParamsFromLegacyUri(uri: string): InitialDeeplink {
  const url = uri.substring(uri.indexOf('?'))
  const params = new URLSearchParams(url)
  const clubId = params.get('clubId')
  const room = params.get('room')
  const pswd = params.get('pswd')
  const eventId = params.get('eventId')

  const clubParams = clubId ? {clubId} : undefined
  const roomParams = clubParams
    ? undefined
    : {
        room,
        pswd,
        eventId,
      }
  return {clubParams, roomParams}
}

export function getRoomParamsFromUri(uri: string): InitialDeeplink | undefined {
  const deepLinkValue = getParameterValueFromUri(uri, 'deep_link_value')
  if (!deepLinkValue) {
    return getRoomParamsFromLegacyUri(uri)
  }
  const dp = deepLinkValue.split('_')
  if (!dp.includes('roomId') && !dp.includes('pwsd')) return
  return {
    roomParams: {
      room: dp[dp.indexOf('roomId') + 1],
      pswd: dp[dp.indexOf('pswd') + 1],
      eventId: null,
    },
  }
}

const queryParamRegex = /[?&]([^=#]+)=([^&#]*)/g

function getQueryParams(uri: string): Map<string, string> {
  const params: Map<string, string> = new Map()
  let match: RegExpExecArray | null
  while ((match = queryParamRegex.exec(uri))) {
    params.set(match[1], match[2])
  }
  return params
}

export function getParameterValueFromUri(
  uri: string,
  parameter: string,
): string | undefined {
  if (!uri) return
  const index = uri.indexOf('?')
  if (index < 0) return
  const params = getQueryParams(uri)
  if (!params.has(parameter)) return
  return params.get(parameter)
}

function getParameterValueFromDeepLink(
  uri: string | undefined,
  parameter: string,
): string | undefined {
  if (!uri) return
  logJS('debug', 'stringHelpers', 'get parameter', parameter, 'from uri', uri)
  const value = getParameterValueFromUri(uri, parameter)
  if (value) return value
  const deepLinkValue = getParameterValueFromUri(uri, 'deep_link_value')
  if (!deepLinkValue) return
  logJS('debug', 'stringHelpers', 'seek param', parameter, 'in', deepLinkValue)
  const encodedParts = deepLinkValue.split('~')
  for (const part of encodedParts) {
    const matchIndex = part.indexOf(parameter + '_')
    if (matchIndex < 0) {
      logJS('debug', 'stringHelpers', 'no match for', parameter, 'in', part)
      continue
    }
    const found = part.slice(matchIndex + parameter.length + 1)
    if (found.length === 0) {
      logJS('debug', 'stringHelpers', 'found zero size', parameter, 'in', part)
      continue
    }
    const values = found.split('_')
    const paramValue = values[0]
    logJS(
      'debug',
      'stringHelpers',
      'found',
      parameter,
      'value',
      paramValue,
      'in',
      part,
    )
    return paramValue
  }
  return
}

export function getUtmLabelsFromUri(uri: string): UtmLabels | undefined {
  const campaign = getParameterValueFromUri(uri, 'utm_campaign')
  const source = getParameterValueFromUri(uri, 'utm_source')
  const content = getParameterValueFromUri(uri, 'utm_content')
  if (!campaign && !source && !content) return
  return {
    campaign,
    source,
    content,
  }
}

export function getUtmLabelsFromDeepLinkValue(
  value: string | undefined,
): (UtmLabels & {landingDeviceId?: string}) | undefined {
  if (!value) return

  const dp_sub = value.split('~')
  const landingDeviceId = dp_sub.length > 0 ? dp_sub[0] : undefined
  const campaign = dp_sub.length > 1 ? dp_sub[1] : undefined
  const content = dp_sub.length > 2 ? dp_sub[2] : undefined
  const source = dp_sub.length > 3 ? dp_sub[3] : undefined
  if (!campaign && !source && !content) return
  return {
    landingDeviceId,
    campaign,
    source,
    content,
  }
}

export function getClubIdFromUri(uri?: string): string | undefined {
  return getParameterValueFromDeepLink(uri, 'clubId')
}

export function getUsernameFromUri(uri?: string): string | undefined {
  return getParameterValueFromDeepLink(uri, 'u')
}

export function getEventIdFromUri(uri?: string): string | undefined {
  return getParameterValueFromDeepLink(uri, 'eventId')
}

export function getInviteCodeFromUri(uri?: string): string | undefined {
  return getParameterValueFromDeepLink(uri, 'invite')
}

export function pad(num: number, size: number) {
  let text = num.toString()
  while (text.length < size) text = `0${text}`
  return text
}

export const getUserNameWithClubSuffix = (name?: string | null) => {
  if (!name) return ''
  return `${name}'s Club`
}

const htmlEntities = new Map<string, string>([
  ['&amp;', '&'],
  ['&lt;', '<'],
  ['&gt;', '>'],
  ['&quot;', '"'],
  ['&apos;', "'"],
  ['&#39;', "'"],
])

export function decodeHtmlEntities(input: string): string {
  let output = input
  for (const [key, value] of htmlEntities) {
    output = output.replace(key, value)
  }
  return output
}

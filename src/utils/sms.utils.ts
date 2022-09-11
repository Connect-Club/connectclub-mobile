import {NativeModules, Platform, Share} from 'react-native'

import buildConfig from '../buildConfig'
import {
  alert,
  Clipboard,
  Sms,
} from '../components/webSafeImports/webSafeImports'
import {toastHelper} from './ToastHelper'

export const openInviteSms = (phone: string, displayName: string) => {
  const name = phone === displayName ? 'Hey' : `Hey ${displayName}`
  const body = `${name} - I have an invite to
  Connect.Club and want you to join.
  I added you using ${phone}.
  so make sure to use that number when
  you register. Here is the link!
  https://app.cnnct.club/join`

  if (Platform.OS === 'ios') {
    NativeModules.RNMessageComposer.send(phone, body)
  } else {
    Sms.sms(phone, body)
  }
}

export const shareLink = (link: string) => {
  if (Platform.OS === 'android') {
    Share.share({message: link})
  } else if (Platform.OS === 'web') {
    alert('Sharing link', link, [
      {text: 'Close', style: 'default'},
      {
        text: 'Copy link',
        style: 'cancel',
        onPress: () => Clipboard.setString(link),
      },
    ])
  } else {
    Share.share({url: link})
  }
}

const sharedHost =
  buildConfig.releaseStage === 'production'
    ? 'connect.club'
    : 'stage.connect.club'

const makeWebRedirectLink = (utmCampaign?: string) => {
  let link = `https://${sharedHost}/web`
  if (utmCampaign) {
    link += `?utm_campaign=${utmCampaign}`
  }
  return encodeURIComponent(link)
}

export const linkCode =
  buildConfig.releaseStage === 'production' ? 'ecff227c' : '3d6351c7'

export const getProfileLink = (
  username: string,
  inviteCode?: string,
  campaign: string = 'share_profile',
) => {
  const inviteFlag = inviteCode ? `&invite=1` : ''
  const afr = encodeURIComponent(
    `https://${sharedHost}/user/${username}?utm_campaign=${campaign}${inviteFlag}`,
  )
  const sub = `deep_link_sub1=~share_profile`
  let deepLinkValue = `u_${username}`
  if (inviteCode) {
    deepLinkValue += `~invite_${inviteCode}`
  }
  const link = `https://app.connect.club/W0Im/${linkCode}?deep_link_value=${deepLinkValue}&${sub}&af_r=`
  if (Platform.OS === 'ios') return encodeURI(link) + afr

  return link + afr
}

export const getClubLink = (clubId: string, slug: string) => {
  const afr = encodeURIComponent(
    `https://${sharedHost}/club/${slug}?utm_campaign=share_club`,
  )
  const sub = `deep_link_sub1=~share_club`
  let deepLinkValue = `deep_link_value=clubId_${clubId}`
  const link = `https://app.connect.club/W0Im/${linkCode}?${deepLinkValue}&${sub}&af_r=`
  if (Platform.OS === 'ios') return encodeURI(link) + afr
  return link + afr
}

export const shareClubDialog = (clubId: string, slug: string) => {
  return shareLink(getClubLink(clubId, slug))
}

export const getRoomLink = (
  roomId: string,
  roomPass: string,
  inviteCode?: string,
) => {
  const sub = `deep_link_sub1=~share_room`
  let deepLinkValue = `deep_link_value=roomId_${roomId}_pswd_${roomPass}`
  if (inviteCode) {
    deepLinkValue += `_invite_${inviteCode}`
  }
  const afWebDp = `af_web_dp=${makeWebRedirectLink('share_room')}`
  return `https://app.connect.club/W0Im/${linkCode}?${deepLinkValue}&${sub}&${afWebDp}`
}

export const getEventLink = (
  eventId: string,
  clubSlug?: string,
  clubId?: string,
  utmCampaign?: string,
  inviteCode?: string,
) => {
  let deepLinkValue = ''
  if (clubId) {
    deepLinkValue += `clubId_${clubId}_`
  }
  deepLinkValue += `eventId_${eventId}`
  if (inviteCode) {
    deepLinkValue += `~invite_${inviteCode}`
  }
  let link = `https://app.connect.club/W0Im/${linkCode}?deep_link_value=${deepLinkValue}`
  if (utmCampaign) link += `&deep_link_sub1=~${utmCampaign}`
  if (clubSlug) {
    let afrRaw = `https://${sharedHost}/club/${clubSlug}?id=${eventId}`
    if (utmCampaign) afrRaw += `&utm_campaign=${utmCampaign}`
    const afr = encodeURIComponent(afrRaw)
    link += `&af_r=`
    if (Platform.OS === 'ios') {
      link = encodeURI(link) + afr
    } else {
      link += afr
    }
  }
  if (!clubId) {
    const afWebDp = `af_web_dp=${makeWebRedirectLink(
      utmCampaign ?? 'share_event',
    )}`
    link += '&' + afWebDp
  }

  return link
}

export const copyEventToClipboard = (
  eventId: string,
  clubSlug?: string,
  clubId?: string,
) => {
  Clipboard.setString(getEventLink(eventId, clubSlug, clubId, 'share_event'))
  toastHelper.success('linkCopied', true)
}

export const shareScreenLinkDialog = (link: string) => {
  shareLink(link)
}

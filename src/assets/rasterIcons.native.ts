/* eslint-disable */
import {ImageStyle, StyleProp} from 'react-native'

export type RasterIconType = 'gallert_preview' | 'icBadConnection' | 'icCalendarInterestsGradient' | 'icCalling' | 'icCamOff' | 'icCamOn' | 'icMicOff' | 'icMicOn' | 'icRoomButtonControlsGradient' | 'icScreenShare' | 'icSpeakerOn' | 'ic_crown' | 'ic_crown_moderator' | 'ic_flame' | 'ic_megaphone_on' | 'ic_newbie' | 'ic_special_guest' | 'ic_special_moderator' | 'ic_stage_cam_off' | 'ic_stage_mic_off' | 'ic_star_orange_16' | 'l_broadcast_background' | 'l_broadcasting' | 'l_broadcasting_preview' | 'l_multiroom' | 'l_multiroom_background' | 'l_multiroom_preview' | 'l_networking' | 'l_networking_background' | 'l_networking_preview' | 'networking_card_background' | 'icEmojiDisLike' | 'icEmojiHeart' | 'icEmojiHung' | 'icEmojiLaugh' | 'icEmojiLike' | 'icEmojiRaise' | 'icEmojiSad' | 'icEmojiSurprise' | 'icEmojiThink' | 'icEmojiWave' | 's_broadcast_background' | 's_broadcasting' | 's_broadcasting_preview' | 's_networking' | 's_networking_background' | 's_networking_preview' | 'stage_card_background'

export interface RasterIconProps {
  readonly type: RasterIconType
  readonly style?: StyleProp<ImageStyle>
  readonly accessibilityLabel?: string
  readonly circle?: boolean
  readonly scaleType?: 'centerInside' | 'fitCenter'
  readonly paddingHorizontal?: number
}

export const requireRasterIcon = (type: RasterIconType) => {
    switch (type) {
  case 'gallert_preview':
    return require('src/assets/img/gallert_preview.jpeg')
  case 'icBadConnection':
    return require('src/assets/img/icBadConnection.png')
  case 'icCalendarInterestsGradient':
    return require('src/assets/img/icCalendarInterestsGradient.png')
  case 'icCalling':
    return require('src/assets/img/icCalling.png')
  case 'icCamOff':
    return require('src/assets/img/icCamOff.png')
  case 'icCamOn':
    return require('src/assets/img/icCamOn.png')
  case 'icMicOff':
    return require('src/assets/img/icMicOff.png')
  case 'icMicOn':
    return require('src/assets/img/icMicOn.png')
  case 'icRoomButtonControlsGradient':
    return require('src/assets/img/icRoomButtonControlsGradient.png')
  case 'icScreenShare':
    return require('src/assets/img/icScreenShare.png')
  case 'icSpeakerOn':
    return require('src/assets/img/icSpeakerOn.png')
  case 'ic_crown':
    return require('src/assets/img/ic_crown.png')
  case 'ic_crown_moderator':
    return require('src/assets/img/ic_crown_moderator.png')
  case 'ic_flame':
    return require('src/assets/img/ic_flame.png')
  case 'ic_megaphone_on':
    return require('src/assets/img/ic_megaphone_on.png')
  case 'ic_newbie':
    return require('src/assets/img/ic_newbie.png')
  case 'ic_special_guest':
    return require('src/assets/img/ic_special_guest.png')
  case 'ic_special_moderator':
    return require('src/assets/img/ic_special_moderator.png')
  case 'ic_stage_cam_off':
    return require('src/assets/img/ic_stage_cam_off.png')
  case 'ic_stage_mic_off':
    return require('src/assets/img/ic_stage_mic_off.png')
  case 'ic_star_orange_16':
    return require('src/assets/img/ic_star_orange_16.png')
  case 'l_broadcast_background':
    return require('src/assets/img/l_broadcast_background.jpeg')
  case 'l_broadcasting':
    return require('src/assets/img/l_broadcasting.jpeg')
  case 'l_broadcasting_preview':
    return require('src/assets/img/l_broadcasting_preview.jpeg')
  case 'l_multiroom':
    return require('src/assets/img/l_multiroom.jpg')
  case 'l_multiroom_background':
    return require('src/assets/img/l_multiroom_background.jpg')
  case 'l_multiroom_preview':
    return require('src/assets/img/l_multiroom_preview.jpg')
  case 'l_networking':
    return require('src/assets/img/l_networking.jpeg')
  case 'l_networking_background':
    return require('src/assets/img/l_networking_background.jpg')
  case 'l_networking_preview':
    return require('src/assets/img/l_networking_preview.jpeg')
  case 'networking_card_background':
    return require('src/assets/img/networking_card_background.jpeg')
  case 'icEmojiDisLike':
    return require('src/assets/img/reactions/icEmojiDisLike.png')
  case 'icEmojiHeart':
    return require('src/assets/img/reactions/icEmojiHeart.png')
  case 'icEmojiHung':
    return require('src/assets/img/reactions/icEmojiHung.png')
  case 'icEmojiLaugh':
    return require('src/assets/img/reactions/icEmojiLaugh.png')
  case 'icEmojiLike':
    return require('src/assets/img/reactions/icEmojiLike.png')
  case 'icEmojiRaise':
    return require('src/assets/img/reactions/icEmojiRaise.png')
  case 'icEmojiSad':
    return require('src/assets/img/reactions/icEmojiSad.png')
  case 'icEmojiSurprise':
    return require('src/assets/img/reactions/icEmojiSurprise.png')
  case 'icEmojiThink':
    return require('src/assets/img/reactions/icEmojiThink.png')
  case 'icEmojiWave':
    return require('src/assets/img/reactions/icEmojiWave.png')
  case 's_broadcast_background':
    return require('src/assets/img/s_broadcast_background.jpeg')
  case 's_broadcasting':
    return require('src/assets/img/s_broadcasting.jpeg')
  case 's_broadcasting_preview':
    return require('src/assets/img/s_broadcasting_preview.jpeg')
  case 's_networking':
    return require('src/assets/img/s_networking.jpeg')
  case 's_networking_background':
    return require('src/assets/img/s_networking_background.jpeg')
  case 's_networking_preview':
    return require('src/assets/img/s_networking_preview.jpeg')
  case 'stage_card_background':
    return require('src/assets/img/stage_card_background.jpeg')
  }
}

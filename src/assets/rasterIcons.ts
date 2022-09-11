/* eslint-disable */
import {ImageStyle, StyleProp} from 'react-native'

export type RasterIconType = 'gallert_preview' | 'icBadConnection' | 'icBadConnection@2x' | 'icBadConnection@3x' | 'icBadConnection@4x' | 'icCalendarInterestsGradient' | 'icCalling' | 'icCamOff' | 'icCamOn' | 'icMicOff' | 'icMicOn' | 'icRoomButtonControlsGradient' | 'icScreenShare' | 'icScreenShare@2x' | 'icScreenShare@3x' | 'icScreenShare@4x' | 'icSpeakerOn' | 'icSpeakerOn@2x' | 'icSpeakerOn@3x' | 'icSpeakerOn@4x' | 'ic_crown' | 'ic_crown@2x' | 'ic_crown@3x' | 'ic_crown@4x' | 'ic_crown_moderator' | 'ic_crown_moderator@2x' | 'ic_crown_moderator@3x' | 'ic_crown_moderator@4x' | 'ic_flame' | 'ic_flame@2x' | 'ic_megaphone_on' | 'ic_megaphone_on@2x' | 'ic_megaphone_on@3x' | 'ic_megaphone_on@4x' | 'ic_newbie' | 'ic_newbie@2' | 'ic_newbie@3' | 'ic_newbie@4' | 'ic_special_guest' | 'ic_special_guest@2x' | 'ic_special_guest@3x' | 'ic_special_guest@4x' | 'ic_special_moderator' | 'ic_special_moderator@2x' | 'ic_special_moderator@3x' | 'ic_special_moderator@4x' | 'ic_stage_cam_off' | 'ic_stage_cam_off@2x' | 'ic_stage_cam_off@3x' | 'ic_stage_cam_off@4x' | 'ic_stage_mic_off' | 'ic_stage_mic_off@2x' | 'ic_stage_mic_off@3x' | 'ic_stage_mic_off@4x' | 'ic_star_orange_16' | 'ic_star_orange_16@2x' | 'ic_star_orange_16@3x' | 'ic_star_orange_16@4x' | 'l_broadcast_background' | 'l_broadcasting' | 'l_broadcasting_preview' | 'l_multiroom' | 'l_multiroom_background' | 'l_multiroom_preview' | 'l_networking' | 'l_networking_background' | 'l_networking_preview' | 'networking_card_background' | 'icEmojiDisLike' | 'icEmojiHeart' | 'icEmojiHung' | 'icEmojiLaugh' | 'icEmojiLike' | 'icEmojiRaise' | 'icEmojiSad' | 'icEmojiSurprise' | 'icEmojiThink' | 'icEmojiWave' | 's_broadcast_background' | 's_broadcasting' | 's_broadcasting_preview' | 's_networking' | 's_networking_background' | 's_networking_preview' | 'stage_card_background'

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
    return require('./img/gallert_preview.jpeg')
  case 'icBadConnection':
    return require('./img/icBadConnection.png')
  case 'icBadConnection@2x':
    return require('./img/icBadConnection@2x.png')
  case 'icBadConnection@3x':
    return require('./img/icBadConnection@3x.png')
  case 'icBadConnection@4x':
    return require('./img/icBadConnection@4x.png')
  case 'icCalendarInterestsGradient':
    return require('./img/icCalendarInterestsGradient.png')
  case 'icCalling':
    return require('./img/icCalling.png')
  case 'icCamOff':
    return require('./img/icCamOff.png')
  case 'icCamOn':
    return require('./img/icCamOn.png')
  case 'icMicOff':
    return require('./img/icMicOff.png')
  case 'icMicOn':
    return require('./img/icMicOn.png')
  case 'icRoomButtonControlsGradient':
    return require('./img/icRoomButtonControlsGradient.png')
  case 'icScreenShare':
    return require('./img/icScreenShare.png')
  case 'icScreenShare@2x':
    return require('./img/icScreenShare@2x.png')
  case 'icScreenShare@3x':
    return require('./img/icScreenShare@3x.png')
  case 'icScreenShare@4x':
    return require('./img/icScreenShare@4x.png')
  case 'icSpeakerOn':
    return require('./img/icSpeakerOn.png')
  case 'icSpeakerOn@2x':
    return require('./img/icSpeakerOn@2x.png')
  case 'icSpeakerOn@3x':
    return require('./img/icSpeakerOn@3x.png')
  case 'icSpeakerOn@4x':
    return require('./img/icSpeakerOn@4x.png')
  case 'ic_crown':
    return require('./img/ic_crown.png')
  case 'ic_crown@2x':
    return require('./img/ic_crown@2x.png')
  case 'ic_crown@3x':
    return require('./img/ic_crown@3x.png')
  case 'ic_crown@4x':
    return require('./img/ic_crown@4x.png')
  case 'ic_crown_moderator':
    return require('./img/ic_crown_moderator.png')
  case 'ic_crown_moderator@2x':
    return require('./img/ic_crown_moderator@2x.png')
  case 'ic_crown_moderator@3x':
    return require('./img/ic_crown_moderator@3x.png')
  case 'ic_crown_moderator@4x':
    return require('./img/ic_crown_moderator@4x.png')
  case 'ic_flame':
    return require('./img/ic_flame.png')
  case 'ic_flame@2x':
    return require('./img/ic_flame@2x.png')
  case 'ic_megaphone_on':
    return require('./img/ic_megaphone_on.png')
  case 'ic_megaphone_on@2x':
    return require('./img/ic_megaphone_on@2x.png')
  case 'ic_megaphone_on@3x':
    return require('./img/ic_megaphone_on@3x.png')
  case 'ic_megaphone_on@4x':
    return require('./img/ic_megaphone_on@4x.png')
  case 'ic_newbie':
    return require('./img/ic_newbie.png')
  case 'ic_newbie@2':
    return require('./img/ic_newbie@2.png')
  case 'ic_newbie@3':
    return require('./img/ic_newbie@3.png')
  case 'ic_newbie@4':
    return require('./img/ic_newbie@4.png')
  case 'ic_special_guest':
    return require('./img/ic_special_guest.png')
  case 'ic_special_guest@2x':
    return require('./img/ic_special_guest@2x.png')
  case 'ic_special_guest@3x':
    return require('./img/ic_special_guest@3x.png')
  case 'ic_special_guest@4x':
    return require('./img/ic_special_guest@4x.png')
  case 'ic_special_moderator':
    return require('./img/ic_special_moderator.png')
  case 'ic_special_moderator@2x':
    return require('./img/ic_special_moderator@2x.png')
  case 'ic_special_moderator@3x':
    return require('./img/ic_special_moderator@3x.png')
  case 'ic_special_moderator@4x':
    return require('./img/ic_special_moderator@4x.png')
  case 'ic_stage_cam_off':
    return require('./img/ic_stage_cam_off.png')
  case 'ic_stage_cam_off@2x':
    return require('./img/ic_stage_cam_off@2x.png')
  case 'ic_stage_cam_off@3x':
    return require('./img/ic_stage_cam_off@3x.png')
  case 'ic_stage_cam_off@4x':
    return require('./img/ic_stage_cam_off@4x.png')
  case 'ic_stage_mic_off':
    return require('./img/ic_stage_mic_off.png')
  case 'ic_stage_mic_off@2x':
    return require('./img/ic_stage_mic_off@2x.png')
  case 'ic_stage_mic_off@3x':
    return require('./img/ic_stage_mic_off@3x.png')
  case 'ic_stage_mic_off@4x':
    return require('./img/ic_stage_mic_off@4x.png')
  case 'ic_star_orange_16':
    return require('./img/ic_star_orange_16.png')
  case 'ic_star_orange_16@2x':
    return require('./img/ic_star_orange_16@2x.png')
  case 'ic_star_orange_16@3x':
    return require('./img/ic_star_orange_16@3x.png')
  case 'ic_star_orange_16@4x':
    return require('./img/ic_star_orange_16@4x.png')
  case 'l_broadcast_background':
    return require('./img/l_broadcast_background.jpeg')
  case 'l_broadcasting':
    return require('./img/l_broadcasting.jpeg')
  case 'l_broadcasting_preview':
    return require('./img/l_broadcasting_preview.jpeg')
  case 'l_multiroom':
    return require('./img/l_multiroom.jpg')
  case 'l_multiroom_background':
    return require('./img/l_multiroom_background.jpg')
  case 'l_multiroom_preview':
    return require('./img/l_multiroom_preview.jpg')
  case 'l_networking':
    return require('./img/l_networking.jpeg')
  case 'l_networking_background':
    return require('./img/l_networking_background.jpg')
  case 'l_networking_preview':
    return require('./img/l_networking_preview.jpeg')
  case 'networking_card_background':
    return require('./img/networking_card_background.jpeg')
  case 'icEmojiDisLike':
    return require('./img/reactions/icEmojiDisLike.png')
  case 'icEmojiHeart':
    return require('./img/reactions/icEmojiHeart.png')
  case 'icEmojiHung':
    return require('./img/reactions/icEmojiHung.png')
  case 'icEmojiLaugh':
    return require('./img/reactions/icEmojiLaugh.png')
  case 'icEmojiLike':
    return require('./img/reactions/icEmojiLike.png')
  case 'icEmojiRaise':
    return require('./img/reactions/icEmojiRaise.png')
  case 'icEmojiSad':
    return require('./img/reactions/icEmojiSad.png')
  case 'icEmojiSurprise':
    return require('./img/reactions/icEmojiSurprise.png')
  case 'icEmojiThink':
    return require('./img/reactions/icEmojiThink.png')
  case 'icEmojiWave':
    return require('./img/reactions/icEmojiWave.png')
  case 's_broadcast_background':
    return require('./img/s_broadcast_background.jpeg')
  case 's_broadcasting':
    return require('./img/s_broadcasting.jpeg')
  case 's_broadcasting_preview':
    return require('./img/s_broadcasting_preview.jpeg')
  case 's_networking':
    return require('./img/s_networking.jpeg')
  case 's_networking_background':
    return require('./img/s_networking_background.jpeg')
  case 's_networking_preview':
    return require('./img/s_networking_preview.jpeg')
  case 'stage_card_background':
    return require('./img/stage_card_background.jpeg')
  }
}
